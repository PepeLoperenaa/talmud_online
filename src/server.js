const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const tools = require('src/talmud.js');

app.use(express.static(__dirname + '/static'))

app.use('/images', express.static(path.join(__dirname, 'naipes')));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

server.listen(3000, () => {
    console.log('listening on *:3000')
})

/*const alert = "Welcome to the game";
function fadeIn(){
    $('OnlinePlayer').on({
        'click': function (){
            $('player1Cards').fadeIn("slow");
        }
    })
}
function playerOn() {
    window.alert(alert);
    const c = document.getElementById('player1Cards');
    c.setAttribute("style", "visibility:visible"); //dont know if jquery code goes here for the fade in.
}*/
