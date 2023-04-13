class UserInterfaceController{
	_initUIEvents(usernameInputHandler) {
		this.submitUsername = () => {
			const username = document.querySelector("#usernameInput").value;
			if(usernameInputHandler(username)){
				document.querySelector("#usernameView").style.display = "none";
				document.querySelector("#crosshairContainer").style.display = "flex";
			};
		};
		this.submitUsername = this.submitUsername.bind(this);
		document.querySelector("#usernameButton").addEventListener("click", this.submitUsername);
		document.querySelector("#usernameInput").addEventListener("keydown", (e) => {
			if(e.keyCode == 13) this.submitUsername();
		});
	}

	addChat(chat  = "") {
		let chatElement = document.createElement("p");
		chatElement.innerText = chat ? chat : document.querySelector("#chatInput").value;
		if(document.querySelector("#chatInput").value != "") document.querySelector("#chatInput").value = "";
		documnet.querySelector("#chatContainer").appendChild(chatElement);
	}
}

export { UserInterfaceController };