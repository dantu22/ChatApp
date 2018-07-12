/* Links settings page to database */
var Settings = (function() {

    /* --------------PRIVATE-------------- */
    var user, database;

    function cacheElements() {
        user = ChatApp.getUser()
        database = ChatApp.getDatabase();
    }

    // Sets handlers for buttons
    function setHandlers() {
        $('#settings-button').on('click', loadSettings);
        $('#close-settings').on('click', () => showSettings(false));
        $('#save-settings-button').on('click', saveSettings);
        $('#photo').on('click', () => document.getElementById('photo-picker').click());
        $('#photo-picker').on('change', checkPhoto);
        window.onclick = function(event) {
            if (event.target == document.getElementById('settings-container')) {
                showSettings(false);
            }
        }
    }

    // Displays settings modal and loads user info
    function loadSettings() {
        showSettings(true);
        let usernameField = document.getElementById("username-textfield");
        usernameField.value = user.info.username;
        document.getElementById("photo-picker-image").style.backgroundImage = `url(${user.info.photoUrl})`;
    }

    // Saves the settings into Firebase
    function saveSettings(event) {
        event.preventDefault();
        let desiredName = document.getElementById('username-textfield').value;
        if (desiredName != user.info.username) {
            user.info.username = desiredName;
            database.ref('users/' + user.uid + '/username').transaction(() => {
                return desiredName;
            });
        }
        showSettings(false);
    }

    // Checks picked photo to make sure it is an image. If it is, then proceeds to change the user's photo
    function checkPhoto(e) {
        e.preventDefault();
        let photo = event.target.files[0];
        if (!photo.type.match('image.*')) {
            console.log("User must choose an image. Handle here!");
            return;
        }
        changePhoto(photo);
    }

    // Stores the user's photo in Firebase and updates the user's photo reference
    function changePhoto(photo) {
        storage.ref('users/' + user.uid).put(photo).then((snapshot) => {
            snapshot.ref.getDownloadURL().then((url) => {
                user.info.photoUrl = url;
                document.getElementById("photo-picker-image").style.backgroundImage = `url(${user.info.photoUrl})`;
                database.ref(`users/${user.uid}/photoUrl`).transaction(() => {
                    return url;
                })
            });
        });
    }

    // Takes in a bool that displays or hides the settings window
    function showSettings(isShown) {
        let display;
        if (isShown) {
            display = 'block';
        } else {
            display = 'none'
        }
        document.getElementById('settings-container').style.display = display;
    }

    /* --------------PUBLIC-------------- */
    function init() {
        setHandlers();
        cacheElements();
    }

    /* --------------RETURN-------------- */
    return {
        init: init
    }
})();