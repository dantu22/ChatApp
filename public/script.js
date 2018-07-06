"use strict";

var database, storage, auth, messagesRef, userRef, userObject;
const textInput = document.getElementById('message-input');
const messages = document.getElementById('messages');

// Init Firebase Config
const config = {
    "apiKey": "AIzaSyDrwH-mQ3ketttl4EL6gt2G7hhG_3UhbK4",
    "authDomain": "chatapp-a0804.firebaseapp.com",
    "databaseURL": "https://chatapp-a0804.firebaseio.com",
    "projectId": "chatapp-a0804",
    "storageBucket": "chatapp-a0804.appspot.com",
}

// Sets Firebase shortcuts for ease of use
var initFirebaseShortcuts = function() {
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

// Takes a message object and adds it to the content-container
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

// Listens for new and loads all messages in the Firebase DB
var loadMessages = function() {
    messagesRef.off();
    
    var handleMessage = function(data) {
        let messageObject = data.val();
        addMessage(messageObject);
        messages.scrollTop = messages.scrollHeight;
    };

    messagesRef.on('child_added', handleMessage);
}

// Pushes message to firebase then clears text field. User must be signed in to send message
var submitMessage = function(e) {
    e.preventDefault();
    if (auth.currentUser !== null) {
        let text = textInput.value.trim();
        if (text != '') {
            messagesRef.push({
                uid: userObject.uid,
                username: userObject.info.username,
                text: text
            }).then(() => {
                textInput.value = '';
            });
        }
    } else {
        signIn();
    }
}

// Opens google sign in in a new window and sets username to google's default
var signIn = function() {
    var provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithRedirect(provider);
}

// Takes in a bool that can displays or hides the settings window
var showSettings = function(isShown) {
    let display;
    if (isShown) {
        display = 'block';
    } else {
        display = 'none'
    }
    document.getElementById('settings-container').style.display = display;
}

// Runs when page is ready
function readyPage() {
    firebase.initializeApp(config);
    initFirebaseShortcuts();
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
            document.getElementById("photo-picker-image").style.backgroundImage = `url(${userObject.info.photoUrl})`;
            database.ref(`users/${userObject.uid}/photoUrl`).transaction(() => {
                return url;
            })
        });
    });
}

$("document").ready(readyPage());

$("#input-form").submit(submitMessage);

$('#close-settings').on('click', () => showSettings(false));

$('#settings-button').on('click', function() {
    showSettings(true);
    let usernameField = document.getElementById("username-textfield");
    usernameField.value = userObject.info.username;
    document.getElementById("photo-picker-image").style.backgroundImage = `url(${userObject.info.photoUrl})`;
});

$('#save-settings-button').on('click', (event) => {
    event.preventDefault();
    let desiredName = document.getElementById('username-textfield').value;
    if (desiredName != userObject.info.username) {
        userObject.info.username = desiredName;
        database.ref('users/' + userObject.uid + '/username').transaction(() => {
            return desiredName;
        });
    }
    showSettings(false);
});

$('#photo').on('click', () => document.getElementById('photo-picker').click());

window.onclick = function(event) {
    if (event.target == document.getElementById('settings-container')) {
        showSettings(false);
    }
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