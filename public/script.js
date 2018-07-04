"use strict";

var database, storage, auth, messagesRef, userRef, userObject;
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

var MESSAGE_HTML = '<div class="message-container">' +
'<div class="user-photo"></div>' +
'<div class="username"></div>' +
'<div class="message-text"></div>' +
'</div>';


// Takes a text and adds it to the content-container
var addMessage = function(messageObject) {
    let message = messageObject.text;
    let sender = messageObject.username + ": ";

    var messageContainer = document.createElement('div');
    messageContainer.innerHTML = MESSAGE_HTML;
    messageContainer.querySelector('.message-text').textContent = message;
    messageContainer.querySelector('.username').textContent = sender;

    database.ref('users/' + messageObject.uid).on('value', (snapshot) => {
        let photoRef = snapshot.val().photoUrl;
        messageContainer.querySelector('.user-photo').style.backgroundImage = 'url(' + photoRef + ')';
    });

    messages.appendChild(messageContainer);
}

// Loads all the messages currently stored in Firebase DB
var loadMessages = function() {
    messagesRef.off();
    
    var handleMessage = function(data) {
        let messageObject = data.val();
        addMessage(messageObject);
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
                uid: userObject.uid,
                username: userObject.info.username,
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

// Opens google sign in in a new window and sets username to google's default
var signIn = function() {
    var provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithRedirect(provider);

    // .then((results) => {
    //     let user = results.user;
    //     username = user.displayName;
    // });
}

function readyPage() {
    firebase.initializeApp(config);
    initFirebase();
    auth.onAuthStateChanged(handleAuthState);
}

// Sets user object from database information
function handleAuthState(user) {
    if (user) {
        loadMessages();
        // Fetch user's info
        userRef = database.ref('users/' + user.uid);
        userRef.on('value', (snapshot) => {
            userObject = {
                uid: user.uid,
                info: snapshot.val()};
            if (userObject.info == null) {
                addNewUserToDB(user.displayName, user.photoURL);
            }

            document.getElementById("settings-button").style.display = "block";
        });
    } else {
        signIn();
    }
}

// Adds a new profile to the DB using the given info
function addNewUserToDB(name, photoUrl) {
    userRef.set({
        username: name,
        photoUrl: photoUrl
    });
}

function changeUserPhoto(photo) {
    storage.ref('users/' + userObject.uid).put(photo).then((snapshot) => {
        snapshot.ref.getDownloadURL().then((url) => {
            userObject.info.photoUrl = url;
            document.getElementById("photo-picker-button").style.backgroundImage = `url(${userObject.info.photoUrl})`;
            database.ref(`users/${userObject.uid}/photoUrl`).transaction(() => {
                return url;
            })
        });
    });
}

$("document").ready(readyPage());
$("#input-form").submit(submitMessage);

settingsButton.onclick = function() {
    settingsContainer.style.display = "block";
    let usernameField = document.getElementById("username-textfield");
    usernameField.value = userObject.info.username;
    document.getElementById("photo-picker-button").style.backgroundImage = `url(${userObject.info.photoUrl})`;
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
    if (desiredName != userObject.info.username) {
        userObject.info.username = desiredName;
        database.ref('users/' + userObject.uid + '/username').transaction(() => {
            return desiredName;
        });
    }
    settingsContainer.style.display = "none";
}

document.getElementById('photo').onclick = function() {
    document.getElementById('photo-picker').click();
}

document.getElementById('photo-picker').addEventListener('change', (e) => {
    e.preventDefault();
    let photo = event.target.files[0];
    
    if (!photo.type.match('image.*')) {
        console.log("User must choose an image. Handle here!");
        return;
    }

    changeUserPhoto(photo);
});