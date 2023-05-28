let container = document.querySelector(".container");
let cells = Array.from(container.querySelectorAll(".grid-cell"));
let congratulations = document.querySelector(".congratulations");
let cellCopy = [...cells];
let cellMap = new Map();
let cellContent = ["😁", "😂", "😋", "😊", "😎", "😍"];
let tilePair = [];
let startTime, endTime;
let timeStarted = false;

initCells()
    .then(() => {
        cells.forEach(cell => cell.addEventListener("click", tileFlipped));
    })
    .then(() => animateFlipping())
    .then(() => setTimeout(() => {
        hideTiles(cells)
    }, 1000));

/* Methods to initialize cells with content */

function initCells() {
    let map = new Map();
    let limit_ = cells.length;
    for (let i = 0; i < cellContent.length; i++) {
        // Pick any 2 tiles at random and place the cellContent[i]'th emoji on those tiles.
        map.set(setTileContent(map, i), cellContent[i]);
        map.set(setTileContent(map, i), cellContent[i]);
    }

    for (const [key, value] of map) {
        cellMap.set(cells[key], value);
        cells[key].innerHTML = value;
    }

    return new Promise((resolve) => {
        resolve(1);
    });
}

function setTileContent(map) {
    let limit_ = cells.length;
    let t1 = getRandom(limit_);
    while (map.has(t1)) {
        t1 = getRandom(limit_);
    }
    return t1;
}

function getRandom(limit) {
    return Math.floor(Math.random() * limit);
}

/* Flip Tiles and hide them right away */

async function animateFlipping() {
    let promises = [];
    let ang = 0;
    for (let i = 0; i < 4; i++) {
        promises.push(new Promise((resolve) => {
            setTimeout(() => {
                cells.forEach(cell => cell.style.rotate = `y ${ang + 360}deg`);
                ang += 360;
                resolve(1);
            }, i * 500);
        }));
    }

    await Promise.all(promises);
}

function hideTiles(tiles) {
    console.log(tiles);
    tiles.forEach(tile => tile.style.rotate = `y 0deg`);
    tiles.forEach(tile => tile.classList.add("hide"));
}

function revealTile(cell) {
    cell.style.rotate = `y 360deg`;
    cell.classList.remove("hide");
}

/* Event handling of tiles */

function tileFlipped(e) {
    if(!timeStarted){
        startTime = new Date();
        timeStarted = true;
    }
    let cell = e.srcElement;
    revealTile(cell);
    isCorrectMove(cell);
}

/* Custom Event 
-- An event that responds to the correct move.
-- Event Name :- tilePairMove
*/

let tpmEvent = new Event("tile-pair-move");
document.addEventListener("tile-pair-move", onCorrectMove);

/* functions related to correct move, good move, bad move */

function isCorrectMove(tile) {
    tilePair.push(tile);
    disableClickedTile(tilePair);
    if (tilePair.length == 2) {
        document.dispatchEvent(tpmEvent);
        tilePair = [];
    }
}

/* We need this intermediate function because dispatch event doesn't have any return type.
   What if we need some return type to make decision whether the correct move is a good move or a bad move
*/

/* --- GAME ENGINE --- */
function onCorrectMove() {
    pauseGame();
    if (isGoodMove()) {
        onGoodMove();
    } else {
        onBadMove();
    }
}


/* This method would help the game engine decide if the player made a correct move.  */
function isGoodMove() {
    let v1 = tilePair[0].innerText;
    let v2 = tilePair[1].innerText;
    return v1 == v2;
}

function onGoodMove() {
    tilePair.forEach(tile => {
        tile.classList.add("disable-tile");
    });
    cellCopy = cellCopy.filter(cell => !tilePair.includes(cell));
    if (isGameOver()) {
        finishGame();
    } else {
        releaseGame();
    };
}

function isBadMove(e) {
    return tilePair[0].innerHTML != tilePair[1].innerHTML;
}

function onBadMove() {
    let tilesToHide = [...tilePair];
    setTimeout(() => {
        hideTiles(tilesToHide);
        releaseGame();
    }, 1500);
}

function pauseGame(){
    disableClickedTile(cellCopy);
}

function releaseGame(){
    enableTileClick(cellCopy);
}

/* Game Over functions */

function isGameOver() {
    return cellCopy.length == 0;
}

function calcTotalGameTime(){
    const totalSeconds = Math.floor((endTime - startTime) / 1000);

    // Calculate the hours, minutes, and remaining seconds
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let reward = `Wow, you took ${minutes} minutes and ${seconds} seconds.`;
    congratulations.innerHTML = reward;
    congratulations.classList.remove("hide-over");
}

function finishGame() {
    console.log("GAME OVER");
    endTime = new Date();
    calcTotalGameTime();
}

/* Base case handling */

/* 1. A tile shouldn't be clicked twice. */

function disableClickedTile(tiles) {
    tiles.forEach(tile => {
        tile.removeEventListener("click", tileFlipped);
    });
}

/* 2. If a bad move was made, the cells should be re-attached with click event listeners */
function enableTileClick(tiles) {
    tiles.forEach(tile => {
        tile.addEventListener("click", tileFlipped);
    });
}
