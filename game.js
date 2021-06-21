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
        this.calculateRays();
        this.update();
        setInterval(this.update.bind(this), interval);
    }

    update() {
        // clear canvas
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.drawWalls();
        this.drawPlayer();
    }

    turnPlayer(direction) {
        this.player.turn(direction);
        this.calculateRays();
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
        this.calculateRays();
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
            let len = 20;
            let endX = this.player.x + len * Math.cos(Math.PI * theta / 180.0);
            let endY = this.player.y + len * Math.sin(Math.PI * theta / 180.0);
            this.drawLine(this.player.x, this.player.y, endX, endY);
        }

        if (rays) {
            this.drawRays();
        }
    }

    drawRays() {
        if (this.player.rays == null) return;

        for (let i = 0; i < this.player.rays.length; i++) {
            this.ctx.moveTo(this.player.rays[i].startX, this.player.rays[i].startY);
            this.ctx.lineTo(this.player.rays[i].endX, this.player.rays[i].endY);
            this.ctx.strokeStyle = "#FF0000";
            this.ctx.stroke();
            this.ctx.strokeStyle = "#000000";
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

    indexOutOfBound(i, j) {
        return (i < 0 || i > this.matrix.length) || 
                (j < 0 ||j > this.matrix[0].length);
    }

    __getXIndex(obtuseAngle, dx) {
        let newX;
        if (obtuseAngle) {
            newX = (this.player.x - dx) / this.cellWidth;
        } else {
            newX = (this.player.x + dx) / this.cellWidth;
        }
        return Math.trunc(newX);
    }

    __newRayCast(lookingUp, obtuseAngle, dx, dy, theta) {
        let endX = obtuseAngle ? this.player.x - dx : this.player.x + dx;
		let endY = lookingUp ? this.player.y - dy : this.player.y + dy;
        let distance = dy / Math.cos(theta * Math.PI / 180);
        return new RayCast(this.player.x, this.player.y, endX, endY, distance);
    }


    // checks if angle obtuse
    // returns adjusted theta and whether angle is obtuse
    __adjust_theta(theta) {
        let obtuse = false;

        // if obtuse
        if (theta > 90) {
            theta -= 90;
            obtuse = true;
        } else {
            theta = 90 - theta;
        }
        return [theta, obtuse];
    }

    calculateRays() {
        let rays = new Array(this.player.nrays);
        let pos = this.getCellIndices(this.player.x, this.player.y);
        let maxDepth = 8;

        for (let raynum = 0; raynum < this.player.nrays; raynum++) {
            let theta = this.player.orientation;
            let dx, dy, i, j, vals;

            // temp until vertical checking
            if (theta == 0 || theta == 180) {
                this.player.rays = null;
                return;
            }

            // looking up
            if (theta < 0) {
                // check horizontally
                vals = this.__adjust_theta(Math.abs(theta));
                theta = vals[0];

                for (let depth = 0; depth < maxDepth; depth++) {
                    if (pos[0] - depth < 0) {
                        break;
                    }
                    // distance on y-axis and x-axis
                    dy =  this.player.y - ((pos[0] - depth) * this.cellHeight);
                    dx = Math.tan(theta * Math.PI/ 180) * dy;

                    // get coordinates
                    i = pos[0] - 1 * (depth + 1);
                    j = this.__getXIndex(vals[1], dx)

                    // check if out of bound
                    if (this.indexOutOfBound(i, j)) break;

                    // check if hit wall
                    if (this.matrix[i][j] == 1) {
                        rays[raynum] = this.__newRayCast(true, vals[1], dx, dy, theta);
                        break;
                    }
                }
            }
            // looking down
            else if (theta > 0) {
                // check horizontally
                vals = this.__adjust_theta(theta);
                theta = vals[0];

                for (let depth = 0; depth < maxDepth; depth++) {
                    if (pos[0] + depth > this.matrix.length) {
                        break;
                    }
                    // distance on y-axis and x-axis
                    dy = ((pos[0] + 1 + depth) * this.cellHeight) - this.player.y;
                    dx = Math.tan(theta * Math.PI/ 180) * dy;

                    // get coordinates
                    i = pos[0] + 1 * (depth + 1);
                    j = this.__getXIndex(vals[1], dx)

                    // check if out of bound
                    if (this.indexOutOfBound(i, j)) break;

                    // check if hit wall
                    if (this.matrix[i][j] == 1) {
                        rays[raynum] = this.__newRayCast(false, vals[1], dx, dy, theta);
                        break;
                    }
                }
            }
        }
        this.player.rays = (rays[0] == undefined) ? null : rays;
    }
}