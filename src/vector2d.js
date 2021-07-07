class Vector2d {
    /**
     * Creates a 2d vector
     * @param {array} value 
     */
    constructor(value) {
        this.value = value;
    }

    /**
     * Add vectors together
     * @param {Vector2d} v 
     * @returns sum
     */
    add(v) { 
        let result = new Array(this.value.length);

        for (let i = 0; i < this.value.length; i++) {
            result[i] = this.value[i] + v.value[i];
        }

        return new Vector2d(result);
    }

    /**
     * Scales vector
     * @param {float} scalar 
     * @returns scaled vector
     */
    scale(scalar) {
        let result = new Array(this.value.length);

        for (let i = 0; i < this.value.length; i++) {
            result[i] = this.value[i] * scalar;
        }
        
        return new Vector2d(result);
    }

    /**
     * Calculates length using pythogorean theorem in 2d
     * @returns length of vector
     */
    length() {
        return Math.sqrt(this.dot(this));
    }

    /**
     * Calculates normalized vector
     * @returns normalized vector
     */
    normalize() {
        return this.scale(1 / this.length());
    }

    /**
     * Calculates dot product
     * @param {Vector2d} v 
     * @returns dot product
     */
    dot(v) {
        let result = 0;

        for (let i = 0; i < this.value.length; i++) {
            result += this.value[i] * v.value[i];
        }
        
        return result;
    }

    /**
     * Expects a 2x2 matrix
     * with row vectors
     * @param {array} matrix 
     */
    transform(matrix) {
        let values = new Array(this.value.length);

        for (let i = 0; i < this.value.length; i++) {
            values[i] = this.dot(matrix[i]);
        } 

        return new Vector2d(values);
    }
}