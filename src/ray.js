class HittingPoint extends Vector2d {
    constructor(pos, side, length, row, col, debug) {
        super(pos); // (x,y) where wall is hit
        this.side = side; // 0=horizontal, 1=vertical
        this.norm = length;
        this.row = row;
        this.col = col;
        this.debug = debug;
    }
}