"use strict";

var database, storage, auth, messagesRef, username;
const textInput = document.getElementById("message-input");
const messages = document.getElementById("messages");
const settingsButton = document.getElementById("settings-button");
const settingsContainer = document.getElementById("settings-container");
const closeSettings = document.getElementById("close-settings");

// Init Firebase
var config = {
    apiKey: "AIzaSyDrwH-mQ3ketttl4EL6gt2G7hhG_3UhbK4",
    authDomain: "chatapp-a0804.firebaseapp.com",
    databaseURL: "https://chatapp-a0804.firebaseio.com",
    projectId: "chatapp-a0804",
    storageBucket: "chatapp-a0804.appspot.com",
};

// Sets Firebase shortcuts for ease of use
var initFirebase = function() {
    database = firebase.database();
    storage = firebase.storage();
    auth = firebase.auth();
    messagesRef = database.ref("Messages");
}

// Takes a text and adds it to the content-container
var addMessage = function(text) {
    var messageContainer = document.createElement('div');
    messageContainer.innerHTML = text;
    messages.appendChild(messageContainer);
}

// Loads all the messages currently stored in Firebase DB
var loadMessages = function() {
    messagesRef.off();
    
    var handleMessage = function(data) {
        let messageObject = data.val();
        let username = messageObject.username;
        let message = username + ': ' + messageObject.text;
        addMessage(message);
    };

    messagesRef.on('child_added', handleMessage);
}

// Pushes message to firebase then clears text field
var submitMessage = function(e) {
    e.preventDefault();
    if (auth.currentUser !== null) {
        if (username === undefined) {
            username = auth.currentUser.displayName
        }

        if (textInput.value) {
            messagesRef.push({
                username: username,
                text: textInput.value
            }).then(() => {
                $("#message-input").val('');
            });
        }
    } else {
        console.log("User must sign in to chat... Redirecting");
        signIn();
    }
}

// Opens google sign in in a new window
var signIn = function() {
    var provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithRedirect(provider).then((results) => {
        let user = results.user;
        username = user.displayName;
    });
}

function readyPage() {
    firebase.initializeApp(config);
    initFirebase();
    loadMessages();
}

$("document").ready(readyPage());
$("#input-form").submit(submitMessage);

settingsButton.onclick = function() {
    settingsContainer.style.display = "block";
}

closeSettings.onclick = function() {
    settingsContainer.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == settingsContainer) {
        settingsContainer.style.display = "none";
    }
}