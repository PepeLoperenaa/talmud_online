var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

// players
var players = [];
// cards in deck
var new_cards = []; // para robar
var push_cards = []; // las que envian los jugadores

app.use(express.static('public'));

io.on('connection', function(socket) {
    console.log('Alguien se ha conectado con Sockets');

    // randomize cards
    var new_player = {
        name: "nuevo",
        cards: ["1Baston.PNG","1Copa.PNG","1Espada.PNG","1Oro.PNG"]
    }

    // add player to players array
    players.push(new_player);

    socket.on('new_player', function(data) {
        io.sockets.emit('info', new_player);
    });

    socket.on('get_card', function(data) {
        // get player name (es data)

        // randomize new card

        // update players array so this player gets the new card

        // send back his state
        player_status = null;
        io.sockets.emit('info', player_status);
    });
});



server.listen(3000, function() {
    console.log("Servidor corriendo en http://localhost:3000");
});


