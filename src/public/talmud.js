//client page. each variable is different for every player
let last_action = "";
let socket;
let game_status = {};
let me = null;
let open_chairs = 1;

//steps 1: function in HTMl
// 2: do the function in the client
// 3: socket.emit to server
// 4: socket.on en the server
// 5:socket.on en the client

function prepareGame() {
    //socket.on = answer of the server to do an action or visualization
    socket = io.connect('http://localhost:3000', {
        'forceNew': true
    });

    socket.on('game_status', function (data) {
        console.log(data);
        game_status = data;
        if(data.turn === me.name)
            gained_turn();
        else
            lost_turn();
    });

    socket.on('error', function (data) {
        window.alert("Full room!");
    });

    socket.on('new_status', function (data) {
        me = data.player_info;
        renderStatus(data); //TODO: ver si de verdad hemos recibido lo que es (special card 11) console.log
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

    socket.on('player_accepted', function (data) { //do we need data here?
        renderNewPlayer();
    });

    socket.on('response_deck_card', function (data) {
        console.log("card on deck: " + data.card);
        document.getElementById("available_card").src = data.card;

        // reads card value
        let val = parseInt(data.card.split("/")[1].split("-")[0]);

        document.getElementById("changeCard").style.visibility = "visible"; //need to make them disappear after use.
        document.getElementById("dontChangeCard").style.visibility = "visible"; //problem when pushing as we can see the old value.
        document.getElementById("message").innerHTML = "Which action to do?";

        // habilitar siempre botones de quedarte con la carta y devolver la carta
        // need to make it visible and invisible when the client finishes.

        if (val >= 10) {
            document.getElementById('specialAbility').style.visibility = "visible"; //need to make them disappear after use.
        }

        // boton usar habilidad llamaria a use_special_card(); -- por terminar funcionalidad
    });

    socket.on('use_special_card', function (data) {
    });
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
    socket.emit('request_deck_card', "showDeck"); //what is sent to the server.
}

function specialAbility() {
    socket.emit('request_deck_card', "specialAbility");
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
    //socket.emit = do the call to the server
}

function use_special_card() {
    console.log("use_special_card");
    let card = document.getElementById("available_card").src;
    let last_index_bar = card.lastIndexOf("/");
    console.log("last bar: " + last_index_bar);
    card = card.substring(last_index_bar+1);
    console.log(card);
    let val = parseInt(card.split("-")[0]);
    console.log("val:"+val);
    if(val===10) {
        socket.emit('use_special_card', '');
    }
    else if(val===11) {
        let id_players = "";
        let my_id = parseInt(me.name.split("_")[1]);
        for(let i=1;i<=4;i++) {
            if(i!==my_id)
                id_players+= (i+",");
        }
        id_players = id_players.replace(/,\s*$/, "");

        var target_player = window.prompt("Choose one of your opponents ("+id_players+")", "-1");
        if (target_player === null || target_player === "-1" || target_player===""+my_id) {
            document.getElementById("available_card").src = "naipes/reves.png";
            return;
        }
        target_player = parseInt(target_player) - 1;

        var index = window.prompt("Choose one of your cards (1-" + me.cards.length + ")", "-1");
        if (index === null || index === "-1") {
            document.getElementById("available_card").src = "naipes/reves.png";
            return;
        }

        index = parseInt(index) - 1;

        let change = {
            card_index: index,
            target_player: target_player
        }

        socket.emit('use_special_card', change); //use spacial card against index player
    }
}

function gained_turn() {
    document.getElementById("showDeck").style.visibility = "visible";
}

function lost_turn() {
    console.log("lost turn");
    document.getElementById("showDeck").style.visibility = "hidden";
    document.getElementById("dontChangeCard").style.visibility = "hidden";
    document.getElementById("changeCard").style.visibility = "hidden";
    document.getElementById("specialAbility").style.visibility = "hidden";
    document.getElementById("message").style.visibility = "hidden";
}



/*function enable_yes_no_buttons(show) {
    document.getElementById("yes").style.visibility = show ? "visible" : "hidden";
    document.getElementById("no").style.visibility = show ? "visible" : "hidden";
}*/

/*function yes() {
    enable_yes_no_buttons(false);
    document.getElementById("message").innerHTML = "";
    if (last_action === "showDeck") {
        getCard();
    } else if (last_action === "specialAbility") {
        use_special_card();
    }
    last_action = "";
}*/

/*function no() {
    enable_yes_no_buttons(false);
    document.getElementById("message").innerHTML = ""
    if (last_action === "showDeck" || last_action === "specialAbility") {
        moveCardToPushed();
        document.getElementById("available_card").src = "naipes/reves.png";
    }
    last_action = "";
}*/

