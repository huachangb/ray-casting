class Game {
    constructor(gui, output, player, maxSearchDepth=8, canvasOutputRatio=8000) {
        this.gui = gui;
        this.output = output;
        this.player = player;
        this.map = MAP; // see map.js
        this.cellWidth = Math.floor(this.gui.canvas.width / this.map[0].length);
        this.cellHeight = Math.floor(this.gui.canvas.height / this.map.length);
        this.maxSearchDepth = maxSearchDepth;
        this.canvasOutputRatio = canvasOutputRatio;
    }

    /**
     * Updates screen
     */
    update() {
        // 2d map
        this.gui.clear();
        this.drawMap();
        this.drawPlayer();

        // 3d perspective
        this.output.clear();
        this.drawOutput();
    }

    /**
     * Starts updating the canvas at an interval
     * @param {int} interval update interval in ms
     */
     start(interval=45) {
        this.__calculateRays();
        this.update();
        setInterval(this.update.bind(this), interval);
    }

    drawMap() {
        let xOffset = 0;
        let yOffset = 0;

        // draw cell if wall
        for (let i = 0; i < this.map.length; i++) {
            for (let j = 0; j < this.map[i].length; j++) {
                if (this.map[i][j] > 0)
                    this.gui.drawRectangle(xOffset, yOffset, this.cellWidth, this.cellHeight);
                xOffset += this.cellWidth;
            }

            xOffset = 0;
            yOffset += this.cellHeight;
        }        
    }

    drawPlayer(direction=false, rays=true) {
        let [x, y] = this.__getPlayerCoordinates();
        this.gui.drawCircle(x, y, this.player.r, "black");

        let playerPos = this.player.position;
        let playerDir = this.player.direction;

        // draw direction vector
        if (direction) {
            let [dirX, dirY] = playerPos.add(playerDir.transform(REFLECTION_MATRIX)).value;
            this.gui.drawLine(x, y, dirX, dirY, "green");
        }

        // draw rays
        if (rays) {
            for (let i = 0; i < this.player.rays.length; i++) {
                let ray = this.player.wallHits[i];
                if (ray == undefined) continue;
                this.gui.drawLine(x, y, ray.value[0], ray.value[1], "red");
            }
        }
    }

    drawOutput() {
        let xOffset = 0;
        let canvasHeight = this.output.canvas.height;
        let nrays = this.player.rays.length
        let widthPerRay = this.output.canvas.width / nrays;

        for (let i = 0; i < nrays; i++) {
            let ray = this.player.wallHits[i];
            let distance = ray.norm;
            let height = this.canvasOutputRatio / distance;
            let yOffset = (canvasHeight - height) / 2;
            let wallColor = this.__determineWallColor(ray);

            // draw ray
            this.output.drawRectangle(xOffset, yOffset, widthPerRay, height, wallColor, wallColor);
            xOffset += widthPerRay;
        }

    }

    __determineWallColor(ray) {
        let rgb;
        let cellVal = this.map[ray.row][ray.col];
        let side = Boolean(ray.side);

        if (cellVal == 1) {
            rgb = side ? DARK_GREEN : YELLOW;
        } else if (cellVal == 2) {
            rgb = side ? DARK_BLUE : PURPLE;
        } else {
            rgb = side ? RED : BLACK_2;
        }

        let high = 1;
        let low = 0.4;
        let a = low + (((high - low) / this.output.canvas.height) * ray.norm);
        return `rgba(${rgb}, ${a})`;
    }

    /**
     * Turns player to the left or the right
     * @param {string} direction 
     */
    turnPlayer(direction) {
        this.player.turn(direction);
        this.__calculateRays();
    }

    /**
     * Moves player backward or forward
     * @param {string} direction 
     */
    movePlayer(direction) {
        let speed = this.player.speed * (direction == "backward" ? -1 : 1);
        
        // reflect direction vector in y-axis 
        // because left bottom is not (0,0), but (0,500)
        let directionVec = this.player.direction.transform(REFLECTION_MATRIX);
        let [newX, newY] = this.player.position.add(directionVec.normalize().scale(speed)).value;

        // check if valid position
        if (!this.__playerCanMoveTo(newX, newY)) return;

        this.player.move(newX, newY);
        this.__calculateRays();
    }

    /**
     * Gets the coordinates of the player
     * @returns array with coordinates
     */
    __getPlayerCoordinates() {
        let x = this.player.position.value[0];
        let y = this.player.position.value[1];
        return [x, y];
    }

    /**
     * Check if numbers are within range of index of map
     * @param {int} i 
     * @param {int} j 
     * @returns true if index out of range
     */
    __indexOutOfBound(i, j) {
        return (i < 0 || i > this.map.length - 1) || 
                (j < 0 ||j > this.map[0].length - 1);
    }

    /**
     * Checks if empty space and within bounds
     * @param {int} x Column of map
     * @param {int} y Row of map
     * @returns true if spot is empty, else false
     */
    __playerCanMoveTo(x, y) {
        // check if new position is inside wall
        let pos = this.__getCellIndices(x, y);
        return this.map[pos[0]][pos[1]] == 0 && !this.__indexOutOfBound(pos[0], pos[1]);
    }

    /**
     * Determine which cell indices are associated with position (x, y)
     * @param {float} x 
     * @param {flaot} y 
     * @returns [row, column]
     */
    __getCellIndices(x, y) {
        let j = Math.floor(x / this.cellWidth);
        let i = Math.floor(y / this.cellHeight);
        return [i, j];
    }

        /**
     * Helper function to get the index of x in matrix given a dx
     * @param {bool} obtuseAngle 
     * @param {float} dx Difference: wall to player
     * @returns 
     */
    __getXIndex(obtuseAngle, x, dx) {
        let newX;
        if (obtuseAngle) {
            newX = (x - dx) / this.cellWidth;
        } else {
            newX = (x + dx) / this.cellWidth;
        }
        return Math.trunc(newX);
    }

    /**
     * Checks if indices indicate wall
     * @param {int} row 
     * @param {int} col 
     * @returns 
     */
    __hitWall(row, col) {
        return (!this.__indexOutOfBound(row, col) && this.map[row][col] > 0);
    }

    /**
     * Returns adjusted dx and dy based on the
     * direction which a player looks to
     * @param {float} dx 
     * @param {float} dy 
     * @param {bool} obtuse 
     * @param {bool} lookingUp 
     * @returns 
     */
    diffXandY(dx, dy, obtuse, lookingUp) {
        return [
            obtuse ? -dx: dx,
            lookingUp ? dy : -dy
        ];
    }

    /**
     * Helper function to create a ray cast
     * @param {Arrray<int>} playerPos 
     * @param {float} dx 
     * @param {float} dy 
     * @param {Array} projMatrix 
     * @param {bool} obtuse 
     * @param {bool} lookingUp 
     * @param {bool} side 
     * @returns HittinPoint object
     */
    __createRayCast(playerPos, dx, dy, projMatrix, obtuse, lookingUp, side, row, col) {       
        let distVec = new Vector2d([dx, dy]);
        let length = distVec.transform(projMatrix).length();
        let newX = playerPos.value[0] + Math.abs(dx) * (obtuse ? -1 : 1);
        let newY = playerPos.value[1] + Math.abs(dy) * (lookingUp ? -1 : 1);
        return new HittingPoint([newX, newY], side, length, row, col, [dx, dy]);
    }

    /**
     * Determines if rays hit wall
     */
    __calculateRays() {
        let xAxisVec = new Vector2d([1, 0]);
        let playerPos = this.player.position;
        let [y, x] = this.__getCellIndices(playerPos.value[0], playerPos.value[1]);
        let projMatrix = createProjectionMatrix(this.player.direction);

        for (let i = 0; i < this.player.rays.length; i++)  {
            let ray = this.player.direction.add(this.player.rays[i]);
            let angleXAxis = Math.acos(ray.dot(xAxisVec) / (ray.length() * xAxisVec.length()));
            let theta = to_degrees(angleXAxis);
            let obtuse = false;

            // player is looking up if
            // ray y < player y because of reflection
            let lookingUp = playerPos.add(ray.transform(REFLECTION_MATRIX)).value[1] < playerPos.value[1];

            if (theta > 90) {
                obtuse = true;
                theta = 180 - theta;
            }

            theta = to_radians(theta);
            let rayCastHorizontal = undefined;
            let rayCastVertical = undefined;

            for (let depth = 0; depth < this.maxSearchDepth; depth++) {
                // check if ray hits horizontal wall
                if (rayCastHorizontal == undefined) {
                    let dy = Math.abs((this.cellHeight * (y + (lookingUp ? 0: 1))) - playerPos.value[1]) + depth * this.cellHeight;
                    let dx = dy / Math.tan(theta);
                    let row = y + (depth + 1) * (lookingUp ? -1 : 1);
                    let col = this.__getXIndex(obtuse, playerPos.value[0], dx);
                    let coords = this.diffXandY(dx, dy, obtuse, lookingUp);

                    if (this.__hitWall(row, col)) {
                        rayCastHorizontal = this.__createRayCast(playerPos, coords[0], coords[1], 
                                                                 projMatrix, obtuse, lookingUp, 0, 
                                                                 row, col, this.player.rays[i]);
                    }
                }
                
                // check if ray hits vertical wall
                if (rayCastVertical == undefined) {
                    let dx = Math.abs((this.cellWidth * (x + (obtuse ? 0: 1))) - playerPos.value[0]) + depth * this.cellWidth;
                    let dy = dx * Math.tan(theta);
                    let col = x + (depth + 1) * (obtuse ? -1 : 1);
                    let row = this.__getXIndex(lookingUp, playerPos.value[1], dy);
                    let coords = this.diffXandY(dx, dy, obtuse, lookingUp);

                    if (this.__hitWall(row, col)) {
                        rayCastVertical = this.__createRayCast(playerPos, coords[0], coords[1], 
                                                               projMatrix, obtuse, lookingUp, 1, 
                                                               row, col, this.player.rays[i]);
                    }
                }
            }

            // The shortest ray should be added
            if (rayCastHorizontal != undefined && rayCastVertical == undefined) {
                this.player.wallHits[i] = rayCastHorizontal;
            } else if (rayCastHorizontal == undefined && rayCastVertical != undefined) {
                this.player.wallHits[i] = rayCastVertical;
            } else if (rayCastHorizontal != undefined && rayCastVertical != undefined) {
                this.player.wallHits[i] = rayCastHorizontal.norm < rayCastVertical.norm ? rayCastHorizontal : rayCastVertical;
            } else {
                this.player.wallHits[i] = undefined;
            }
        }
    }
}