class Game {
    constructor(gui, player) {
        this.gui = gui;
        this.player = player;
        this.map = MAP; // see map.js
        this.cellWidth = Math.floor(this.gui.canvas.width / this.map[0].length);
        this.cellHeight = Math.floor(this.gui.canvas.height / this.map.length);
    }

    /**
     * Updates screen
     */
    update() {
        this.gui.clear();
        this.drawMap();
        this.drawPlayer();
    }

    /**
     * Starts updating the canvas at an interval
     * @param {int} interval update interval in ms
     */
     start(interval=15) {
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
                let ray = playerDir.add(this.player.rays[i]).transform(REFLECTION_MATRIX);
                let [rayX, rayY] = playerPos.add(ray).value;
                this.gui.drawLine(x, y, rayX, rayY, "red");

                // debug
                let wallh = this.player.wallHits[i];
                if (wallh == undefined) continue;

                this.gui.drawLine(
                    x, y,
                    wallh.value[0],
                    wallh.value[1]
                );
            }
        }
    }

    turnPlayer(direction) {
        this.player.turn(direction);
        this.__calculateRays();
    }

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

    __calculateRays() {
        let xAxisVec = new Vector2d([1, 0]);
        let playerPos = this.player.position;
        let [x, y] = this.__getCellIndices(playerPos.value[0], playerPos.value[1]);
        let projMatrix = createProjectionMatrix(this.player.direction);
        console.log(`player (i, j): (${x},${y})`);
        for (let i = 0; i < 1; i++)  {
            console.log(`Round: ${i}`);
            let ray = this.player.direction.add(this.player.rays[i]).transform(REFLECTION_MATRIX);
            ray = this.player.position.add(ray);
            
            let angleXAxis = Math.acos(ray.dot(xAxisVec) / (ray.length() * xAxisVec.length()));
            let theta = to_degrees(angleXAxis);
            console.log(ray);
            let obtuse = false;

            // player is looking up if
            // ray y < player y because of reflection
            let lookingUp = ray.value[1] < playerPos.value[1];

            if (theta > 90) {
                obtuse = true;
                theta = theta - 90;
            }
            console.log(theta);
            theta = to_radians(theta);
            let rayCastHorizontal = undefined;
            let rayCastVertical = undefined;

            for (let attempt = 0; attempt < 8; attempt++) {
                // check horizontal
                if (rayCastHorizontal == undefined) {
                    console.log(`Up: ${lookingUp}`);
                    let dyHorizontal = Math.abs((this.cellHeight * y) - playerPos.value[1]) + (attempt + (lookingUp ? 0 : 0)) * this.cellHeight;
                    let dxHorizontal = dyHorizontal / Math.tan(theta);
                    console.log(`dx: ${dxHorizontal}, dy: ${dyHorizontal}`);

                    // let hitWallPoints = new Array(2);


                    // if (obtuse) {
                    //     hitWallPoints[0] = playerPos.value[0] - dxHorizontal;
                    // } else {
                    //     hitWallPoints[0] = playerPos.value[0] + dxHorizontal;
                    // }

                    // if (lookingUp) {
                    //     hitWallPoints[1] = playerPos.value[1] - dyHorizontal;
                    // } else {
                    //     hitWallPoints[1] = playerPos.value[1] + dyHorizontal;
                    // }
                    // let hitWallPoints = [
                    //     playerPos.value[0] + dxHorizontal * (obtuse ? -1 : 1),
                    //     playerPos.value[1] + dyHorizontal * (lookingUp ? -1 : 1)
                    // ]
                    // let cellIndex = this.__getCellIndices(hitWallPoints[0], hitWallPoints[1]);
                    // console.log(cellIndex);
                    // console.log(hitWallPoints[1], hitWallPoints[0]);
                    let row = x + (attempt + 1) * (lookingUp ? -1 : 1);
                    let col = this.__getXIndex(obtuse, playerPos.value[1], dxHorizontal);
                    console.log(row, col);
                    // hitWallPoints = hitWallPoints.reverse();

                    // check if hit wall
                    if (!this.__indexOutOfBound(row, col) &&
                        this.map[row][col] > 0 &&
                        rayCastHorizontal == undefined) {
                            console.log("wall hit");
                            let distVec = new Vector2d([dxHorizontal, dyHorizontal]);
                            let length = distVec.transform(projMatrix).length();
                            let newX = playerPos.value[0] + dxHorizontal * (obtuse ? -1 : 1);
                            let newY = playerPos.value[1] + dyHorizontal * (lookingUp ? -1 : 1);
                            rayCastHorizontal = new HittingPoint([newX, newY], 0, length);
                    }
                }
                
                // check vertical
            }
            console.log(rayCastHorizontal);

            // check which ray is shortest
            // both rays did not hit a wall
            if (rayCastHorizontal == undefined && rayCastVertical == undefined) {
                this.player.wallHits[i] = undefined;
            } else if (rayCastHorizontal != undefined && rayCastVertical == undefined) {
                // only horizontal wall found
                this.player.wallHits[i] = rayCastHorizontal;
            } else if (rayCastHorizontal == undefined && rayCastVertical != undefined) {
                // only vertical wall found
                this.player.wallHits[i] = rayCastVertical;
            } else {
                // both walls found
                if (rayCastHorizontal.norm < rayCastVertical.norm) {
                    this.player.wallHits[i] = rayCastHorizontal;
                } else {
                    this.player.wallHits[i] = rayCastVertical;
                }
            }

        }
    }
}