BLACK = "#000000"
TRANSPARENT = "rgba(0,0,0,0)"
DARK_GREEN = "40, 90, 0"
YELLOW = "255, 244, 0"
DARK_BLUE = "21, 0, 255"
PURPLE = "191, 0, 255"
RED = "255, 0, 0"
BLACK_2 = "0, 0, 0"

class GUI {
    constructor(canvasId, width, height) {
        this.canvas = document.getElementById(canvasId);
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext("2d");
    }

    /**
     * Sets styles to default
     */
    __resetStyles() {
        // reset to default
        this.ctx.fillStyle = TRANSPARENT;
        this.ctx.strokeStyle = BLACK;
    }

    /**
     * Clears canvas
     */
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Draws a line on a canvas
     * @param {float} startX Starting x position
     * @param {float} startY Starting y position
     * @param {flaot} endX Ending x position
     * @param {float} endY Ending y position
     * @param {string} color
     */
    drawLine(startX, startY, endX, endY, color=BLACK) {
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.strokeStyle = color;
        this.ctx.stroke();
        this.__resetStyles();
    }

    /**
     * Draws a rectangle 
     */
    drawRectangle(startX, startY, width, height, colorFill=TRANSPARENT, colorBorder=BLACK) {
        this.ctx.beginPath();
        this.ctx.rect(startX, startY, width, height);
        this.ctx.fillStyle = colorFill;
        this.ctx.fill();
        this.ctx.strokeStyle = colorBorder;
        this.ctx.stroke();
        this.ctx.closePath();
        this.__resetStyles();
    }

    /**
     * Draws a circle
     * @param {float} x 
     * @param {float} y 
     * @param {float} radius 
     */
    drawCircle(x, y, radius, colorFill=TRANSPARENT, colorBorder=BLACK) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = colorFill;
        this.ctx.fill();
        this.ctx.strokeStyle = colorBorder;
        this.ctx.stroke();
        this.ctx.closePath();
        this.__resetStyles();
    }
}