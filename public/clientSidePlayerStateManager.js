import * as THREE from 'three';

class ClientSidePlayerStateManager {
	constructor({position, rotation, username, id}){
		this.lastUpdateTimestamp = 0;
		this.queuedTransforms = [];
		this.model = new THREE.Mesh(
			new THREE.BoxGeometry(1, 1, 1),
			new THREE.MeshNormalMaterial()
		);
		this.model.position.set(position.x, position.y, position.z);
		// Add intialization of the player rotations
		this.id = id;
		this.username = username;
	}

	getModel(){
		return this.model;
	}

	setTransform({position, rotation}){
		if(position) this.model.position.set(position.x, position.y, position.z);
		if(rotation) this.model.rotation.set(rotation.x, rotation.y, rotation.z, rotation.w);
	}

	pushTransform(transform, time) {
		this.queuedTransforms.push(new QueuedPosition(transform, time));
		if(this.queuedTransforms.length > 25) {
			let l = this.queuedTransforms.length;
			this.queuedTransforms = [this.queuedTransforms[l - 2], this.queuedTransforms[l - 1]];
		}
	}

	transformsQueueStep(deltaTime) {
		if(this.queuedTransforms.length >= 2){
			// Step through the difference between queue timestamps by how much time has passed since the last step
			this.queuedTransforms[0].currentStep += (deltaTime * 1000);
			
			// Remove finished transforms form the queue
			if(this.queuedTransforms[0].getLerpAlpha(this.queuedTransforms[1].timestamp) > 1) {
				this.queuedTransforms.shift();
			} else {
				// Lerp object position
				let np = new THREE.Vector3().lerpVectors(
					this.queuedTransforms[0].position,
					this.queuedTransforms[1].position,
					this.queuedTransforms[0].getLerpAlpha(this.queuedTransforms[1].timestamp)
				);
				this.model.position.set(np.x, np.y, np.z);

				// Slerp object rotation
				let nr = new THREE.Quaternion().slerpQuaternions(
					this.queuedTransforms[0].rotation,
					this.queuedTransforms[1].rotation,
					this.queuedTransforms[0].getLerpAlpha(this.queuedTransforms[1].timestamp)
				);
				this.model.quaternion.set(nr.x, nr.y, nr.z, nr.w);
			}
		}
	}
}

class QueuedPosition{
	constructor({position, rotation}, time){
		this.timestamp = time;
		this.currentStep = 0;
		this.position = new THREE.Vector3(position.x, position.y, position.z);
		this.rotation = new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w);
	}

	getLerpAlpha(timestamp) {
		return this.currentStep / (timestamp - this.timestamp);
	}
}

export { ClientSidePlayerStateManager };