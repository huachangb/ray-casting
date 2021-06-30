class Vector2d {
    constructor(value) {
        this.value = value;
    }

    add(v) { 
        let result = new Array(this.value.length);

        for (let i = 0; i < this.value.length; i++) {
            result[i] = this.value[i] + v.value[i];
        }

        return new Vector2d(result);
    }

    scale(scalar) {
        let result = new Array(this.value.length);

        for (let i = 0; i < this.value.length; i++) {
            result[i] = this.value[i] * scalar;
        }
        
        return new Vector2d(result);
    }

    length() {
        let total = 0;

        for (let i = 0; i < this.value.length; i++) {
            total += this.value[i]**2;
        }

        return Math.sqrt(total);
    }

    normalize() {
        return this.scale(1 / this.length());
    }

    dot(v) {
        let result = 0;

        for (let i = 0; i < this.value.length; i++) {
            result += this.value[i] * v.value[i];
        }
        return result;
    }

    /**
     * Expects a 2x2 matrix
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