function update() {
	var testPanel = document.getElementById("test");
	var date = new Date();
	//var day = date.getDay();
	//var timeString = date.getFullYear() + "." + (date.getMonth()+1) + "." + date.getDate();
	testPanel.label = date.toTimeString();
}
function sayHello() {
	let prompts = Cc["@mozilla.org/embedcomp/prompt-service;1"].getService(Ci.nsIPromptService);
	return prompts.alert(window, "Hello", "Hello!");
}

function startup() {
//	var testPanel = document.getElementById("test");
//	testPanel.onClick = sayHello();
}

window.addEventListener("load", function(e) {
	startup(); 
	update();
}, false);

window.setInterval(update, 1000); // update date every second

