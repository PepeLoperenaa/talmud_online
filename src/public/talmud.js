const alert = "Welcome to the game";

var me = null;

var socket = io.connect('http://localhost:3000', {
    'forceNew': true
});

socket.on('info', function(data) {
    me = data;
    render(data);
});

function render (data) {
    console.log(data);

    for(var i=1;i<=data.cards.length;i++) {
        var div = document.getElementById("card"+i);
        var path = "/naipes/"+data.cards[i-1];
        div.innerHTML = "<img src='"+ path+ "' alt=\"card\">";
    }
}

function playerOn() {
    const c = document.getElementById('player1Cards');
    c.setAttribute("style", "visibility:visible"); //dont know if jquery code goes here for the fade in.
    socket.emit('new_player', 'jugador1');
    return false;
}

// pedir carta al servidor, indicando quien soy
function requestCard() {
    socket.emit('get_card', me.name);
    // el servidor responde con info de sus nuevas cartas
    return false;
}