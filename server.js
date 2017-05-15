var port = process.env.PORT || 8080;
var io = require('socket.io')(port);
var shortId = require('shortid');

var players = [];

var playerSpeed = 3;

console.log("server started on port " + port);

io.on('connection', function (socket) {
    
    console.log("server connection");
});

