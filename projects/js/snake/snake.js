import { isAvailableSpace, gridDimension, canvasSize } from "./utils.js";
import { bestFirstSearch } from "./algorithms/bfs.js";
import { hamiltonianCycle, hamiltonianCycle2 } from "./algorithms/hamiltonian.js";
import { depthFirstSearch } from "./algorithms/dfs.js";
import { aStarSearch } from "./algorithms/aStar.js";

window.onload=function() {
    setupCanvas();
    setupControls();
    setupSpeedSlider();
    setupButtons();
    setupAlgorithm("None");
}

let canv, ctx, speedValue = 10, mainCall;
let algorithm = "None", time = 0, headPosX = 9, headPosY = 9, applePosX = 15, applePosY = 15;
let velocityX = 0, velocityY = 0, trail = [], tailSize = 4;

const setupCanvas = () => {
    canv = document.getElementById("gc");
    ctx = canv.getContext("2d");
};

const setupControls = () => {
    document.addEventListener("keydown", keyPush);
};

const setupSpeedSlider = () => {
    const slider = document.getElementById("speedSlider");
    const output = document.getElementById("speedVal");
    output.innerHTML = slider.value;

    slider.oninput = function () {
        speedValue = this.value;
        output.innerHTML = speedValue === "100" ? "MAX" : speedValue;
        restartGame();
    };
};

const setupButtons = () => {
    const algorithms = ["Manual", "BFS", "DFS", "Hamiltonian", "Hamiltonian2", "aStar"];
    algorithms.forEach(algo => {
        const btn = document.getElementById(`btn-${algo.toLowerCase()}`);
        btn.onclick = () => startAlgorithm(algo);
        btn.onmouseover = () => showDescription(algo);
        btn.onmouseout = () => restartGame();
    });
};

const startAlgorithm = (selectedAlgorithm) => {
    setupAlgorithm(selectedAlgorithm);
    restartGame();
};

const showDescription = (algo) => {
    mouseOverState();
    const descriptions = {
        "Manual": "This algorithm is only as good as the player.",
        "BFS": "Best-first search takes a greedy approach only exploring adjacent nodes.",
        "DFS": "Depth-first search explores complete paths but can trap itself in loops.",
        "Hamiltonian": "A cycle that traverses every grid node, ensuring eventual completion.",
        "Hamiltonian2": "A faster Hamiltonian variant introducing shortcuts.",
        "aStar": "A* search considers both heuristic and true cost for better pathfinding but can still trap itself."
    };
    drawMultilineText(descriptions[algo], canv.width / 2, canv.height / 2, 25);
};

const drawMultilineText = (text, x, y, lineHeight) => {
    const lines = text.split(" ");
    let line = "";
    let yOffset = 0;

    lines.forEach(word => {
        let testLine = line + word + " ";
        let measure = ctx.measureText(testLine);
        if (measure.width > canv.width - 20) {
            ctx.fillText(line, x, y + yOffset);
            line = word + " ";
            yOffset += lineHeight;
        } else {
            line = testLine;
        }
    });
    ctx.fillText(line, x, y + yOffset);
};

const restartGame = () => {
    clearCanvas();
    clearInterval(mainCall);
    if (speedValue > 0) mainCall = setInterval(game, 1000 / speedValue);
};

const mouseOverState = () => {
    clearCanvas();
    clearInterval(mainCall);
    ctx.fillStyle = "#4cd6ff";
    ctx.font = "25px Determination Mono";
    ctx.textAlign = "center";
};

const clearCanvas = () => {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canv.width, canv.height);
};    

const setupAlgorithm = (newAlgorithm) => {
    algorithm = newAlgorithm;
    time = 0;
    headPosX = headPosY = 9;
    applePosX = applePosY = 15;
    velocityX = velocityY = 0;
    trail = [];
    tailSize = 4;
    clearCanvas();
    ctx.fillStyle = "white";
    ctx.font = "35px Determination Mono";
    ctx.textAlign = "center";
    ctx.fillText("Select an algorithm", canv.width / 2, canv.height / 2);
};

