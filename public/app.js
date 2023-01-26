import * as THREE from 'three';
// import { OrbitControls } from 'OrbitControls';
import { GLTFLoader } from 'GLTFLoader';
import { FirstPersonPlayer } from './firstPersonPlayer.js';
import { UserInterfaceController } from './userInterfaceController.js';
import { ClientSidePlayerStateManager } from './clientSidePlayerStateManager.js';

// Shader Imports
import { EffectComposer } from "EffectComposer";
import { RenderPass } from "RenderPass";
import { ShaderPass } from "ShaderPass";
import { PixelateShader } from "./pixelateShader.js";

class Game{
	constructor(){
		this.animate = this.animate.bind(this);
		this.clock = new THREE.Clock(true);
		this.username = "";

		this.userInterfaceController = new UserInterfaceController();
		this.setUsername = this.setUsername.bind(this);
		this.userInterfaceController._initUIEvents(this.setUsername);
	}

	_initSocketConnection(){
		this.socket = io();
		this.socket.emit("usernamePacket", this.username);

		this.player = new FirstPersonPlayer(0, 1, 0, document.body);

		this.otherPlayers = new Map();
	
		
		this._initRendering();
		// this._preloadModels();
		this._initScene();

		this.windowResize();
		this.animate();

		this.serverUpdateHandler = this.serverUpdateHandler.bind(this);
		this.socket.on("serverUpdate", this.serverUpdateHandler);
		this.playerDisconnectHandler = this.playerDisconnectHandler.bind(this);
		this.socket.on("playerDisconnect", this.playerDisconnectHandler);
	}

	_initRendering() {
		this.postprocessing = {};
		this.scene = new THREE.Scene();
		this.debugCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		this.renderer = new THREE.WebGLRenderer({
			antialias: true
		});
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);

		//Postprocessing junk
		this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.player.camera));

    this.effect = new ShaderPass(PixelateShader);
    this.effect.uniforms['intensity'].value = 0.0;
    this.effect.uniforms['u_resolution'] = {
        type: "v2", value: new THREE.Vector2()
    };
    this.effect.renderToScreen = true;
    this.composer.addPass(this.effect);

    this.postprocessing.composer = this.composer;
    this.postprocessing.effect = this.effect;
		
		document.body.appendChild(this.renderer.domElement);
		this.windowResize = this.windowResize.bind(this);
		window.onresize = this.windowResize;
	}

	windowResize() {
		console.log("window resize");
    this.player.camera.aspect = window.innerWidth / window.innerHeight;
    this.player.camera.updateProjectionMatrix();
    this.postprocessing.composer.setSize(window.innerWidth, window.innerHeight);

    // Update uniforms
    this.postprocessing.effect.uniforms['u_resolution'].value.x = this.renderer.domElement.width * 2;
    this.postprocessing.effect.uniforms['u_resolution'].value.y = this.renderer.domElement.height * 2;
  }

	_preloadModels() {
		const loader = new GLTFLoader();

		loader.load('./src/hacker_desk/scene.gltf', function(gltf){
				gltf.scene.scale.set(0.01, 0.01, 0.01);
				gltf.scene.position.set(0, 0, 4);
				this.scene.add(gltf.scene);
				gltf.animations;
				gltf.scene;
				gltf.scenes;
				gltf.cameras;
				gltf.asset;
			}.bind(this), function(xhr) {
				console.log((xhr.loaded / xhr.total * 100) + '% loaded');
			}
		);
	}

	_initScene(){
		const cubeTextureLoaderloader = new THREE.CubeTextureLoader();
		const textureLoader = new THREE.TextureLoader();
	  const skyBoxTexture = cubeTextureLoaderloader.load([
	    'src/skybox/right.jpg',
	    'src/skybox/left.jpg',
	    'src/skybox/up.jpg',
	    'src/skybox/down.jpg',
	    'src/skybox/back.jpg',
	    'src/skybox/front.jpg',
	  ]);
	  this.scene.background = skyBoxTexture;

		const floorTexture = textureLoader.load("./src/floor.jpg");
		this.floor = new THREE.Mesh(
			new THREE.PlaneGeometry(10, 10),
			new THREE.MeshLambertMaterial({ map: floorTexture })
		);
		this.floor.position.set(0, 0, 0);
		this.floor.rotateX(-1.5708);
		this.scene.add(this.floor);

		this.ambientLight = new THREE.AmbientLight({ color: 0xFFFFFF });
		this.scene.add(this.ambientLight);
		
		this.debugCamera.position.set(0, 1, 3);
		this.debugCamera.lookAt(0, 0, 0);
	}

	setUsername(username) {
		if(username == "") {
			return false;
		}
		this.username = username;
		if(!this.socket) {
			this._initSocketConnection();
		}
		return true;
	}

	serverUpdateHandler(packet) {
		for(let i = 0; i < packet.length; i++) {
			if(packet[i].id == this.socket.id) return;
			if(this.otherPlayers.has(packet[i].id)) {
				this.otherPlayers.get(packet[i].id).setTransform(packet[i]);
			} else {
				this.otherPlayers.set(packet[i].id, new ClientSidePlayerStateManager(packet[i]));
				this.scene.add(this.otherPlayers.get(packet[i].id).getModel());
			}
		}
	}

	sendPlayerStatePacket(){
		if(this.player.positionChange || this.player.rotationChange) {
			this.socket.emit("playerPacket", this.player.getPlayerStatePacket(this.player.positionChange, this.player.rotationChange));
		}
	}

	playerDisconnectHandler(id){
		this.players.delete(id);
	}
	
	animate() {
		requestAnimationFrame(this.animate);

		this.player.update(this.clock.getDelta());
		this.sendPlayerStatePacket();

		this.postprocessing.composer.render(this.scene, this.player.camera || this.debugCamera);
		// this.renderer.render(this.scene, this.player.camera || this.debugCamera);
	}
}

const game = new Game();