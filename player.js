class Player {
    constructor(x, y, radius=10, fov=120, speed=10, turnRate=15) {
        this.x = x;
        this.y = y;
        this.r = radius;
        this.fov = fov;
        this.orientation = 0;
        this.speed = speed;
        this.turnRate = turnRate;
    }

    turn(direction) {
        if (direction === "right") {
            this.orientation += this.turnRate;
        } else {
            this.orientation -= this.turnRate;
        }
    }

    move(newX, newY) {
        this.x = newX;
        this.y = newY;
    }
}