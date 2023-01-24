class UserInterfaceController{
	_initUIEvents(usernameInputHandler) {
		document.querySelector("#usernameButton").addEventListener("click", () => {
			const username = document.querySelector("#usernameInput").value;
			if(usernameInputHandler(username)){
				document.querySelector("#usernameView").style.display = "none";
				document.querySelector("#crosshairContainer").style.display = "flex";
			};
		});
	}
}

export { UserInterfaceController };