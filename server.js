var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var IPADDRESS = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var io = require('socket.io')(port);
var shortId = require('shortid');

var players = [];

var playerSpeed = 3;

console.log("server started on port " + port);

io.on('connection', function (socket) {
    
    var thisPlayerId = shortId.generate();
    var player = {
        id:thisPlayerId,
        destination:{
        x:0,
        y:0    
        },
        lastPosition:{
            x:0,
            y:0
        },
        lastMoveTime : 0,
        lat : 0,
        lan : 0
    };
    players[thisPlayerId] = player;
    
    console.log("client connected, id = ", thisPlayerId);
   
   socket.emit('register', {id:thisPlayerId});
    socket.broadcast.emit('spawn', {id:thisPlayerId});
    socket.broadcast.emit('requestPosition');
    
    for(var playerId in players){
        if(playerId == thisPlayerId)
            continue;
        socket.emit('spawn', players[playerId]);
    };
    
    
    socket.on('move', function (data) {
        data.id = thisPlayerId;
        console.log('client moved', JSON.stringify(data));
        
        player.destination.x = data.d.x;
        player.destination.y = data.d.y;
        
        var elapsedTime = Date.now() - player.lastMoveTime;
        
        var travelDistanceLimit = elapsedTime * playerSpeed / 1000;
        
        var requestedDistanceTraveled = lineDistance(player.lastPosition, data.c);
        
        player.lastMoveTime = Date.now();
        
        player.lastPosition = data.c;
        
        delete data.c;
        
        data.x = data.d.x;
        data.y = data.d.y;
        
        delete data.d;

        for(var play in players){
            console.log(play);
            var distance = distanceInKmBetweenEarthCoordinates(players[thisPlayerId].lat,players[thisPlayerId].lan,players[play].lat,players[play].lan);
             console.log(distance);
             if(distance < 100)
             {
                console.log("affichi les players");
             }
        };

        

        
        //var distance =  distanceInKmBetweenEarthCoordinates(player.lat,player.lan,0,0);
        //console.log(distance);
        //players[thisPlayerId].lat
        console.log('localisation : ', JSON.stringify(players[thisPlayerId].lat));
        socket.broadcast.emit('move', data);
    });

    socket.on('localisation',function(data){
        data.id = thisPlayerId;
        player.lat = data.x;
        player.lan = data.y;
        //console.log('localisation : ', JSON.stringify(data));
    });


    socket.on('rotate',function(data){
        data.id = thisPlayerId;
        data.y = data.rot.y;
        data.w = data.rot.w;
        delete data.rot;
        console.log('client rotated',JSON.stringify(data));
        socket.broadcast.emit('rotate',data);
    });
    
    socket.on('send', function(data){
        data.id = thisPlayerId;

        console.log('the player ' + data.id + 'Has Send this msg : ' + JSON.stringify(data.msg));
        data.msg = data.msg;
        socket.broadcast.emit('send',data);
    });

     socket.on('follow', function (data) {
        data.id = thisPlayerId;
        console.log("follow request: ", data);
        socket.broadcast.emit('follow', data);
    });
    
    socket.on('updatePosition', function (data) {
        console.log("update position: ", data);
        data.id = thisPlayerId;
        socket.broadcast.emit('updatePosition', data);
    });
    
    socket.on('attack', function (data) {
        console.log("attack request: ", data);
        data.id = thisPlayerId;
        io.emit('attack', data);
    });
    
    socket.on('disconnect', function () {
        console.log('client disconected');
        delete players[thisPlayerId];
        socket.broadcast.emit('disconnected', {id:thisPlayerId});
    });
});

function lineDistance(vectorA, vectorB) {
    var xs = 0;
    var ys = 0;
    
    xs = vectorB.x - vectorA.x;
    xs = xs * xs;
    
    ys = vectorB.y - vectorA.y;
    ys = ys * ys;
    
    return Math.sqrt(xs + ys);
}


function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}

function distanceInKmBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
  var earthRadiusKm = 6371;

  var dLat = degreesToRadians(lat2-lat1);
  var dLon = degreesToRadians(lon2-lon1);

  lat1 = degreesToRadians(lat1);
  lat2 = degreesToRadians(lat2);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return earthRadiusKm * c;
}