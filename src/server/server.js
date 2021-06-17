/**
 * Server class where server is created and server functions are made.
 * @type Express and Node.js are used to make the server.
 */

let express = require('express');
let app = express();
let server = require('http').Server(app);
let io = require('socket.io')(server);
let _current_turn = -1;

let talmud_base_mark = 5;

// game status
let game_status = {
    status: "awaiting",
    turn: ""
};

// players
let players = [];

// playable cards
let new_cards = ["naipes/1-Oro.png", "naipes/2-Oro.png", "naipes/3-Oro.png", "naipes/4-Oro.png", "naipes/5-Oro.png", "naipes/6-Oro.png", "naipes/7-Oro.png", "naipes/8-Oro.png", "naipes/9-Oro.png", "naipes/10-Oro.png", "naipes/11-Oro.png", "naipes/12-Oro.png",
    "naipes/1-Copa.png", "naipes/2-Copa.png", "naipes/3-Copa.png", "naipes/4-Copa.png", "naipes/5-Copa.png", "naipes/6-Copa.png", "naipes/7-Copa.png", "naipes/8-Copa.png", "naipes/9-Copa.png", "naipes/10-Copa.png", "naipes/11-Copa.png", "naipes/12-Copa.png",
    "naipes/1-Espada.png", "naipes/2-Espada.png", "naipes/3-Espada.png", "naipes/4-Espada.png", "naipes/5-Espada.png", "naipes/6-Espada.png", "naipes/7-Espada.png", "naipes/8-Espada.png", "naipes/9-Espada.png", "naipes/10-Espada.png", "naipes/11-Espada.png", "naipes/12-Espada.png",
    "naipes/1-Baston.png", "naipes/2-Baston.png", "naipes/3-Baston.png", "naipes/4-Baston.png", "naipes/5-Baston.png", "naipes/6-Baston.png", "naipes/7-Baston.png", "naipes/8-Baston.png", "naipes/9-Baston.png", "naipes/10-Baston.png", "naipes/11-Baston.png", "naipes/12-Baston.png",]; //cards to use
let push_cards = [];

// shuffle cards
shuffle(new_cards);

app.use(express.static('public')); //to find where all of the resources are.

/**
 * Connecting a player into the server
 */
io.on('connection', function (socket) {
    console.log('A user has connected to the server with the ID: ' + socket.id);
    socket.on('new_player', function (data) {

        if (players.length === 4) {
            socket.emit('error', "Full room!"); //only 4 players can come into the game.
            return;
        }

        // randomize cards
        var c = [];
        for (var i = 0; i < 4; i++) {
            let pos = 0;
            var card = {
                value: new_cards[pos],
                status: (i < 2) ? "hidden" : "visible" //two cards should be visible and the other 2 should be hidden
            };
            c.push(card);
            // remove from deck
            new_cards.splice(pos, 1);
        }

        var new_player = { //information about a player.
            name: "player_" + (players.length + 1),
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
        socket.emit('new_status', info);//message to specifically the one which communicates with the server
        // send rest player accepted
        socket.broadcast.emit('player_accepted', "");//send info to all of the players except to the one which sends info to the server
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
        io.emit('new_pushed_card', push_cards[push_cards.length - 1]); //send information to all players
        alert_change_turn();
    });

    socket.on('use_special_card', function (data) {
        let card = new_cards[0]; // view which card is on top
        let val = parseInt(card.split("/")[1].split("-")[0]);
        let done = false;
        if (val === 10) { //value 10 shows another one of your cards.
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

        } else if (val === 11) { // change card with another player without knowing the value.
            let target_player = data.target_player; //player which we are going to change the cards
            let card_index = data.card_index; //the card we are going to change.
            changeCards(target_player, card_index);

            var info = { //info of the player which is using the special card
                num_players: players.length,
                player_info: players[_current_turn]
            }

            socket.emit('new_status', info);
            console.log(info);

            var info2 = { //info of the player where the card has changed.
                num_players: players.length,
                player_info: players[target_player]
            }

            socket.broadcast.to(players[target_player].socket).emit('new_status', info2);
            console.log(players[target_player]);
            console.log(info2);

        }
        moveToPushed();
        alert_change_turn();
    });

    /**
     * Getting cards from the deck of cards.
     */
    socket.on('request_deck_card', function (data) {
        let info = {
            card: new_cards[0],
            action: data
        }
        socket.emit('response_deck_card', info);
    });

    /**
     * pushing card into array
     */
    socket.on('move_card_to_pushed', function (data) {
        moveToPushed();
        alert_change_turn();
    });

    /**
     * Finishing the game if a player has a value less than 5
     */
    socket.on('scream_talmud', function (data) {
        let player_index = parseInt(data.split("_")[1]) - 1; //getting value of the 4 cards.
        let cards = players[player_index].cards;
        let sum = 0;
        for (let i = 0; i < players[player_index].cards.length; i++) {
            let c = players[player_index].cards[i];
            sum += parseInt(c.value.split("/")[1].split("-")[0]);
        }

        if (sum >= talmud_base_mark) {
            console.log("Game is about to end");
            io.emit("game_end", 'Player player_' + (player_index + 1) + ' won the game');
        }


    });

    /**
     * Discarding the cards if the value is the same
     */
    socket.on('discard', function (data) {
        let player_index = data.player_index;
        let card_index = data.card_index;

        console.log(data);

        let user_card_value = players[player_index].cards[card_index].value;
        players[player_index].cards.splice(card_index, 1);

        var info = {
            num_players: players.length,
            player_info: players[player_index]
        }

        socket.emit('new_status', info);

        push_cards.push(user_card_value);

        io.emit('new_pushed_card', push_cards[push_cards.length - 1]); //send information to all players

        alert_change_turn();
    });
});

server.listen(3000, function () { //where the server is going to run.
    console.log("Server is running in: http://localhost:3000");
});

/**
 * Getting the clients Player name E.G: player1
 * @param name
 * @returns {number}
 */
function getPlayerIndex(name) {
    var index;
    for (var i = 0; i < players.length; i++) {
        if (players[i].name === name)
            index = i;
    }
    return index;
}

/**
 * Switching cards with the ones in the deck.
 * @param name
 * @param index_change
 */
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

/**
 * Used cards to be pushed on the pushed cards array.
 */
function moveToPushed() {
    var card = new_cards[0];
    new_cards.splice(0, 1); //method splice deletes one object from an array. In this case a card.
    push_cards.push(card);
    io.emit('new_pushed_card', push_cards[push_cards.length - 1]);
}

/**
 * Change cards with another player.
 * @param target_player the player where the card where is going to be changed
 * @param card_index //what card is to be changed.
 */
function changeCards(target_player, card_index) {
    let random_index = Math.floor(Math.random() * 4); // 0-3

    let target_card = players[target_player].cards[random_index];
    let user_card = players[_current_turn].cards[card_index];

    players[_current_turn].cards[card_index] = target_card;
    players[_current_turn].cards[card_index].status = "hidden";
    players[target_player].cards[random_index] = user_card;
    players[target_player].cards[random_index].status = "hidden";
}

/**
 * Shuffle the array of cards
 * @param array
 * @returns {*} returns the array shuffled
 */
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

/**
 * Alerting players that the turns have changed.
 */
function alert_change_turn() {
    game_status.status = "started";
    _current_turn++;
    if (_current_turn === 4) {
        _current_turn = 0;
    }
    game_status.turn = players[_current_turn].name;
    io.emit('game_status', game_status);
}
