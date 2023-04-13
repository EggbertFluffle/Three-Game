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

		this.physics = new CANNON.Body({ mass: 1 });
		this.physics.position.set(0, 10, 0);
		this.physics.addShape(new CANNON.Box(new CANNON.Vec3(0.5, 1, 0.5)));
	}

	update(deltaTime) {
		this.updateRotation();
		this.updatePosition(deltaTime);
		this.updateCamera();
		this.inputController.update();
	}

	updateCamera(){
		this.camera.quaternion.copy(this.rotation);
		let shiftOffset = (this.inputController.keys[16] ? -0.2 : 0);
		let stepOffset = (Math.sin(this.step) * 0.02);
		this.camera.position.copy(new THREE.Vector3(this.physics.position.x, this.physics.position.y + stepOffset + shiftOffset, this.physics.position.z));
		console.log(this.camera.position);
	}

	updatePosition(deltaTime){
		const dir = new THREE.Vector3(
			(this.inputController.keys[65] ? 1 : 0) + (this.inputController.keys[68] ? -1 : 0),
			0,
			(this.inputController.keys[87] ? 1 : 0) + (this.inputController.keys[83] ? -1 : 0)
		).normalize();
		
		if(dir.z + dir.x != 0) {
			this.step += 0.1;
		}

		// const qx = new THREE.Quaternion();
		// qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi);

		// const forward = new THREE.Vector3(0, 0, -1);
		// forward.applyQuaternion(qx);
		// forward.multiplyScalar(velocity.z * deltaTime * this.speed);

		// const left = new THREE.Vector3(-1, 0, 0);
		// left.applyQuaternion(qx);
		// left.multiplyScalar(velocity.x * deltaTime * this.speed);

		// this.position.add(forward);
		// this.position.add(left);
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
}

export { FirstPersonPlayer };