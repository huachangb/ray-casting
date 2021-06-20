let canvas, ctx, player, game;

window.onload = () => {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    player = new Player(80, 80);

    game = new Game(ctx, canvas, player);
    game.start();
};

window.addEventListener("keydown", move);

function move(e) {
    let newX = game.player.x;
    let newY = game.player.y;

    switch(e.keyCode) {
        case 37:
            // left arrow key
            newX -= game.player.speed; 
            break;
        case 38:
            // up array key
            newY -= game.player.speed; 
            break;
        case 39:
            // right arrow key
            newX += game.player.speed; 
            break;
        case 40:
            // down arrow key
            newY += game.player.speed; 
            break; 
        default:
            return;
    }

    // check if new position valid
    if ((newX < 0 || newX > game.canvas.width) || 
        (newY < 0 || newY > game.canvas.height) ||
        (!game.playerCanMoveTo(newX, newY))) return;
    game.player.move(newX, newY);
}
