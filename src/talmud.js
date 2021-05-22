const alert = "Welcome to the game";


function fadeIn(){
    $('OnlinePlayer').on({
        'click': function (){
            $('player1Cards').fadeIn("slow");
        }
    })
}
function playerOn() {
    window.alert(alert);
    const c = document.getElementById('player1Cards');
    c.setAttribute("style", "visibility:visible"); //dont know if jquery code goes here for the fade in.
}
