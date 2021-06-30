const REFLECTION_MATRIX = [
    new Vector2d([1, 0]),
    new Vector2d([0, -1])
]

function createProjectionMatrix(vector) {
    let denumerator = 1 / (vector.dot(vector));
    return [
        new Vector2d([vector.value[0]**2, vector.value[0] * vector.value[1]]).scale(denumerator),
        new Vector2d([vector.value[0] * vector.value[1], vector.value[1]**2]).scale(denumerator)
    ];
}