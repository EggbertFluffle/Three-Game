import * as THREE from 'three';

class ClientSidePlayerStateManager {
	constructor({position, rotation, username, id}){
		this.lastUpdateTimestamp = 0;
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
		// Add rotation transform handling
	}
}

export { ClientSidePlayerStateManager };