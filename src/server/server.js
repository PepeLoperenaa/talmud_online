let express = require('express');
let app = express();
let server = require('http').Server(app);
let io = require('socket.io')(server);
let _current_turn = -1;

// game status
let game_status = {
    status: "awaiting",
    turn: ""
};

// players
let players = []; //need to add 4 players here.
// cards in deck
let new_cards = ["naipes/1-Oro.png", "naipes/2-Oro.png", "naipes/3-Oro.png", "naipes/4-Oro.png", "naipes/5-Oro.png", "naipes/6-Oro.png", "naipes/7-Oro.png", "naipes/8-Oro.png", "naipes/9-Oro.png", "naipes/10-Oro.png", "naipes/11-Oro.png", "naipes/12-Oro.png",
    "naipes/1-Copa.png", "naipes/2-Copa.png", "naipes/3-Copa.png", "naipes/4-Copa.png", "naipes/5-Copa.png", "naipes/6-Copa.png", "naipes/7-Copa.png", "naipes/8-Copa.png", "naipes/9-Copa.png", "naipes/10-Copa.png", "naipes/11-Copa.png", "naipes/12-Copa.png",
    "naipes/1-Espada.png", "naipes/2-Espada.png", "naipes/3-Espada.png", "naipes/4-Espada.png", "naipes/5-Espada.png", "naipes/6-Espada.png", "naipes/7-Espada.png", "naipes/8-Espada.png", "naipes/9-Espada.png", "naipes/10-Espada.png", "naipes/11-Espada.png", "naipes/12-Espada.png",
    "naipes/1-Baston.png", "naipes/2-Baston.png", "naipes/3-Baston.png", "naipes/4-Baston.png", "naipes/5-Baston.png", "naipes/6-Baston.png", "naipes/7-Baston.png", "naipes/8-Baston.png", "naipes/9-Baston.png", "naipes/10-Baston.png", "naipes/11-Baston.png", "naipes/12-Baston.png",]; //cards to use
let push_cards = []; // cards which are send to players

// shuffle cards
shuffle(new_cards);
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
            let pos = 0;
            var card = {
                value: new_cards[pos],
                status: (i < 2) ? "hidden" : "visible"
            };
            c.push(card);
            // remove from deck
            new_cards.splice(pos, 1);
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
        socket.emit('new_status', info); //especificamente el que se ha comunicado con el servidor
        // send rest player accepted
        socket.broadcast.emit('player_accepted', ""); //broadcast = todos los clientes menos el que se ha comunicado

        if (players.length === 4) {
            game_status.status = "started";
            _current_turn = 0
            game_status.turn = players[_current_turn].name;
            io.emit('game_status', game_status);
        }
    });

    socket.on('get_card', function (data) {
        switchCard(data.player.name, data.index_change);
        // send him info and cards
        socket.emit('get_card_response', players[getPlayerIndex(data.player.name)]);

        // send all players new pushed card
        io.emit('new_pushed_card', push_cards[push_cards.length - 1]); //enviar informacion a todos (incluido el que manda)
        alert_change_turn();
    });

    socket.on('use_special_card', function (data) {
        let card = new_cards[0]; // view which card is on top
        console.log("Card on top: " + card);
        let val = parseInt(card.split("/")[1].split("-")[0]);
        let done = false;
        if (val === 10) {
            // let be visible the first of his hidden cards
            for (var i = 0; i < players[_current_turn].cards.length && !done; i++) {
                if (players[_current_turn].cards[i].status === "hidden") {
                    players[_current_turn].cards[i].status = "visible";
                    done = true;
                }
            }
            // send him his new status
            var info = {
                num_players: players.length,
                player_info: players[_current_turn]
            }

            socket.emit('new_status', info);

        } else if (val === 11) {

        } else if (val === 12) {

        }
        moveToPushed();
        alert_change_turn();
    });

    socket.on('request_deck_card', function (data) {
        let info = {
            card: new_cards[0],
            action: data
        }
        socket.emit('response_deck_card', info);
        //socket.on hace la la tarea que sea con la informacion pasada
        //y responde lo que tenga que saber al cliente para poder actualizar lo que ve el cliente.
    });

    socket.on('move_card_to_pushed', function (data) {
        moveToPushed();
        alert_change_turn();
    });

    socket.on('use_special_card', function (data) {

        //boton get card
        // cogemos valor de esa carta
        // 10 = otra de sus cartas es visible. (card3)
        // 11 = cambio de carta con otro jugador sin saber el valor
        // 12 = cambio de carta viendo el valor de la carta del otro jugador.

        //if (10||11||12) = opcion de utilzar el special card o de dejar la carta como otras.
        //reconocer el valor de esa carta.

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
    let pos = 0;
    var random_card = new_cards[0];
    new_cards.splice(pos, 1);
    push_cards.push(player_card.value);
    var card = {
        value: random_card,
        status: player_card.status
    };
    players[getPlayerIndex(name)].cards[index_change] = card;
}

function moveToPushed() {
    var card = new_cards[0];
    new_cards.splice(0, 1);
    push_cards.push(card);
    io.emit('new_pushed_card', push_cards[push_cards.length - 1]);
}

// shuffle array of cards
function shuffle(array) {
    var currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

function alert_change_turn() {
    game_status.status = "started";
    _current_turn++;
    if (_current_turn === 4) {
        _current_turn = 0;
    }
    game_status.turn = players[_current_turn].name;
    io.emit('game_status', game_status);
}
