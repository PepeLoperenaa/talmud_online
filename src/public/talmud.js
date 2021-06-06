//client page. each variable is different for every player
var last_action = "";
var socket;
var game_status = {};
var me = null;
var open_chairs = 1;

//steps 1: funcion en HTMl
// 2: hacer funcion en cliente
// 3: socket.emit al servidor
// 4: socket.on en el servidor
// 5:socket.on en el cliente

function prepareGame() {
    //socket.on = respuesta del servidor para hacer una accion / visualizacion etc.
    socket = io.connect('http://localhost:3000', {
        'forceNew': true
    });

    socket.on('start_game', function (data) {
        if (open_chairs === 4) {
            document.getElementById('start').style.visibility = 'hidden';
            window.alert("The game is about to start");
        } else {
            window.alert("There is still open chairs!");
        }
        //visibility needs to be hidden for every player too.
        //on the server it shows that 4 players are connected. now in teh client it does not show.
    });

    socket.on('game_status', function (data) {
        game_status = data;
        enable_buttons(data.turn === me.name);
    });

    socket.on('error', function (data) {
        window.alert("Full room!");
    });

    socket.on('new_status', function (data) {
        me = data.player_info;
        renderStatus(data);
    });

    socket.on('get_card_response', function (data) {
        me = data;
        console.log("get_card_response: " + data);
        updateStatus(data);
    });

    socket.on('new_pushed_card', function (data) {
        console.log('new_pushed card ' + data);
        document.getElementById("oldDeck").style.visibility = "visible";
        document.getElementById("pushed_card").src = data;
    });

    socket.on('player_accepted', function (data) {
        renderNewPlayer();
    });

    socket.on('response_deck_card', function (data) {
        console.log("card on deck: " + data);
        document.getElementById("available_card").src = data;
        document.getElementById("message").innerHTML = "Change card?";
        last_action = "showDeck";
        enable_yes_no_buttons(true);
    });

    socket.on('get_value_of_cards', function (data){
      //what the client needs to do
    });

    socket.on('use_special_card', function (data){
      //what the client needs to do
    });
}

function startGame() {
    socket.emit('start_game');
}

function renderNewPlayer() { // When new players come in, then their cards are rendered into the game.
    open_chairs++;
    console.log("opened chair number " + open_chairs);
    var div = document.getElementById("player" + open_chairs + "Cards");
    div.style.visibility = 'visible';
}

function renderStatus(data) {
    console.log(data);

    for (var i = 1; i <= data.player_info.cards.length; i++) {
        var div = document.getElementById("card" + i);
        if (data.player_info.cards[i - 1].status === "visible") {
            var path = "/" + data.player_info.cards[i - 1].value;
            div.innerHTML = "<img src='" + path + "' alt=\"card\">";
        } else {
            div.innerHTML = "<img src='naipes/reves.png' alt=\"card\">"
        }
    }
    document.getElementById('OnlinePlayer').style.visibility = "hidden";

    // open as many chairs as number of players in
    for (var j = 0; j < data.num_players - 1; j++) {
        renderNewPlayer();
    }
}

function updateStatus(data) {
    console.log(data);

    for (var i = 1; i <= data.cards.length; i++) {
        var div = document.getElementById("card" + i);
        if (data.cards[i - 1].status === "visible") {
            var path = "/" + data.cards[i - 1].value;
            div.innerHTML = "<img src='" + path + "' alt=\"card\">"; //2 cartas con valor
        } else {
            div.innerHTML = "<img src='naipes/reves.png' alt=\"card\">" //2 cartas que no se saben el valor
        }
    }

}

function playerOn() {
    prepareGame();

    const c = document.getElementById('player1Cards');
    c.setAttribute("style", "visibility:visible");
    socket.emit('new_player', 'access');
    return false;
}

function showDeck() {
    // request view deck card
    socket.emit('request_deck_card', ""); //esto es lo que se envia al servidor
}

function getCard() { //when we get the card, show what the value of the card is before changing it.
    //var new_card = switchCard
    var index = window.prompt("Choose one of your cards (1-" + me.cards.length + ")", "-1");
    if (index === null || index === "-1") {
        document.getElementById("available_card").src = "naipes/reves.png";
        return;
    }

    index = parseInt(index) - 1;

    var change = {
        player: me,
        index_change: index
    }

    // hide again deck
    document.getElementById("available_card").src = "naipes/reves.png";

    socket.emit('get_card', change);

}

function moveCardToPushed() {
    socket.emit('move_card_to_pushed', "");
    //socket.emit = hacer llamada al servidor
}


function use_special_card(card){
    socket.emit('use_special_card');
    //if(get_value_of_cards() === card){
        //2 step process to use the special card and what it does.
    //} //it can even be a switch case and that could help too.
}

function card_same_value(card){
    socket.emit('get_value_of_cards');
    //if(get_value_of_cards() === card){
    //} // check if the values are the same. do the HTMl process if thats the case.
}


function enable_buttons(active) {
    // enable/disable buttons
}


function enable_yes_no_buttons(show) {
    document.getElementById("yes").style.visibility = show ? "visible" : "hidden";
    document.getElementById("no").style.visibility = show ? "visible" : "hidden";
}

function yes() {
    enable_yes_no_buttons(false);
    document.getElementById("message").innerHTML = ""
    if (last_action === "showDeck") {
        getCard();
    }
    last_action = "";
}

function no() {
    enable_yes_no_buttons(false);
    document.getElementById("message").innerHTML = ""
    if (last_action === "showDeck") {
        moveCardToPushed();
        document.getElementById("available_card").src = "naipes/reves.png";
    }
    last_action = "";
}

//function pass_turn(){
    //socket.emit('pass_turn');
//}


