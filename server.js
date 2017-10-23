var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var IPADDRESS = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var io = require('socket.io')(port);
var shortId = require('shortid');




var players = [];

var playerSpeed = 3;

console.log("server started on port " + port);



console.log('3');


io.on('connection', function (socket) {
    var roomDistance;
    var thisPlayerId = shortId.generate();
    var player = {
        sockid:socket.id,
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
        lan : 0,
        name : ""
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

        //hathi tab3eth marra kahw wa9ti player yconnecti
        //lazem kif lplayer yconnecti w yo9res 3la location ya3mel verification w yab3eth spawn ll player jdid
        //hathi lazem twali automatique y7el lapp yestana 1 sec yconnecti m3aha location
   
    socket.on('login', function(data)
    {
        console.log(data.id);
            MongoClient.connect('mongodb://pokemap:fucksatan001@ds032887.mlab.com:32887/pokemap', function(err, db) 
            {
                if (err) throw err;
                    var idd = data.id;

                var myobj = { id: data.id, username: data.name , email: data.email };
                    db.collection("user").findOne({id:idd}).then(function(doc) 
                    {
                        if(!doc)
                        {
                                db.collection("user").insertOne(myobj, function(err, res) 
                                {
                                        if (err) throw err;
                                        console.log("1 record inserted");
                                });  
                        }
            
                        socket.emit('success',doc);
                        console.log(doc);
                    });
            
                    
   
             });

       
        //socket.broadcast.emit('send',data);
    });
    
  
    
    
    socket.on('move', function (data) {
        data.id = thisPlayerId;
        //console.log('client moved', JSON.stringify(data));
        
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

/*for(var playerId in players){
        if(playerId == thisPlayerId){
             continue;
        }
            
            var distance = distanceInKmBetweenEarthCoordinates(players[thisPlayerId].lat,players[thisPlayerId].lan,players[playerId].lat,players[playerId].lan);
             
             if(distance < 20)
             {
              //  console.log(distance +' MOVE function');
                    socket.broadcast.emit('move', data);
             }
        };*/

        socket.broadcast.emit('move', data);

        
        //var distance =  distanceInKmBetweenEarthCoordinates(player.lat,player.lan,0,0);
        //console.log(distance);
        //players[thisPlayerId].lat
        //console.log('localisation : ', JSON.stringify(players[thisPlayerId].lat));
        
    });

    socket.on('initloc',function(data){
        console.log('Tba3thet INIT : /////////////////////////////////////////////////////////////////////');
        data.id = thisPlayerId;
        player.lat = data.x;
        player.lan = data.y;
        
       
        console.log('INIT Wfet ');
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
        //console.log('client rotated',JSON.stringify(data));
        socket.broadcast.emit('rotate',data);
    });
    
    socket.on('send', function(data){
        data.id = thisPlayerId;

        console.log('the player ' + data.id + 'Has Send this msg : ' + JSON.stringify(data.msg) + " To This Player : " + data.rec + "with id = : "+players[data.rec].sockid);
        data.msg = data.msg;
        data.id = data.id;
        data.rec = data.rec;
        io.to(players[data.rec].sockid).emit('send', data);
        //socket.broadcast.emit('send',data);
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