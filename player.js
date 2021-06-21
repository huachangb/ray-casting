class Player {
    constructor(x, y, radius=10, fov=120, speed=10, turnRate=15, nrays=1) {
        this.x = x;
        this.y = y;
        this.r = radius;
        this.fov = fov;
        this.orientation = 0;
        this.speed = speed;
        this.turnRate = turnRate;
        this.rays = null;
        this.nrays = nrays;
    }

    turn(direction) {
        let theta = this.orientation;

        // calcute new angle
        if (direction === "right") {
            theta = (theta + this.turnRate) % 360;
        } else {
            let angle = Math.abs(theta - this.turnRate) % 360
            theta = (theta <= 0) ? -angle: angle;
        }

        // upper half of circle is < 0
        // lower hald of circle is > 0
        if (theta > 180) {
            theta -= 360;
        } else if (theta <= -180) {
            theta += 360;
        }

        this.orientation = theta;
    }

    move(newX, newY) {
        this.x = newX;
        this.y = newY;
    }
}