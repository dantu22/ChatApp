"use strict"
var messagesRef, database;

// Init Firebase
var config = {
    apiKey: "AIzaSyDrwH-mQ3ketttl4EL6gt2G7hhG_3UhbK4",
    authDomain: "chatapp-a0804.firebaseapp.com",
    databaseURL: "https://chatapp-a0804.firebaseio.com",
    projectId: "chatapp-a0804",
    storageBucket: "chatapp-a0804.appspot.com",
};
firebase.initializeApp(config);

var loadMessages = function() {
    database = firebase.database();
    messagesRef = database.ref('Messages');
    messagesRef.off();

    var addMessage = function() {
        console.log('Found a message!')
    }

    messagesRef.on('child_added', addMessage);
}

$("document").ready(loadMessages);