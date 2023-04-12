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
let updatedPlayerIds = [];
let serverUpdateIntervalID = null;

io.on('connection', (socket) => {
	console.log(`user ${socket.id} connected`);
	players.set(socket.id, new ServerSidePlayerStateManager(socket.id));
	if(!serverUpdateIntervalID){
		updateServer = updateServer.bind(this);
		serverUpdateIntervalID = setInterval(updateServer, 250);
	}
	socket.on("usernamePacket", (username) => {
		players.get(socket.id).username = username;
	});

	socket.on("playerPacket", (p) => {
		players.get(socket.id).setTransform(p);
		let quickPlayerState = { id: socket.id };
		if(p.position) quickPlayerState.position = p.position;
		if(p.rotaiton) quickPlayerState.rotaiton = p.rotation;
		if(!updatedPlayerIds.includes(socket.id)) updatedPlayerIds.push(socket.id);
	});

	socket.on('disconnect', () => {
		console.log(`user ${socket.id} diconnected`);
		io.emit("playerDisconnect", socket.id);
		players.delete(socket.id);
	});
});

let updateServer = () => {
	let updatedPlayers = [];
	updatedPlayerIds.forEach(id => updatedPlayers.push(players.get(id)));
	io.emit("serverUpdate", updatedPlayers);
	updatedPlayerIds = [];
}

class ServerSidePlayerStateManager{
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
		if(position) this.position = position;
		if(rotation) this.rotation = rotation;
	}
}