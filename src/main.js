let map2D, perspective3D, game, player;

window.onload = () => {
    map2D = new GUI("canvas", 500, 500);
    perspective3D = new GUI("output", 500, 500);
    player = new Player(270, 270);
    game = new Game(map2D, player);
    // game.start(1000);
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
