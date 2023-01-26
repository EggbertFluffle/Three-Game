import * as THREE from 'three';
import { InputController } from './inputController.js';

Math.clamp = (num, min, max) => Math.min(Math.max(num, min), max);

class FirstPersonPlayer{
	constructor(x, y, z, element) {
		this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		this.inputController = new InputController(element, true);
		this.rotation = new THREE.Quaternion();
		this.position = new THREE.Vector3(x || 0, y || 0, z || 0);
		this.speed = 2;
		this.phi = 0;
		this.theta = 0;
		this.step = 0;
	}

	update(deltaTime) {
		this.positionChange = false;
		this.rotationChange = false;
		this.updateRotation();
		this.updatePosition(deltaTime);
		this.updateCamera();
		this.inputController.update();
	}

	updateCamera(){
		this.camera.quaternion.copy(this.rotation);
		this.camera.position.copy(new THREE.Vector3(this.position.x, this.position.y + (Math.sin(this.step) * 0.02) + (this.inputController.keys[16] ? -0.2 : 0), this.position.z));
	}

	updatePosition(deltaTime){
		const forwardVelocity = (this.inputController.keys[87] ? 1 : 0) + (this.inputController.keys[83] ? -1 : 0);
		const strafeVelocity = (this.inputController.keys[65] ? 1 : 0) + (this.inputController.keys[68] ? -1 : 0);
		
		if(forwardVelocity + strafeVelocity != 0) {
			this.step += 0.1;
			this.positionChange = true;
		}

		const qx = new THREE.Quaternion();
		qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi);

		const forward = new THREE.Vector3(0, 0, -1);
		forward.applyQuaternion(qx);
		forward.multiplyScalar(forwardVelocity * deltaTime * this.speed);

		const left = new THREE.Vector3(-1, 0, 0);
		left.applyQuaternion(qx);
		left.multiplyScalar(strafeVelocity * deltaTime * this.speed);

		this.position.add(forward);
		this.position.add(left);
	}

	updateRotation() {
		const xh = this.inputController.mouse.deltaX / window.innerWidth;
		const yh = this.inputController.mouse.deltaY / window.innerHeight;

		if(xh + yh != 0){
			this.rotationChange = true;
		}

		this.phi += -xh * 5;
		this.theta = Math.clamp(this.theta + - yh * 5, -Math.PI / 2, Math.PI / 2);

		const qx = new THREE.Quaternion();
		qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi);
		const qz = new THREE.Quaternion();
		qz.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.theta);

		const q = new THREE.Quaternion();
		q.multiply(qx);
		q.multiply(qz);

		this.rotation.copy(q);
	}

	getPlayerStatePacket(sendPosition = false, sendRotation = false){
		let packet = {};
		if(sendPosition){
			packet.position = {
				x: this.position.x,
				y: this.position.y,
				z: this.position.z
			};
		}
		if(sendRotation) {
			packet.rotation = {
				x: this.rotation.x,
				y: this.rotation.y,
				z: this.rotation.z,
				w: this.rotation.w
			};
		}
		return packet;
	}
}

export { FirstPersonPlayer };