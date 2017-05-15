var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var IPADDRESS = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var io = require('socket.io')(port);
var shortId = require('shortid');

var players = [];

var playerSpeed = 3;

console.log("server started on port " + port);

io.on('connection', function (socket) {
    
    console.log("server connection");
});

