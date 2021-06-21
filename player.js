class Player {
    constructor(x, y, radius=10, fov=70, speed=10, turnRate=5, nrays=121) {
        this.x = x;
        this.y = y;
        this.r = radius;
        this.fov = fov;
        this.orientation = 0;
        this.speed = speed;
        this.turnRate = turnRate;
        this.rays = null;
        this.nrays = nrays;
        this.rayOrientations = new Array(nrays);

        let rotationPerRay = fov / (nrays - 1);
        this.raysPerSide = (nrays - 1) / 2;

        // filll orientation array
        for (let i = 0; i < nrays; i++) {
            let theta = 0;

            if (i >= 1 && i < this.raysPerSide + 1) {
                theta = i * -rotationPerRay;
            } else if (i > this.raysPerSide) {
                theta = (i - this.raysPerSide) * rotationPerRay;
            }

            this.rayOrientations[i] = this.orientation + theta;
        }
    }

    /**
     * Turns player to the left or the right
     * @param {string} direction Direction to turn to
     */
    turn(direction) {
        for (let i = 0; i < this.nrays; i++) {
            this.rayOrientations[i] = this.__turn(direction, this.rayOrientations[i]);
        }
    }

    /**
     * Helper function for turn()
     * @param {string} direction 
     * @param {float} orientation 
     * @returns 
     */
    __turn(direction, orientation) {
        let theta = orientation;

        // calcute new angle
        if (direction === "right") {
            theta = (theta + this.turnRate) % 360;
        } else if (theta > 0 && theta < this.turnRate) {
            // edge case if 0 < theta < turn rate
            // this prevents a turn left to turn right
            theta -= this.turnRate;
        } else {
            // 
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

        // this.orientation = theta;
        return theta;
    }

    /**
     * Moves player to new position
     * @param {flaot} newX 
     * @param {flaot} newY 
     */
    move(newX, newY) {
        this.x = newX;
        this.y = newY;
    }
}