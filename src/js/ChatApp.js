/* Handles Firebase, authentication, and messaging */
var ChatApp = (function() {
    "use strict";

    var database, storage, auth, messagesRef, userRef, userObject, textInput, messages;

    /* --------------PRIVATE-------------- */

    // Firebase Configuration
    const config = {
        "apiKey": "AIzaSyDrwH-mQ3ketttl4EL6gt2G7hhG_3UhbK4",
        "authDomain": "chatapp-a0804.firebaseapp.com",
        "databaseURL": "https://chatapp-a0804.firebaseio.com",
        "projectId": "chatapp-a0804",
        "storageBucket": "chatapp-a0804.appspot.com",
    }

    // Caches page elements and Firebase shortcuts
    function cacheElements() {
        textInput = document.getElementById('message-input');
        messages = document.getElementById('messages');
        database = firebase.database();
        auth = firebase.auth();
        messagesRef = database.ref("messages");
    }

    /* Messages */

    // Message HTML Layout
    const MESSAGE_HTML = '<div class="message-container">' +
    '<div class="user-photo"></div>' +
    '<div class="username"></div>' +
    '<div class="message-text"></div>' +
    '</div>';

    // Takes in a message object and adds it to the chat box
    function addMessage(messageObject) {
        let message = messageObject.text;
        let sender = messageObject.username + ": ";

        let messageContainer = document.createElement('div');
        messageContainer.innerHTML = MESSAGE_HTML;
        messageContainer.querySelector('.message-text').textContent = message;
        messageContainer.querySelector('.username').textContent = sender;

        database.ref('users/' + messageObject.uid).on('value', (snapshot) => {
            let photoRef = snapshot.val().photoUrl;
            messageContainer.querySelector('.user-photo').style.backgroundImage = 'url(' + photoRef + ')';
        });
        messages.appendChild(messageContainer);
    }

    // Listens for new messages and loads all old messages in the database
    function retrieveMessages() {
        messagesRef.off();
        
        var handleMessage = function(data) {
            let messageObject = data.val();
            addMessage(messageObject);
            messages.scrollTop = messages.scrollHeight;
        };

        messagesRef.on('child_added', handleMessage);
    }

    $("#input-form").submit(submitMessage);
    // Pushes message to firebase then clears text field. User must be signed in to send message
    function submitMessage(event) {
        event.preventDefault();
        if (auth.currentUser !== null) {
            let text = textInput.value.trim();
            if (text != '') {
                textInput.value = '';
                messagesRef.push({
                    uid: userObject.uid,
                    username: userObject.info.username,
                    text: text
                });
            }
        } else {
            signIn();
        }
    }

    /* Authentication */

    // Redirects page to google sign in
    function signIn() {
        var provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithRedirect(provider);
    }

    // Handles user's authorization
    function handleUserAuth(user) {
        return new Promise((resolve, reject) => {
            checkUser(user);
            retrieveUserInfo(user).then(() => {
                resolve();
            })
        });
    }

    // Checks to see if user is not null. If null, redirects user to login page. 
    // Otherwise resolves promise
    function checkUser(user) {
        if (user) {
            retrieveMessages();
        } else {
            signIn();
        }
    }

    // Grabs user information from firebase
    function retrieveUserInfo(user) {
        return new Promise((resolve, reject) => {
            userRef = database.ref('users/' + user.uid);
            document.getElementById("settings-button").style.display = "block";

            userRef.on('value', (snapshot) => {
                parseSnapshot(snapshot, user);
                resolve();
            });
        });
    };

    // Parses a snapshot from firebase and sets userObject's values accordingly
    // If snapshot does not contain user info,
    // then the user's default information is added onto the database.
    function parseSnapshot(snapshot, user) {
        userObject = {
            uid: user.uid,
            info: snapshot.val()
        };

        if (userObject.info == null) {
            addNewUserToDB(user.displayName, user.photoURL);
        }
    }

    // Adds a new profile to the DB using user's default information
    function addNewUserToDB(name, photoUrl) {
        userRef.set({
            username: name,
            photoUrl: photoUrl
        });
    }

    /* --------------PUBLIC-------------- */ 

    function init() {
        return new Promise((resolve, reject) => {
            firebase.initializeApp(config);
            cacheElements();
            auth.onAuthStateChanged((user) => {
                handleUserAuth(user).then(function() {
                    user = userObject;
                    resolve();
                });
            });
        });
    }

    function getDatabase() { return database };
    function getStorage() { return firebase.storage() };
    function getUser() { return userObject }

    /* --------------RETURN-------------- */
    return {
        init: init,
        getDatabase: getDatabase,
        getStorage: getStorage,
        getUser: getUser
    }
})();
