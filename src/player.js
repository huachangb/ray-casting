class Player {
    constructor(x, y, radius=10, fov=66, nrays=3, turnRate=30, speed=10) {
        this.position = new Vector2d([x, y]);
        this.r = radius;
        this.fov = fov;
        this.speed = speed;
        this.turnRate = turnRate;
        this.direction = new Vector2d([50, 0]);
        this.cameraPlane = new Vector2d([0, this.direction.length() * Math.tan(to_radians(fov / 2))]); // formula is depended on norm of direction vector
        this.rays = new Array(nrays);

        // calculate distance between rays on camera plane
        let camLen = this.cameraPlane.length();
        let normalizedCamera = this.cameraPlane.normalize();
        let rayDiff = camLen * 2 / (nrays - 1);
        let rayOffset = camLen;

        // fill array with rays
        for (let i = 0; i < nrays; i++) {
            this.rays[i] = normalizedCamera.scale(rayOffset);
            rayOffset -= rayDiff;
        }
    }

    /**
     * Rotates player
     * @param {string} direction to rotate, can either be 'left' or 'right'
     */
    turn(direction) {
        let theta = this.turnRate * (direction == "left" ? 1 : -1);
        console.log(theta);
        theta = to_radians(theta);

        // create matrix with row vectors
        let cosTheta = Math.cos(theta);
        let sinTheta = Math.sin(theta);
        let rotationMatrix = [
            new Vector2d([cosTheta, -sinTheta]),
            new Vector2d([sinTheta, cosTheta])
        ]

        // rotate all vectors
        this.direction = this.direction.transform(rotationMatrix);
        this.cameraPlane = this.cameraPlane.transform(rotationMatrix);

        for (let i = 0; i < this.rays.length; i++) {
            this.rays[i] = this.rays[i].transform(rotationMatrix);
        }
    }

    /**
     * Moves player to new position
     * @param {float} newX 
     * @param {float} newY 
     */
    move(newX, newY) {
        this.position.value[0] = newX;
        this.position.value[1] = newY;
    }
}