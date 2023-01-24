const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static('public'));

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

server.listen(3000, () => {
	console.log('server started on port 3000');
});

let players = new Map();
let serverUpdateIntervalID = null;

io.on('connection', (socket) => {
	console.log(`user ${socket.id} connected`);
	players.set(socket.id, new Player(socket.id));
	if(!serverUpdateIntervalID) serverUpdateIntervalID = setInterval(updateServer, 50);

	socket.on("usernamePacket", (username) => {
		console.log(socket.id);
		console.log(username);
		players.get(socket.id).username = username;
		console.log(players.get(socket.id));
	});

	socket.on("playerPacket", (p) => {
		console.log(players);
		players.get(socket.id).setTransform(p);
	});

	socket.on('disconnect', () => {
		console.log(`user ${socket.id} diconnected`);
		players.delete(socket.id);
	});
});

function updateServer(){
	io.emit("serverUpdate", {
		players: Array.from(players)
	});
}

class Player{
	constructor(id){
		this.position = {
			x: 0,
			y: 0,
			z: 0
		};
		this.rotation = {
			x: 0,
			y: 0,
			z: 0,
			w: 0
		};
		this.username = "";
		this.id = id;
	}

	setTransform({position, rotation}){
		this.position = position;
		this.rotation = rotation;
	}
}