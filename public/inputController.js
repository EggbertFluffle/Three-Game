// This code was inspired by the InputController by SimonDev in the video https://www.youtube.com/watch?v=oqKzxPMLWxo

class InputController{
	constructor(element, pointerLock){
		this.mouse = {
			leftMouseButton: 0,
			rightMouseButton: 0,
			mouseX: 0,
			mouseY: 0,
			deltaX: 0,
			deltaY: 0
		}
		this.lockedPointer = false;
		this.previousMouse = null;
		this.keys = {};
		this.previousKeys = {};
		element.addEventListener('mousedown', (e) => this.onMouseDown(e), false);
		element.addEventListener('mouseup', (e) => this.onMouseUp(e), false);
		element.addEventListener('mousemove', (e) => this.onMouseMove(e), false);
		element.addEventListener('keydown', (e) => this.onKeyDown(e), false);
		element.addEventListener('keyup', (e) => this.onKeyUp(e), false);
		if(pointerLock) {
			element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock;
			element.addEventListener("click", (e) => {
				element.requestPointerLock({
			    unadjustedMovement: true
			  });
			})
		}
	}

	onMouseDown(e) {
		switch(e.button) {
			case 0: 
				this.mouse.leftMouseButton = 1;
				break;
			case 2:
				this.mouse.rightMouseButton = 1;
				break;
		}
	}
	
	onMouseUp(e) {
		switch(e.button) {
			case 0: 
				this.mouse.leftMouseButton = 0;
				break;
			case 2:
				this.mouse.rightMouseButton = 0;
				break;
		}
	}
	
	onMouseMove(e) {
		this.mouse.mouseX = e.pageX - window.innerWidth / 2;
		this.mouse.mouseY = e.pageY - window.innerHeight / 2;

		if(this.previousMouse === null) {
			this.previousMouse = {...this.mouse};
		}

		if(document.pointerLockElement != null) {
			this.mouse.deltaX = e.movementX;
			this.mouse.deltaY = e.movementY;
		}
	}
	
	onKeyDown(e) {
		this.keys[e.keyCode] = 1;
	}
	
	onKeyUp(e) {
		this.keys[e.keyCode] = 0;
	}

	update(){
		this.previousMouse = {...this.mouse};
		this.mouse.deltaX = 0;
		this.mouse.deltaY = 0;
		
	}
}

export { InputController };