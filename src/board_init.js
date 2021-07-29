BOARD_SIZE = 10;
CSS_SELECTED_BTN = "btnSelected";
CSS_CONTAINS_PLAYER = "containsPlayer";
DEFAULT_PLAYER_POS = [5, 5];
WALL_TYPE_RANGE = [1, 3 + 1];

let playerPos = DEFAULT_PLAYER_POS.slice();

document.addEventListener("DOMContentLoaded", () => {
    // create board to create map
    let board = document.getElementById("board");
    board.innerHTML = "";

    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            let btn = document.createElement("button");
            btn.innerHTML = "Test";
            btn.id = `btnBoard_${getButtonNumber(i, j)}`;
            btn.classList = ["btnBoard"];

            if (isBorder(i, j)) {
                btn.classList.add(CSS_SELECTED_BTN);
            }
            if (i == DEFAULT_PLAYER_POS[0] && j == DEFAULT_PLAYER_POS[1]) {
                btn.classList.add(CSS_CONTAINS_PLAYER);
            }

            // disable context menu
            btn.addEventListener("contextmenu", (e) => {
                e.preventDefault();
            });

            // add mouse button down events
            btn.addEventListener("mouseover", (e) => {
                if(e.buttons == 1 || e.buttons == 3){
                    placeWall(btn, i, j);
                }
            });
            btn.addEventListener("mousedown", (e) => {
                switch (e.button) {
                    case 0:
                        placeWall(btn, i, j);
                        break;
                    case 2:
                        placePlayer(btn, i, j);
                        break;
                    default:
                        return;
                }
            });

            board.appendChild(btn);
        }
    } 
});

function getButtonNumber(row, col) {
    return row * BOARD_SIZE + col + 1;
}

function isBorder(row, col) {
    return [row, col].some((n) => n == 0 || n == BOARD_SIZE - 1);
}

function placeWall(btn, row, col) {
    if (isBorder(row, col) || btn.classList.contains(CSS_CONTAINS_PLAYER)) return; 

    if (btn.classList.contains(CSS_SELECTED_BTN)) {
        btn.classList.remove(CSS_SELECTED_BTN);
    } else {
        btn.classList.add(CSS_SELECTED_BTN);
    }
}

function placePlayer(btn, row, col) {
    if (isBorder(row, col) || (row == playerPos[0] && col == playerPos[1])) return; 
    
    btn.classList.add(CSS_CONTAINS_PLAYER);
    document.getElementById(`btnBoard_${getButtonNumber(...playerPos)}`).classList.remove(CSS_CONTAINS_PLAYER);
    playerPos = [row, col];
}

function createMatrix() {
    let matrix = new Array(BOARD_SIZE)

    for (let i = 0; i < BOARD_SIZE; i++) {
        matrix[i] = new Array(BOARD_SIZE);

        for (let j = 0; j < BOARD_SIZE; j++) {
            let index = getButtonNumber(i, j);
            let btn = document.getElementById(`btnBoard_${index}`);

            if (btn.classList.contains(CSS_CONTAINS_PLAYER)) {
                matrix[i][j] = -99;
                continue;
            } else if (btn.classList.contains(CSS_SELECTED_BTN)) {
                matrix[i][j] = getRandomInt(...WALL_TYPE_RANGE);
            } else {
                matrix[i][j] = 0;
            }
        }
    }
    return matrix;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
  }
  