const game = () => {
    if (algorithm === "None") return;
    if (tailSize <= 0) return gameOver();
    if (tailSize == canvasSize) return gameComplete();
    clearCanvas();
    time++;
    document.getElementById("timeVal").innerHTML = time;
    document.getElementById("sizeVal").innerHTML = tailSize + 1;
    updateDirection();
    moveSnake();
    drawSnake();
    drawApple();
};

const gameOver = () => {
    clearCanvas();
    ctx.fillStyle = "red";
    ctx.fillText("Game Over", canv.width / 2, canv.height / 2);
};

const gameComplete = () => {
    clearCanvas();
    ctx.fillStyle="lime"; 
    ctx.fillText("Game Complete", canv.width/2, canv.height/2);
}

const updateDirection = () => {
    const directionFunctions = {
        "Hamiltonian": hamiltonianCycle(headPosX, headPosY),
        "Hamiltonian2": hamiltonianCycle2(headPosX, headPosY, applePosX, applePosY, trail),
        "BFS": bestFirstSearch(headPosX, headPosY, applePosX, applePosY, trail),
        "DFS": depthFirstSearch(headPosX, headPosY, applePosX, applePosY, trail),
        "aStar": aStarSearch(headPosX, headPosY, applePosX, applePosY, trail)
    };
    if (algorithm in directionFunctions) updateVelocity(directionFunctions[algorithm]);
    else if (algorithm === "Manual" && velocityX === velocityY) velocityX = 1;
};

const moveSnake = () => {
    headPosX += velocityX;
    headPosY += velocityY;
    while (trail.length >= tailSize) trail.shift();
    if (!isAvailableSpace(headPosX, headPosY, trail)){ 
        tailSize = 0;
        return;
    }
    trail.push({ x: headPosX, y: headPosY });
    if (applePosX === headPosX && applePosY === headPosY) eatApple();
};

const drawSnake = () => {
    ctx.fillStyle = "lime";
    trail.forEach(pos => ctx.fillRect(pos.x * gridDimension, pos.y * gridDimension, gridDimension - 2, gridDimension - 2));
};

const drawApple = () => {
    ctx.fillStyle = "red";
    ctx.fillRect(applePosX * gridDimension, applePosY * gridDimension, gridDimension - 2, gridDimension - 2);
};

const eatApple = () => {
    tailSize++;
    if (tailSize < canvasSize) {
        let availableSpaces = getAvailableSpaces();
        let newApplePosition = availableSpaces[Math.floor(Math.random() * availableSpaces.length)];
        applePosX = newApplePosition.x;
        applePosY = newApplePosition.y;
    }
};

const updateVelocity = (direction) => {
    switch(direction) {
        case 'N':
            velocityX=0;velocityY=-1;            
            break;
        case 'E':
            velocityX=1;velocityY=0;
            break;
        case 'S':
            velocityX=0;velocityY=1;
            break;
        case 'W':
            velocityX=-1;velocityY=0;
            break; 
    }   
}

const isEqual = (pos, pos2) => (pos.x === pos2.x && pos.y === pos2.y);

const getAvailableSpaces = () => {
    let availableSpaces = [];
    for(let x=0; x<gridDimension; x++){
        for(let y=0; y<gridDimension; y++){
            if(isAvailableSpace(x,y,trail)) availableSpaces.push({x: x, y: y})
        }
    }
    return availableSpaces;
}

const willCollideWithTrail = (xOffset, yOffset) => {
    if(trail.find((pos) => isEqual(pos, {x: headPosX+xOffset, y: headPosY+yOffset}))) return true;
    return false;
}

const keyPush = (evt) => {
    const keyMap = { 37: [-1, 0], 38: [0, -1], 39: [1, 0], 40: [0, 1] };
    if (evt.keyCode in keyMap) {
        evt.preventDefault();
        if (!willCollideWithTrail(...keyMap[evt.keyCode])) {
            [velocityX, velocityY] = keyMap[evt.keyCode];
        }
    }
};