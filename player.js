class Player {
    constructor(x, y, radius=10, fov=120, speed=10) {
        this.x = x;
        this.y = y;
        this.r = radius;
        this.fov = fov;
        this.speed = speed;
    }

    move(newX, newY) {
        this.x = newX;
        this.y = newY;
    }
}