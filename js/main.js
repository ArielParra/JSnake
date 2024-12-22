document.addEventListener('DOMContentLoaded', () => {
const playBoard = document.querySelector(".play-board");
const scoreElement = document.querySelector(".score");
const highScoreElement = document.querySelector(".high-score");
const touchControls = document.querySelectorAll(".controls i");
const messageElement = document.getElementById("message");

let gameOver = false; // Indicates if the game is over.
let isGameStarted = false; // Indicates if the game is currently running.
let foodX, foodY; // Coordinates of the food item.
let snakeX = 5, snakeY = 10; // Initial position of the snake's head.
let velocityX = 0, velocityY = 0; // Snake's movement direction.
let snakeBody = []; // Coordinates of the snake's body segments.
let setIntervalId; // ID of the game loop interval.
let score = 0; // Current score.

// Retrieve the highest score from local storage.
let highScore = localStorage.getItem("high-score") || 0;
highScoreElement.innerText = `High Score: ${highScore}`;

const eatSound = new Audio("sound/eat.mp3");
const loseSound = new Audio("sound/lose.mp3");

const speeds = {
    easy: 800,
    normal: 200,
    hard: 80
};
let currentSpeed = speeds.normal; 
document.getElementById('normal').classList.add('active');


/**
* Changes the game's difficulty and adjusts the speed accordingly.
* @param {string} difficulty - The selected difficulty level ('easy', 'normal', 'hard').
*/
const setDifficulty = (difficulty) => {
    currentSpeed = speeds[difficulty];
    if (isGameStarted) {
        clearInterval(setIntervalId);
        setIntervalId = setInterval(mainLoop, currentSpeed);
    }
    updateDifficulty(difficulty);
};


const updateDifficulty = (activeDifficulty) => {
    document.querySelectorAll(".difficulty button").forEach(btn => {
        btn.classList.toggle("active", btn.id === activeDifficulty);
    });
};

["easy", "normal", "hard"].forEach(level => {
    document.getElementById(level).addEventListener("click", () => setDifficulty(level));
});

/**
* Randomly generates a new position for the food, avoiding collision with the snake.
*/
const updateFoodPosition = () => {
    do {
        foodX = Math.floor(Math.random() * 30) + 1;
        foodY = Math.floor(Math.random() * 30) + 1;
    } while (snakeBody.some(segment => segment[0] === foodY && segment[1] === foodX));
};

touchControls.forEach(button => {
    button.addEventListener("click", () => changeDirection({ key: button.dataset.key }));
});

let allowKeyPress = true;
const handleGameOver = () => {
    clearInterval(setIntervalId);
    loseSound.play();
    messageElement.innerText = "Game Over!";
    messageElement.classList.remove("hidden");
    isGameStarted = false;
    gameOver = true;
    allowKeyPress = false;

    setTimeout(() => {
        allowKeyPress = true;
        messageElement.innerText = "Press a key to restart";
    }, 2000);
};
/**
* Handles the direction change based on the user's input.
* @param {KeyboardEvent} e - The event triggered by the keyboard input.
*/
const changeDirection = (e) => {
    if (!allowKeyPress) return;

    if (gameOver) {
        resetGame();
        return;
    }

    if (!isGameStarted) {
        isGameStarted = true;
        messageElement.classList.add("hidden");
        setIntervalId = setInterval(mainLoop, currentSpeed);
    }

    const directions = {
        ArrowUp: () => { if (velocityY !== 1) { velocityX = 0; velocityY = -1; }},
        ArrowDown: () => { if (velocityY !== -1) { velocityX = 0; velocityY = 1; }},
        ArrowLeft: () => { if (velocityX !== 1) { velocityX = -1; velocityY = 0; }},
        ArrowRight: () => { if (velocityX !== -1) { velocityX = 1; velocityY = 0; }},
    };

    if (directions[e.key]) directions[e.key]();
};

/**
 * Main game loop: updates the game state and renders the elements.
*/
const mainLoop = () => {
    if (gameOver) return;

    let html = `<div class="food" style="grid-area: ${foodY} / ${foodX}"></div>`;

    if (snakeX === foodX && snakeY === foodY) {
        updateFoodPosition();
        snakeBody.push([foodY, foodX]);
        score++;
        eatSound.play();
        highScore = Math.max(score, highScore);
        localStorage.setItem("high-score", highScore);
        scoreElement.innerText = `Score: ${score}`;
        highScoreElement.innerText = `High Score: ${highScore}`;
    }

    // Update snake's position.
    for (let i = snakeBody.length - 1; i > 0; i--) {
        snakeBody[i] = snakeBody[i - 1];
    }
    snakeBody[0] = [snakeX, snakeY];

    snakeX += velocityX;
    snakeY += velocityY;

    // Check for collisions
   if (snakeX <= 0 || snakeX > 30 || snakeY <= 0 || snakeY > 30 || 
        snakeBody.slice(1).some(segment => segment[1] === snakeX && segment[0] === snakeY)) {
        handleGameOver();
    }

    snakeBody.forEach((segment, index) => {
        html += `<div class="head" style="grid-area: ${segment[1]} / ${segment[0]}"></div>`;
    });

    playBoard.innerHTML = html;
};

/**
* Resets the game state to its initial values.
*/
const resetGame = () => {
    gameOver = false;
    isGameStarted = false;
    score = 0;
    snakeX = 5;
    snakeY = 10;
    velocityX = 0;
    velocityY = 0;
    snakeBody = [];
    scoreElement.innerText = `Score: ${score}`;
    messageElement.classList.remove("hidden");
    messageElement.innerText = "Press a key to start";
    updateFoodPosition();
};

// Attach event listeners for keyboard controls.
document.addEventListener("keydown", changeDirection);

updateFoodPosition();
setIntervalId = setInterval(mainLoop, currentSpeed); 
});

// Comments and readme file were made with the help of chatgpt