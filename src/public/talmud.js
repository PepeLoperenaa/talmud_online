//client page. each variable is different for every player
let socket;
let game_status = {};
let me = null;
let open_chairs = 1;
let talmud_base_mark = 5; //to win the game.

/**
 * Steps
 * 1: function in HTMl
 * 2: do the function in the client
 * 3: socket.emit to server
 * 4: socket.on en the server
 * 5:socket.on en the client
 */

/**
 *  Preparing the game to the different clients that come in
 */
function prepareGame() {
    //socket.on = answer of the server to do an action or visualization
    socket = io.connect('http://localhost:3000', {
        'forceNew': true
    });

    socket.on('game_status', function (data) {
        console.log(data);
        game_status = data;
        if (data.turn === me.name)
            gained_turn();
        else
            lost_turn();
    });

    socket.on('error', function (data) {
        window.alert("Full room!");
    });

    socket.on('new_status', function (data) {
        me = data.player_info;
        renderStatus(data);
        console.log(data.player_info);
        console.log(data);
    });

    socket.on('get_card_response', function (data) {
        me = data;
        console.log("get_card_response: " + data);
        updateStatus(data);
    });

    socket.on('new_pushed_card', function (data) {
        console.log('new_pushed card ' + data);
        document.getElementById("oldDeck").style.visibility = 'visible';
        document.getElementById("available_card").src = 'naipes/reves.png';
        document.getElementById("pushed_card").src = data;
    });

    socket.on('player_accepted', function (data) {
        renderNewPlayer();
    });

    socket.on('response_deck_card', function (data) {
        console.log("card on deck: " + data.card);
        document.getElementById("available_card").src = data.card;

        // reads card value
        let val = parseInt(data.card.split("/")[1].split("-")[0]);

        document.getElementById("changeCard").style.visibility = "visible";
        document.getElementById("dontChangeCard").style.visibility = "visible";
        document.getElementById("message").innerHTML = "Which action to do?";


        if (val >= 10) {
            document.getElementById('specialAbility').style.visibility = "visible";
        }
    });

    socket.on('scream_talmud', function (data) {
        me = data.player_info

        if (me >= 5) {
            alert("You have won the game");
            socket.disconnect()
        } else {
            alert("You have not won the game");
        }
    });

    socket.on('game_end', function (data) {
        document.getElementById("end_message").innerHTML = data;
        // When game finishes, Title changes.
        lost_turn();
    });
}

/**
 *  When new players come in, then their cards are rendered into the game.
 */
function renderNewPlayer() {
    open_chairs++;
    console.log("opened chair number " + open_chairs);
    let div = document.getElementById("player" + open_chairs + "Cards");
    div.style.visibility = 'visible';
}

/**
 * Render the cards of the specific client.
 * @param data
 */
function renderStatus(data) {
    console.log(data);
    let i = 1;
    for (i = 1; i <= data.player_info.cards.length; i++) {
        var div = document.getElementById("card" + i);
        if (data.player_info.cards[i - 1].status === "visible") {
            var path = "/" + data.player_info.cards[i - 1].value;
            div.innerHTML = "<img src='" + path + "' alt=\"card\">";
        } else {
            div.innerHTML = "<img src='naipes/reves.png' alt=\"card\">"
        }
    }

    for (let j = i; j <= 4; j++) {
        document.getElementById("card" + i).style.visibility = "hidden";
    }

    document.getElementById('OnlinePlayer').style.visibility = "hidden";

    // open as many chairs as number of players in
    for (var j = 0; j < data.num_players - 1; j++) {
        renderNewPlayer();
    }
}

/**
 * After a turn has been done update the status of the client.
 * @param data
 */
function updateStatus(data) {
    console.log(data);
    for (var i = 1; i <= data.cards.length; i++) {
        var div = document.getElementById("card" + i);
        if (data.cards[i - 1].status === "visible") {
            var path = "/" + data.cards[i - 1].value;
            div.innerHTML = "<img src='" + path + "' alt=\"card\">"; //2 cards with value
        } else {
            div.innerHTML = "<img src='naipes/reves.png' alt=\"card\">" // 2 cards which we do not now the value
        }
    }

}

/**
 * Calls into the server to add more players.
 * @returns {boolean}
 */
function playerOn() {
    prepareGame();

    const c = document.getElementById('player1Cards');
    c.setAttribute("style", "visibility:visible");
    socket.emit('new_player', 'access');
    return false;
}

/**
 * Calls into the server to show the deck on a players turn
 */
function showDeck() {
    // request view deck card
    socket.emit('request_deck_card', "showDeck"); //what is sent to the server.
}

/**
 * Special ability function that calls into the server.
 */
function specialAbility() {
    socket.emit('request_deck_card', "specialAbility");
}

/**
 * when we get the card, show what the value of the card is before changing it.
 */
