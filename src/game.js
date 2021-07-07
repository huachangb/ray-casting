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
     start(interval=50) {
        this.__calculateRays();
        this.update();
        setInterval(this.update.bind(this), interval);
    }

    drawMap() {
        let xOffset = 0;
        let yOffset = 0;
        let n = this.map.length;

        // draw cell if wall
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (this.map[i][j] > 0)
                    this.gui.drawRectangle(xOffset, yOffset, this.cellWidth, this.cellHeight);
                xOffset += this.cellWidth;
            }

            xOffset = 0;
            yOffset += this.cellHeight;
        }        
    }

    drawPlayer(direction=false, rays=true) {
        let [x, y] = this.player.position.value;
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
            for (let i = 0, n = this.player.rays.length; i < n; i++) {
                let ray = this.player.wallHits[i];
                if (ray == undefined) continue;
                this.gui.drawLine(x, y, ray.value[0], ray.value[1], "red");
            }
        }
    }

    drawOutput() {
        let xOffset = 0;
        let canvasHeight = this.output.canvas.height;
        let nrays = this.player.rays.length;
        let widthPerRay = this.output.canvas.width / nrays;

        for (let i = 0; i < nrays; i++) {
            let ray = this.player.wallHits[i];
            let height = this.canvasOutputRatio / ray.norm;
            let yOffset = (canvasHeight - height) / 2;
            let wallColor = this.__determineWallColor(ray);

            // draw ray
            this.output.drawRectangle(xOffset, yOffset, widthPerRay, height, wallColor, wallColor);
            this.output.drawRectangle(xOffset, yOffset + height, widthPerRay, 
                                      canvasHeight - (yOffset + height),
                                      BLACK, BLACK)
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
        let [row, col] = this.__getCellIndices(newX, newY);
        if (this.__isWall(row, col)) return;

        this.player.move(newX, newY);
        this.__calculateRays();
    }

    /**
     * Check if numbers are within range of index of map
     * @param {int} row
     * @param {int} col
     * @returns true if index out of range
     */
    __indexOutOfBound(row, col) {
        return (row < 0 || row > this.map.length - 1) || (col < 0 || col > this.map[0].length - 1);
    }

    /**
     * Determine which cell indices are associated with position (x, y)
     * @param {float} x 
     * @param {flaot} y 
     * @returns [row, column]
     */
    __getCellIndices(x, y) {
        let col = Math.floor(x / this.cellWidth);
        let row = Math.floor(y / this.cellHeight);
        return [row, col];
    }

    /**
     * Calculates index based on coordinate and difference
     * @param {bool} condition 
     * @param {float} coordinate 
     * @param {float} difference 
     * @returns 
     */
    __getIndex(condition, coordinate, difference) {
        let index = (condition ? (coordinate - difference) : (coordinate + difference)) / this.cellWidth;
        return Math.trunc(index);
    }

    /**
     * Checks if given position is a wall
     * @param {int} row 
     * @param {int} col 
     * @returns 
     */
    __isWall(row, col) {
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
    __adjustXY(dx, dy, obtuse, lookingUp) {
        return [
            obtuse ? -dx: dx,
            lookingUp ? dy : -dy
        ];
    }

    /**
     * Helper function to create a ray cast
     * @param {float} dx 
     * @param {float} dy 
     * @param {Array} projMatrix 
     * @param {bool} obtuse 
     * @param {bool} lookingUp 
     * @param {bool} side 
     * @returns HittinPoint object
     */
    __createRayCast(dx, dy, projMatrix, obtuse, lookingUp, side, row, col) {       
        let distVec = new Vector2d([dx, dy]);
        let length = distVec.transform(projMatrix).length();
        let newX = this.player.position.value[0] + Math.abs(dx) * (obtuse ? -1 : 1);
        let newY = this.player.position.value[1] + Math.abs(dy) * (lookingUp ? -1 : 1);
        return new HittingPoint([newX, newY], side, length, row, col);
    }

    /**
     * Determines if rays hit wall
     */
    __calculateRays() {
        let xAxisVec = new Vector2d([1, 0]);
        let [y, x] = this.__getCellIndices(...this.player.position.value);
        let projMatrix = createProjectionMatrix(this.player.direction);

        for (let i = 0; i < this.player.rays.length; i++)  {
            let ray = this.player.direction.add(this.player.rays[i]);
            let angleXAxis = Math.acos(ray.dot(xAxisVec) / (ray.length() * xAxisVec.length()));
            let theta = to_degrees(angleXAxis);
            let obtuse = false;

            // player is looking up if
            // ray y < player y because of reflection
            let lookingUp = this.player.position.add(ray.transform(REFLECTION_MATRIX)).value[1] < this.player.position.value[1];

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
                    let dy = Math.abs((this.cellHeight * (y + (lookingUp ? 0: 1))) - this.player.position.value[1]) + depth * this.cellHeight;
                    let dx = dy / Math.tan(theta);
                    let row = y + (depth + 1) * (lookingUp ? -1 : 1);
                    let col = this.__getIndex(obtuse, this.player.position.value[0], dx);
                    let coords = this.__adjustXY(dx, dy, obtuse, lookingUp);

                    if (this.__isWall(row, col)) {
                        rayCastHorizontal = this.__createRayCast(coords[0], coords[1], 
                                                                 projMatrix, obtuse, lookingUp, 0, 
                                                                 row, col, this.player.rays[i]);
                    }
                }
                
                // check if ray hits vertical wall
                if (rayCastVertical == undefined) {
                    let dx = Math.abs((this.cellWidth * (x + (obtuse ? 0: 1))) - this.player.position.value[0]) + depth * this.cellWidth;
                    let dy = dx * Math.tan(theta);
                    let col = x + (depth + 1) * (obtuse ? -1 : 1);
                    let row = this.__getIndex(lookingUp, this.player.position.value[1], dy);
                    let coords = this.__adjustXY(dx, dy, obtuse, lookingUp);

                    if (this.__isWall(row, col)) {
                        rayCastVertical = this.__createRayCast(coords[0], coords[1], 
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