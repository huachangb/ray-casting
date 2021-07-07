const REFLECTION_MATRIX = [
    new Vector2d([1, 0]),
    new Vector2d([0, -1])
]

/**
 * Creates projection matrix to project any vector onto 
 * the given vector
 * @param {*} vector 
 * @returns projection matrix 
 */
function createProjectionMatrix(vector) {
    let denumerator = 1 / (vector.dot(vector));
    return [
        new Vector2d([vector.value[0]**2, vector.value[0] * vector.value[1]]).scale(denumerator),
        new Vector2d([vector.value[0] * vector.value[1], vector.value[1]**2]).scale(denumerator)
    ];
}

function reflectVector(v, d) {
    return d.scale((v.dot(d) / d.dot(d)) * 2).add(v.scale(-1));
}

/**
 * Creates rotatotion matrix with row vectors
 * @param {float} theta in radians
 * @returns rotation matrix
 */
function createRotationMatrix(theta) {
    let cosTheta = Math.cos(theta);
    let sinTheta = Math.sin(theta);
    let rotationMatrix = [
        new Vector2d([cosTheta, -sinTheta]),
        new Vector2d([sinTheta, cosTheta])
    ]
    return rotationMatrix;
}