function getCard() {
    let index = window.prompt("Choose one of your cards (1-" + me.cards.length + ")", "-1");
    if (index === null || index === "-1") {
        document.getElementById("available_card").src = "naipes/reves.png";
        return;
    }

    index = parseInt(index) - 1;

    var change = {
        player: me,
        index_change: index
    }

    // hide deck again
    document.getElementById("available_card").src = "naipes/reves.png";

    socket.emit('get_card', change);

}

/**
 * Moving card to pushed array
 */

function moveCardToPushed() {
    socket.emit('move_card_to_pushed', "");
    //socket.emit = do the call to the server
}

/**
 * Using special cards such as number 10 and number 11.
 */
function use_special_card() {
    let card = document.getElementById("available_card").src;
    let last_index_bar = card.lastIndexOf("/");
    card = card.substring(last_index_bar + 1);
    let val = parseInt(card.split("-")[0]); //getting the value of the cards
    if (val === 10) {
        socket.emit('use_special_card', ''); //call into the server.
    } else if (val === 11) {
        let id_players = "";
        let my_id = parseInt(me.name.split("_")[1]);
        console.log("My ID: " + my_id);
        for (let i = 1; i <= 4; i++) { //iterating through the 4 players.
            if (i !== my_id)
                id_players += (i + ",");
        }
        id_players = id_players.replace(/,\s*$/, "");

        var target_player = window.prompt("Choose one of your opponents (" + id_players + ")", "-1");
        if (target_player === null || target_player === "-1" || target_player === "" + my_id) { // window.prompt available answers.
            document.getElementById("available_card").src = "naipes/reves.png";
            return;
        }
        target_player = parseInt(target_player) - 1;

        var index = window.prompt("Choose one of your cards (1-" + me.cards.length + ")", "-1");
        if (index === null || index === "-1") {  // window.prompt available answers.
            document.getElementById("available_card").src = "naipes/reves.png";
            return;
        }

        index = parseInt(index) - 1;

        let change = { //information of the change
            card_index: index,
            target_player: target_player
        }

        socket.emit('use_special_card', change); //use special card against index player

    }
}

function screamTalmud() {
    socket.emit('scream_talmud', me.name);
}

/**
 * If the cards have the same value we discard and play with only 3. Playing with only 3 cards can only be seen by the specific client.
 */
function discardCard() {

    let card = document.getElementById("pushed_card").src;
    console.log("src: " + card);
    if (card.endsWith(".png")) {
        let last_index_bar = card.lastIndexOf("/");
        card = card.substring(last_index_bar + 1);
        let val_pushed_card = parseInt(card.split("-")[0]);

        let pos_coincidence = -1;
        for (let i = 0; i < me.cards.length; i++) {
            let c = me.cards[i];
            console.log("card in discard: " + JSON.stringify(c)); //change the value from JSON into String.
            console.log("val_pushed_card " + val_pushed_card);
            if (c.status === "visible") {
                let v = parseInt(c.value.split("/")[1].split("-")[0])
                if (v => val_pushed_card)
                    pos_coincidence = i;
            }
        }

        let info = { //information about the coincidence
            player_index: parseInt(me.name.split("_")[1]) - 1,
            card_index: pos_coincidence
        }

        socket.emit('discard', info);
    }
}

/**
 * Changing turn of all of the players.
 */
function gained_turn() {
    document.getElementById("showDeck").style.visibility = "visible";

    let card = document.getElementById("pushed_card").src;
    let val_pushed_card = -1;
    if (card.endsWith(".png")) {
        let last_index_bar = card.lastIndexOf("/");
        card = card.substring(last_index_bar + 1);
        val_pushed_card = parseInt(card.split("-")[0]);
    }

    let sum = 0;
    let pos_coincidence = -1;
    for (let i = 0; i < me.cards.length; i++) {
        let c = me.cards[i];
        let v = parseInt(c.value.split("/")[1].split("-")[0])
        sum += v;
        if (c.status === "visible" && card.endsWith(".png")) {
            if (v === val_pushed_card)
                pos_coincidence = i;
        }
    }
    // decide to hide scream talmud button
    if (sum <= talmud_base_mark) {
        document.getElementById("screamTalmud").style.visibility = "visible";
    } else {
        document.getElementById("screamTalmud").style.visibility = "hidden";
    }
    // decide to hide discard button
    if (pos_coincidence !== -1) {
        document.getElementById("discard").style.visibility = "visible";
    } else {
        document.getElementById("discard").style.visibility = "hidden";
    }
}

/**
 * When losing a turn, all of the buttons disappear
 */
function lost_turn() {
    console.log("lost turn");
    document.getElementById("showDeck").style.visibility = "hidden";
    document.getElementById("dontChangeCard").style.visibility = "hidden";
    document.getElementById("changeCard").style.visibility = "hidden";
    document.getElementById("specialAbility").style.visibility = "hidden";
    document.getElementById("message").style.visibility = "hidden";
    document.getElementById("screamTalmud").style.visibility = "hidden";
    document.getElementById("discard").style.visibility = "hidden";
}

