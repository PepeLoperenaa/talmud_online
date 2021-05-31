var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

// game status
var game_status = {
    status: "awaiting",
    turn: -1
};

// players
var players = []; //need to add 4 players here.
// cards in deck
var new_cards = ["naipes/1Oro.png", "naipes/2Oro.png", "naipes/3Oro.png", "naipes/4Oro.png", "naipes/5Oro.png", "naipes/6Oro.png", "naipes/7Oro.png", "naipes/8Oro.png", "naipes/9Oro.png", "naipes/10Oro.png", "naipes/11Oro.png", "naipes/12Oro.png",
    "naipes/1Copa.png", "naipes/2Copa.png", "naipes/3Copa.png", "naipes/4Copa.png", "naipes/5Copa.png", "naipes/6Copa.png", "naipes/7Copa.png", "naipes/8Copa.png", "naipes/9Copa.png", "naipes/10Copa.png", "naipes/11Copa.png", "naipes/12Copa.png",
    "naipes/1Espada.png", "naipes/2Espada.png", "naipes/3Espada.png", "naipes/4Espada.png", "naipes/5Espada.png", "naipes/6Espada.png", "naipes/7Espada.png", "naipes/8Espada.png", "naipes/9Espada.png", "naipes/10Espada.png", "naipes/11Espada.png", "naipes/12Espada.png",
    "naipes/1Baston.png", "naipes/2Baston.png", "naipes/3Baston.png", "naipes/4Baston.png", "naipes/5Baston.png", "naipes/6Baston.png", "naipes/7Baston.png", "naipes/8Baston.png", "naipes/9Baston.png", "naipes/10Baston.png", "naipes/11Baston.png", "naipes/12Baston.png",]; //cards to use
var push_cards = []; // cards which are send to players

//make the cards objects to get the value of the different cards easier.

app.use(express.static('public'));

io.on('connection', function (socket) {
    console.log('A user has connected to the server with the ID: ' + socket.id);
    // max 4 players, control...
    socket.on('new_player', function (data) {

        if (players.length === 4) {
            socket.emit('error', "Full room!");
            return;
        }

        // randomize cards
        var c = [];
        for (var i = 0; i < 4; i++) {
            let pos = Math.floor(Math.random() * (new_cards.length));
            var card = {
                value: new_cards[pos],
                status: (i < 2) ? "hidden" : "visible"
            };
            c.push(card);
            // remove from deck
            new_cards.slice(pos, 1);
            //console.log("Remaining cards: "+new_cards.length);
        }

        var new_player = {
            name: "player" + players.length,
            socket: socket.id,
            cards: c
        }

        // add player to players array
        players.push(new_player);

        var info = {
            num_players: players.length,
            player_info: new_player
        }

        // send him info and cards
        socket.emit('new_status', info);
        // send rest player accepted
        socket.broadcast.emit('player_accepted', "");

        if (players.length === 4) {
            game_status.status = "started";
            game_status.turn = players[0].name;
            socket.emit('game_status', game_status);
        }
    });

    socket.on('get_card', function (data) {
        switchCard(data.player.name, data.index_change);
        // send him info and cards
        socket.emit('get_card_response', players[getPlayerIndex(data.player.name)]);
    });
});

server.listen(3000, function () {
    console.log("Server is running in: http://localhost:3000");
});

function getPlayerIndex(name) {
    var index;
    for (var i = 0; i < players.length; i++) {
        if (players[i].name === name)
            index = i;
    }
    return index;
}

function switchCard(name, index_change) {
    var index = getPlayerIndex(name);
    var player_card = players[getPlayerIndex(name)].cards[index_change];
    let pos = Math.floor(Math.random() * (new_cards.length));
    var random_card = new_cards[pos];
    new_cards.slice(pos, 1);
    push_cards.push(player_card.value);
    var card = {
        value: random_card,
        status: player_card.status
    };
    players[getPlayerIndex(name)].cards[index_change] = card;
}

