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

    drawPlayer(direction=true) {
        let [x, y] = this.__getPlayerCoordinates();
        this.gui.drawCircle(x, y, this.player.r, "black");

        if (direction) {
            
        }
    }

    turnPlayer(direction) {
        this.player.turn(direction);
    }

    movePlayer(direction) {
        let speed = this.player.speed * (direction == "backward" ? -1 : 1);
        
        // reflect in y-axis because left bottom is not (0,0), but (0,500)
        let reflectionMatrix = [
            new Vector2d([1, 0]),
            new Vector2d([0, -1])
        ]
        let directionVec = this.player.direction.transform(reflectionMatrix);
        let [newX, newY] = this.player.position.add(directionVec.normalize().scale(speed)).value;

        // check if valid position
        if (!this.playerCanMoveTo(newX, newY)) return;

        this.player.move(newX, newY);
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
    playerCanMoveTo(x, y) {
        // check if new position is inside wall
        let pos = this.getCellIndices(x, y);
        return this.map[pos[0]][pos[1]] == 0 && !this.__indexOutOfBound(pos[0], pos[1]);
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
}