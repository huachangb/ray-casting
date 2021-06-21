let canvas, ctx, player, game;

window.onload = () => {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    player = new Player(260, 277);

    game = new Game(ctx, canvas, player);
    game.start();
};

window.addEventListener("keydown", move);

function move(e) {
    switch(e.keyCode) {
        case 37:
            // left arrow key
            game.turnPlayer("left");
            break;
        case 38:
            // up array key - forward
            game.movePlayer("forward")
            break;
        case 39:
            // right arrow key
            game.turnPlayer("right"); 
            break;
        case 40:
            // down arrow key - backward
            game.movePlayer("backward")
            break;
        default:
            return;
    }
}
