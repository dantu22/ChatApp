"use strict"
// Init Firebase
var config = {
    apiKey: "AIzaSyDGDlwfgkTEw4tcXUBJKNis6CWBJOkLfyA",
    authDomain: "chatapp-tutorial-43112.firebaseapp.com",
    databaseURL: "https://chatapp-tutorial-43112.firebaseio.com",
    projectId: "chatapp-tutorial-43112",
    storageBucket: "chatapp-tutorial-43112.appspot.com",
};
firebase.initializeApp(config);

const messages = document.getElementById("messages");
var newMessage = function(message) {
    var messageContainer = document.createElement("div");
    messageContainer.innerHTML = message;
    messages.appendChild(messageContainer);
}

var messagesRef, database;
var loadMessages = function() {
    database = firebase.database();
    messagesRef = database.ref('Messages');
    messagesRef.off();

    var addMessage = function(data) {
        let messageObject = data.val();
        let message = messageObject.text;
        newMessage(message);
    }

    messagesRef.on('child_added', addMessage);
}

$("document").ready(loadMessages);