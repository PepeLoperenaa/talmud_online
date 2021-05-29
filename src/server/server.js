var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

// players
var players = []; //need to add 4 players here.
// cards in deck
var new_cards = ["naipes/1Oro.png", "naipes/2Oro.png", "naipes/3Oro.png", "naipes/4Oro.png", "naipes/5Oro.png", "naipes/6Oro.png", "naipes/7Oro.png", "naipes/8Oro.png", "naipes/9Oro.png", "naipes/10Oro.png", "naipes/11Oro.png", "naipes/12Oro.png",
    "naipes/1Copa.png", "naipes/2Copa.png", "naipes/3Copa.png", "naipes/4Copa.png", "naipes/5Copa.png", "naipes/6Copa.png", "naipes/7Copa.png", "naipes/8Copa.png", "naipes/9Copa.png", "naipes/10Copa.png", "naipes/11Copa.png", "naipes/12Copa.png",
    "naipes/1Espada.png", "naipes/2Espada.png", "naipes/3Espada.png", "naipes/4Espada.png", "naipes/5Espada.png", "naipes/6Espada.png", "naipes/7Espada.png", "naipes/8Espada.png", "naipes/9Espada.png", "naipes/10Espada.png", "naipes/11Espada.png", "naipes/12Espada.png",
    "naipes/1Baston.png", "naipes/2Baston.png", "naipes/3Baston.png", "naipes/4Baston.png", "naipes/5Baston.png", "naipes/6Baston.png", "naipes/7Baston.png", "naipes/8Baston.png", "naipes/9Baston.png", "naipes/10Baston.png", "naipes/11Baston.png", "naipes/1Baston.png",]; // para robar
var push_cards = []; // las que envian los jugadores

// hacer cartas como objetos para coger el valor de manera mas fácil. pensar en ello.

app.use(express.static('public'));

io.on('connection', function (socket) {
    console.log('A user has connected to the server with the ID: ' + socket.id);
    // max 4 players, control...
    socket.on('new_player', function (data) {
        // randomize cards
        var c = [];
        for (var i = 0; i < 4; i++) {
            let pos = Math.floor(Math.random() * (new_cards.length));
            c.push(new_cards[pos]);
            // remove from deck
            new_cards.slice(pos, 1);
        }


        var new_player = {
            name: "player" + players.length,
            socket: socket.id,
            cards: c
        }

        // add player to players array
        players.push(new_player);
        // send him info and cards

        socket.emit('new_status', new_player);
        // send rest player accepted
        socket.broadcast.emit('player_accepted', "");
    });

    socket.on('get_card', function (data) {
        // get player name (es data)
        data.name;
        // randomize new card

        // update players array so this player gets the new card

        // send back his state
        player_status = null;
        io.sockets.emit('new_status', player_status);
    });
});

server.listen(3000, function () {
    console.log("Server is running in: http://localhost:3000");
});


