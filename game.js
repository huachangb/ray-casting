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

    playerCanMoveTo(x, y) {
        // check if new position is inside wall
        let j = Math.floor(x / 50);
        let i = Math.floor(y / 50);
        return this.matrix[i][j] == 0;
    }

    drawPlayer() {
        this.ctx.beginPath();
        this.ctx.arc(this.player.x, this.player.y, this.player.r, 0, 2 * Math.PI);
        this.ctx.stroke();
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