class Game {
    constructor(ctx, canvas, player, cellWidth=50, cellHeight=50) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.player = player;
        this.matrix = this.createWalls();
        this.cellWidth = cellWidth;
        this.cellHeight = cellHeight;
    }

    /**
     * Starts updating the canvas at an interval
     * @param {int} interval Interval at which the canvas should be updated
     */
    start(interval=15) {
        this.calculateRays();
        this.update();
        setInterval(this.update.bind(this), interval);
    }

    /**
     * Updates canvas - frame
     */
    update() {
        // clear canvas
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.drawWalls();
        this.drawPlayer();
    }

    /**
     * Turns player to the left or the right
     * @param {string} direction direction to turn, can either be 'left' or 'right'
     */
    turnPlayer(direction) {
        this.player.turn(direction);
        this.calculateRays();
    }

    /**
     * Moves player's position forward pr backward
     * @param {string} direction direction to move, can either be 'forward' or 'backward'
     */
    movePlayer(direction) {
        let speed = this.player.speed;
        
        if (direction == "backward") {
            speed = -speed;
        }

        let theta = this.player.rayOrientations[0];
        let newX = this.player.x + speed * Math.cos(Math.PI * theta / 180.0);
        let newY = this.player.y + speed * Math.sin(Math.PI * theta / 180.0);

        // check if valid position
        if ((newX < 0 || newX > game.canvas.width) || 
            (newY < 0 || newY > game.canvas.height) ||
            (!this.playerCanMoveTo(newX, newY))) return;

        
        this.player.move(newX, newY);
        this.calculateRays();
    }

    /**
     * Determine which cell indices are associated with position (x, y)
     * @param {float} x 
     * @param {flaot} y 
     * @returns [row, column]
     */
    getCellIndices(x, y) {
        let j = Math.floor(x / 50);
        let i = Math.floor(y / 50);
        return [i, j];
    }

    /**
     * 
     * @param {int} x Column of matrix
     * @param {int} y Row of matrix
     * @returns true if spot is empty, else false
     */
    playerCanMoveTo(x, y) {
        // check if new position is inside wall
        let pos = this.getCellIndices(x, y);
        return this.matrix[pos[0]][pos[1]] == 0;
    }

    /**
     * 
     * @param {bool} direction Should draw direction line
     * @param {bool} rays Should draw rays
     */
    drawPlayer(direction=true, rays=true) {
        this.ctx.beginPath();
        this.ctx.arc(this.player.x, this.player.y, this.player.r, 0, 2 * Math.PI);
        this.ctx.stroke();

        if (direction) {
            let theta = this.player.rayOrientations[0];
            let len = 20;
            let endX = this.player.x + len * Math.cos(Math.PI * theta / 180.0);
            let endY = this.player.y + len * Math.sin(Math.PI * theta / 180.0);
            this.drawLine(this.player.x, this.player.y, endX, endY);
        }

        if (rays) {
            this.drawRays();
        }
    }

    /**
     * Draws rays
     */
    drawRays() {
        if (this.player.rays == null) return;

        for (let i = 0; i < this.player.nrays; i++) {
            if (this.player.rays[i] == undefined) continue;
            this.ctx.moveTo(this.player.rays[i].startX, this.player.rays[i].startY);
            this.ctx.lineTo(this.player.rays[i].endX, this.player.rays[i].endY);
            this.ctx.strokeStyle = "#FF0000";
            this.ctx.stroke();
            this.ctx.strokeStyle = "#000000";
        }
    }

    /**
     * Draws walls in a matrix
     */
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

    /**
     * Draws a line on a canvas
     * @param {flaot} startX Starting x position
     * @param {float} startY Starting y position
     * @param {flaot} endX Ending x position
     * @param {float} endY Ending y position
     */
    drawLine(startX, startY, endX, endY) {
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
    }

    /**
     * Create a maze in matrix form
     * @returns 10x10 matrix
     */
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

    /**
     * Check if numbers are within range of index of matrix
     * @param {int} i 
     * @param {int} j 
     * @returns true if index out of range
     */
    indexOutOfBound(i, j) {
        return (i < 0 || i > this.matrix.length - 1) || 
                (j < 0 ||j > this.matrix[0].length - 1);
    }

    /**
     * Helper function to get the index of x in matrix given a dx
     * @param {bool} obtuseAngle 
     * @param {float} dx Difference: wall to player
     * @returns 
     */
    __getXIndex(obtuseAngle, dx) {
        let newX;
        if (obtuseAngle) {
            newX = (this.player.x - dx) / this.cellWidth;
        } else {
            newX = (this.player.x + dx) / this.cellWidth;
        }
        return Math.trunc(newX);
    }

    /**
     * Helper function to create a ray cast
     * @param {bool} lookingUp 
     * @param {bool} obtuseAngle 
     * @param {flaot} dx Difference on x-axis between player and nearby wall
     * @param {float} dy Difference on y-axis between player and nearby wall
     * @param {float} theta 
     * @returns RayCast object
     */
    __newRayCast(lookingUp, obtuseAngle, dx, dy, theta) {
        let endX = obtuseAngle ? this.player.x - dx : this.player.x + dx;
		let endY = lookingUp ? this.player.y - dy : this.player.y + dy;
        let distance = dy / Math.cos(theta * Math.PI / 180);
        return new RayCast(this.player.x, this.player.y, endX, endY, distance);
    }


    /**
     * Returns adjusted theta by determining whethter the angle is obtuse
     * @param {float} theta 
     * @returns adjusted theta as float
     */
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

    /**
     * Sends ray casts 
     * Determines how far the neares wall is
     * Determines the point of intersection
     */
    calculateRays() {
        let rays = new Array(this.player.nrays);
        let pos = this.getCellIndices(this.player.x, this.player.y);
        let maxDepth = 8;

        for (let raynum = 0; raynum < this.player.nrays; raynum++) {
            let theta = this.player.rayOrientations[raynum];
            let dx, dy, i, j;

            let ray_hor = null;
            let ray_vert = null;

            let vals = this.__adjust_theta(Math.abs(theta));

            // looking up
            if (theta <= 0) {
                // check horizontally
                for (let depth = 0; depth < maxDepth; depth++) {
                    theta = vals[0];
                    
                    // distance on y-axis and x-axis
                    dy =  this.player.y - ((pos[0] - depth) * this.cellHeight);
                    dx = Math.tan(theta * Math.PI / 180) * dy;

                    // get coordinates
                    i = pos[0] - 1 * (depth + 1);
                    j = this.__getXIndex(vals[1], dx)

                    // check if hit wall
                    if (!this.indexOutOfBound(i, j) && this.matrix[i][j] == 1) {
                        ray_hor = this.__newRayCast(true, vals[1], dx, dy, theta);
                        break;
                    }
                }

                // check vertically
                for (let depth = 0; depth < maxDepth; depth++) {
                    theta = Math.abs(this.player.rayOrientations[raynum]);

                    let obtuse = false;

                    if (theta > 90) {
                        obtuse = true;
                        theta = 180 - theta;
                        dx = this.player.x - ((pos[1] - depth) * this.cellWidth);
                        j = pos[1] - 1 * (depth + 1);
                    } else {
                        dx = ((pos[1] + 1 + depth) * this.cellWidth) - this.player.x;
                        j = pos[1] + 1 * (depth + 1);
                    }

                    dy = Math.tan(theta * Math.PI / 180) * dx;

                    let temp = (this.player.y - dy) / this.cellWidth;
                    i = Math.trunc(temp);

                    // if hit wall create ray
                    if (!this.indexOutOfBound(i, j) && this.matrix[i][j] == 1) {
                        let endY = this.player.y - dy;
                        let endX = obtuse ? this.player.x - dx : this.player.x + dx;
                        let distance = dx / Math.cos(theta * Math.PI / 180);
                        ray_vert = new RayCast(this.player.x, this.player.y, endX, endY, distance)
                        break;
                    }
                }

            }
            // looking down
            else if (theta > 0) {
                // check horizontally
                for (let depth = 0; depth < maxDepth; depth++) {
                    theta = vals[0];

                    // distance on y-axis and x-axis
                    dy = ((pos[0] + 1 + depth) * this.cellHeight) - this.player.y;
                    dx = Math.tan(theta * Math.PI/ 180) * dy;

                    // get coordinates
                    i = pos[0] + 1 * (depth + 1);
                    j = this.__getXIndex(vals[1], dx)

                    // check if hit wall
                    if (!this.indexOutOfBound(i, j) && this.matrix[i][j] == 1) {
                        ray_hor = this.__newRayCast(false, vals[1], dx, dy, theta);
                        break;
                    }
                }

                // check vertically
                for (let depth = 0; depth < maxDepth; depth++) {
                    theta = this.player.rayOrientations[raynum];

                    let obtuse = false;

                    if (theta > 90) {
                        obtuse = true;
                        theta = 180 - theta;
                        dx = this.player.x - ((pos[1] - depth) * this.cellWidth);
                        j = pos[1] - 1 * (depth + 1);
                    } else {
                        dx = ((pos[1] + 1 + depth) * this.cellWidth) - this.player.x;
                        j = pos[1] + 1 * (depth + 1);
                    }

                    dy = Math.tan(theta * Math.PI / 180) * dx;

                    let temp = (this.player.y + dy) / this.cellWidth;
                    i = Math.trunc(temp);

                    // if hit wall create ray
                    if (!this.indexOutOfBound(i, j) && this.matrix[i][j] == 1) {
                        let endY = this.player.y + dy;
                        let endX = obtuse ? this.player.x - dx : this.player.x + dx;
                        let distance = dx / Math.cos(theta * Math.PI / 180);
                        ray_vert = new RayCast(this.player.x, this.player.y, endX, endY, distance)
                        break;
                    }
                }
            }

            // chech which ray is the shortest
            // no wall found
            if (ray_vert == null && ray_hor == null) {
                rays[raynum] = undefined;
            }
            else if (ray_vert == null && ray_hor != null) {
                // only horizontal wall found
                rays[raynum] = ray_hor;
            } else if (ray_vert != null && ray_hor == null) {
                // only vertical wall found
                rays[raynum] = ray_vert;
            } else {
                // both walls found
                if (ray_vert.length <= ray_hor.length) {
                    rays[raynum] = ray_vert;
                } else {
                    rays[raynum] = ray_hor;
                }
            }
        }
        this.player.rays = (rays[0] == undefined) ? null : rays;
    }
}