// Server stuff
const express = require('express');
const app = express();
const $ = require('jquery');
app.use(express.static(__dirname));
app.listen(3000, () => console.log("Listening on port 3000!"));