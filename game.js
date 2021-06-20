class Game {
    constructor(ctx, canvas, player, cellWidth=50, cellHeight=50) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.player = player;
        this.matrix = this.createWalls();
        this.cellWidth = cellWidth;
        this.cellHeight = cellHeight;
    }

    start(interval=15) {
        this.update();
        setInterval(this.update.bind(this), interval);
    }

    update() {
        // clear canvas
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.drawWalls();
        this.drawPlayer();
    }

    movePlayer(direction) {
        let speed = this.player.speed;
        
        if (direction == "backward") {
            speed = -speed;
        }

        let theta = this.player.orientation;
        let newX = this.player.x + speed * Math.cos(Math.PI * theta / 180.0);
        let newY = this.player.y + speed * Math.sin(Math.PI * theta / 180.0);

        // check if valid position
        if ((newX < 0 || newX > game.canvas.width) || 
            (newY < 0 || newY > game.canvas.height) ||
            (!this.playerCanMoveTo(newX, newY))) return;

        
        this.player.move(newX, newY);
    }

    playerCanMoveTo(x, y) {
        // check if new position is inside wall
        let j = Math.floor(x / 50);
        let i = Math.floor(y / 50);
        return this.matrix[i][j] == 0;
    }

    drawPlayer(direction=true) {
        this.ctx.beginPath();
        this.ctx.arc(this.player.x, this.player.y, this.player.r, 0, 2 * Math.PI);
        this.ctx.stroke();

        if (direction) {
            let theta = this.player.orientation;
            let len = 25
            let endX = this.player.x + len * Math.cos(Math.PI * theta / 180.0);
            let endY = this.player.y + len * Math.sin(Math.PI * theta / 180.0);
            this.drawLine(this.player.x, this.player.y, endX, endY);
        }
    }

    drawWalls() {
        let x = 0;
        let y = 0;

        for (let i = 0; i < this.matrix.length; i++) {
            for (let j = 0; j < this.matrix[0].length; j++) {
                // horizontal walls
                if (this.matrix[i][j] == 1) {
                    this.drawLine(x, y, x + this.cellWidth, y);
                    this.drawLine(x, y + this.cellHeight, x + this.cellWidth, y + this.cellHeight);
                }

                // vertical walls
                if (this.matrix[i][j] == 1) {
                    this.drawLine(x, y, x, y + this.cellHeight);
                    this.drawLine(x + this.cellWidth, y, x + this.cellWidth, y + this.cellHeight);
                }

                x += this.cellWidth;
            }
            y += this.cellHeight;
            x = 0;
        }

    }

    drawLine(startX, startY, endX, endY) {
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
    }

    createWalls() {
        return [
            [1,1,1,1,1,1,1,1,1,1],
            [1,0,1,0,0,0,0,0,0,1],
            [1,0,1,0,0,1,0,0,0,1],
            [1,0,1,1,1,1,1,1,0,1],
            [1,0,0,1,0,0,0,0,0,1],
            [1,0,1,1,0,0,0,0,0,1],
            [1,0,0,0,0,1,0,1,1,1],
            [1,0,1,0,0,1,0,0,0,1],
            [1,0,1,0,0,1,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1]
        ];
    }
}