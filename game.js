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

    getCellIndices(x, y) {
        let j = Math.floor(x / 50);
        let i = Math.floor(y / 50);
        return [i, j];
    }

    playerCanMoveTo(x, y) {
        // check if new position is inside wall
        let pos = this.getCellIndices(x, y);
        return this.matrix[pos[0]][pos[1]] == 0;
    }

    drawPlayer(direction=true, rays=true) {
        this.ctx.beginPath();
        this.ctx.arc(this.player.x, this.player.y, this.player.r, 0, 2 * Math.PI);
        this.ctx.stroke();

        if (direction) {
            let theta = this.player.orientation;
            let len = 100
            let endX = this.player.x + len * Math.cos(Math.PI * theta / 180.0);
            let endY = this.player.y + len * Math.sin(Math.PI * theta / 180.0);
            this.drawLine(this.player.x, this.player.y, endX, endY);
        }

        if (rays) {
            this.drawRays();
        }
    }

    drawRays() {

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

    indexOutOfBound(i, j) {
        return (i < 0 || i > this.matrix.length) || 
                (j < 0 ||j > this.matrix[0].length);
    }

    calculateRays() {
        let rays = new Array(this.player.nrays);
        let pos = this.getCellIndices(this.player.x, this.player.y);
        let dx, dy, c, theta, i ,j;
        let maxDepth = 8;

        for (let raynum = 0; raynum < this.player.nrays; raynum++) {
            theta = this.player.orientation;

            // looking up
            if (theta < 0) {
                // check horizontally
                let secondQuadrant = false;
                theta = Math.abs(theta);
                
                // if in second quadrant
                if (theta > 90) {
                    theta -= 90;
                    secondQuadrant = true;
                } else {
                    theta = 90 - theta;
                }
                console.log(`Theta: ${theta}`);

                for (let depth = 0; depth < maxDepth; depth++) {
                    if (pos[0] - depth < 0) {
                        break;
                    }
                    // distance on y-axis
                    dy =  this.player.y - ((pos[0] - depth) * this.cellHeight);
                    // distance on x-axis
                    dx = Math.tan(theta * Math.PI/ 180) * dy;
                    // distance to wall
                    c = dy / Math.cos(theta * Math.PI / 180);
                    console.log(`dx: ${dx}, dy: ${dy}, c: ${c}`);

                    // get y coordinate
                    i = pos[0] - 1 * (depth + 1);

                    // get x coordinate
                    if (secondQuadrant) {
                        console.log((this.player.x - dx) / this.cellWidth);
                        j = Math.trunc((this.player.x - dx) / this.cellWidth);
                        console.log(j);
                    } else {
                        console.log((this.player.x + dx) / this.cellWidth);
                        j = Math.trunc((this.player.y + dx) / this.cellWidth);
                        console.log(j);
                    }

                    // check if out of bound
                    if (this.indexOutOfBound(i, j)) return;

                    // check if hit wall
                    if (this.matrix[i][j] == 1) {
                        console.log("hit a wall");
                        console.log(`x: ${j}, y: ${i}`);
                        break;
                    }
                    console.log(`x: ${j}, y: ${i}`);
                }
            }
            // looking down
            else if (theta > 0) {
                // check horizontally
                let thirdQuadrant = false;
                theta = Math.abs(theta);
                
                // if in second quadrant
                if (theta > 90) {
                    theta -= 90;
                    thirdQuadrant = true;
                } else {
                    theta = 90 - theta;
                }
                console.log(`Theta: ${theta}`);

                for (let depth = 0; depth < maxDepth; depth++) {
                    if (pos[0] + depth > this.matrix.length) {
                        break;
                    }
                    // distance on y-axis
                    dy =  (pos[0] + 1 + depth) * this.cellHeight - this.player.y;
                    // distance on x-axis
                    dx = Math.tan(theta * Math.PI / 180) * dy;
                    // distance to wall
                    c = dy / Math.cos(theta * Math.PI / 180);
                    console.log(`dx: ${dx}, dy: ${dy}, c: ${c}`);

                    // get y coordinate
                    
                    console.log(`Q3: ${thirdQuadrant}`);
                    // get x coordinate
                    if (thirdQuadrant) {
                        j = pos[0] - 1 * (depth + 1);
                        i = pos[1] + Math.ceil(dx / this.cellWidth);
                    } else {
                        i = pos[0] + 1 * (depth + 1);
                        j = pos[1] - Math.floor(dx / this.cellWidth);
                    }

                    // check if out of bound
                    if (this.indexOutOfBound(i, j)) return;

                    // check if hit wall
                    if (this.matrix[i][j] == 1) {
                        console.log("hit a wall");
                        console.log(`x: ${j}, y: ${i}`);
                        break;
                    }
                    console.log(`x: ${j}, y: ${i}`);
                }
            }
        }
    }
}