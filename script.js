"use strict";

var database, storage, auth, messagesRef;
const textInput = document.getElementById("message-input");
const submitButton = document.getElementById("submit-button");
const messages = document.getElementById("messages");

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
}

// Loads all the messages currently stored in Firebase DB
var loadMessages = function() {
    messagesRef = database.ref("Messages");
    messagesRef.off();
    
    var setMessage = function(data) {
        var val = data.val();
        console.log(val);
    };

    messagesRef.on('child_added', setMessage);
}

// Pushes message to firebase then clears text field
var submitMessage = function(e) {
    e.preventDefault();
    if (textInput.value) {
        console.log(textInput.value);
        messagesRef.push({
            text: textInput.value
        }).then(() => {
            $("#message-input").val('');
        });
    }
}


function readyPage() {
    firebase.initializeApp(config);
    initFirebase();
    loadMessages();
}

$("document").ready(readyPage())

$("#input-form").submit(submitMessage);


