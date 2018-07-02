"use strict";

var database, storage, auth, messagesRef, username, uid, userRef;
const textInput = document.getElementById("message-input");
const messages = document.getElementById("messages");
const settingsButton = document.getElementById("settings-button");
const settingsContainer = document.getElementById("settings-container");
const closeSettings = document.getElementById("close-settings");
const saveSettings = document.getElementById("save-settings-button");

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
    messagesRef = database.ref("messages");
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
        messages.scrollTop = messages.scrollHeight;
    };

    messagesRef.on('child_added', handleMessage);
}

// Pushes message to firebase then clears text field
var submitMessage = function(e) {
    e.preventDefault();
    if (auth.currentUser !== null) {
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
    auth.onAuthStateChanged(handleAuthState);
}

function handleAuthState(user) {
    if (user) {
        loadMessages();
        uid = user.uid;
        // Fetch user's preferred display name
        userRef = database.ref('users/' + uid);
        userRef.on('value', (snapshot) => {
            let userInfo = snapshot.val();
            if (userInfo != null) {
                username = userInfo.username;
            } else {
                addNewUserToDB(user.displayName);
            }

            document.getElementById("settings-button").style.display = "block";
        });
    } else {
        signIn();
    }
}

function addNewUserToDB(name) {
    userRef.set({
        username: name
    });
    console.log("No user profile found on DB. Adding a default profile!");
}

$("document").ready(readyPage());
$("#input-form").submit(submitMessage);

settingsButton.onclick = function() {
    settingsContainer.style.display = "block";
    let usernameField = document.getElementById("username-textfield");
    usernameField.value = username;
}

closeSettings.onclick = function() {
    settingsContainer.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == settingsContainer) {
        settingsContainer.style.display = "none";
    }
}

// Saves settings to DB
saveSettings.onclick = function(event) {
    event.preventDefault();
    let desiredName = document.getElementById('username-textfield').value;
    if (desiredName != username) {
        username = desiredName;
        userRef.set({
            username: desiredName
        });
    }
    settingsContainer.style.display = "none";
}