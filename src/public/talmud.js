const alert = "Welcome to the game";

var me = null;
var open_chairs = 1;

var socket = io.connect('http://localhost:3000', {
    'forceNew': true
});

socket.on('new_status', function (data) {
    me = data;
    renderStatus(data);
});

socket.on('player_accepted', function (data) {
    renderNewPlayer(data);
});

function renderNewPlayer(data) {
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

    for (var i = 1; i <= data.cards.length; i++) {
        var div = document.getElementById("card" + i);
        var path = "/" + data.cards[i - 1];
        div.innerHTML = "<img src='" + path + "' alt=\"card\">";
    }
}

function playerOn() {

    const c = document.getElementById('player1Cards');
    c.setAttribute("style", "visibility:visible"); //dont know if jquery code goes here for the fade in.
    socket.emit('new_player', 'access');
    return false;
}

// pedir carta al servidor, indicando quien soy
function requestCard() {
    socket.emit('get_card', me.name);
    // el servidor responde con info de sus nuevas cartas
    return false;
}