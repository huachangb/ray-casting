class Player {
    /**
     * Constructor for class
     * @param {float/int} x starting x
     * @param {float/int} y starting y
     * @param {float/int} radius size of player
     * @param {float/int} fov field of view
     * @param {int} nrays number of rays, must be >= 2
     * @param {float/int} turnRate degrees player should turn
     * @param {float/int} speed how many pixels player should move
     */
    constructor(x, y, radius=10, fov=66, nrays=100, turnRate=10, speed=10) {
        this.position = new Vector2d([x, y]);
        this.r = radius;
        this.fov = fov;
        this.speed = speed;
        this.turnRate = turnRate;
        this.direction = new Vector2d([50, 0]);
        this.cameraPlane = new Vector2d([0, this.direction.length() * Math.tan(to_radians(fov / 2))]); // formula is depended on norm of direction vector
        this.rays = new Array(nrays);
        this.wallHits = new Array(nrays);

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
     * @param {string} direction to rotate to, can either be 'left' or 'right'
     */
    turn(direction) {
        // create rotation matrix
        let theta = this.turnRate * (direction == "left" ? 1 : -1);
        let rotationMatrix = createRotationMatrix(to_radians(theta));

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