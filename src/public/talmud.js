const alert = "Welcome to the game";

var game_status = {};
var me = null;
var open_chairs = 1;

var socket = io.connect('http://localhost:3000', {
    'forceNew': true
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

socket.on('player_accepted', function (data) {
    renderNewPlayer();
});

function renderNewPlayer() {
    open_chairs++;
    console.log("opened chair number " + open_chairs);
    var div = document.getElementById("player" + open_chairs + "Cards");
    div.style.visibility = 'visible'; //if a new player comes into the game, then show new cards on the main page.
    /*
    Need to add the ID of the player so that when a player comes into the game, the other cards are already added if needed.
     */
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

    // open as many chais as number of players in
    for (var i = 0; i < data.num_players - 1; i++) {
        renderNewPlayer();
    }
}

function updateStatus(data) {
    console.log(data);

    for (var i = 1; i <= data.cards.length; i++) {
        var div = document.getElementById("card" + i);
        if (data.cards[i - 1].status === "visible") {
            var path = "/" + data.cards[i - 1].value;
            div.innerHTML = "<img src='" + path + "' alt=\"card\">";
        } else {
            div.innerHTML = "<img src='naipes/reves.png' alt=\"card\">"
        }
    }

}

function playerOn() {
    const c = document.getElementById('player1Cards');
    c.setAttribute("style", "visibility:visible"); //dont know if jquery code goes here for the fade in.
    socket.emit('new_player', 'access');
    return false;
}

// pedir carta al servidor, indicando quien soy
function getCard() {

    var index = window.prompt("Choose one of your cards (1-" + me.cards.length + ")", "-1");
    if (index === "-1") {
        return;
    }

    index = parseInt(index) - 1;

    var change = {
        player: me,
        index_change: index
    }

    socket.emit('get_card', change);

    document.getElementById("pushed_card").src = me.cards[index].value;
    document.getElementById("oldDeck").style.visibility = "visible";
}

function enable_buttons(active) {
    // enable/disable buttons
}