const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const tileSize = 20;
let snakeSpeed = 120;
const maxLevels = 20; // Increased levels to 20
const bossSize = 40;  // Boss size is larger than snake tiles

let neonColors = [
    'rgba(255, 0, 0, 0.8)',    // Red
    'rgba(255, 165, 0, 0.8)',  // Orange
    'rgba(255, 255, 0, 0.8)',  // Yellow
    'rgba(0, 255, 0, 0.8)',    // Green
    'rgba(0, 0, 255, 0.8)',    // Blue
    'rgba(75, 0, 130, 0.8)',   // Indigo
    'rgba(148, 0, 211, 0.8)',  // Violet
    'rgba(0, 255, 255, 0.8)',  // Cyan
    'rgba(255, 20, 147, 0.8)', // Deep Pink
    'rgba(255, 215, 0, 0.8)',  // Gold (Level 10)
    'rgba(128, 0, 0, 0.8)',    // Dark Red
    'rgba(255, 105, 180, 0.8)',// Hot Pink
    'rgba(154, 205, 50, 0.8)', // Yellow Green
    'rgba(135, 206, 235, 0.8)',// Sky Blue
    'rgba(0, 128, 128, 0.8)',  // Teal
    'rgba(123, 104, 238, 0.8)',// Medium Slate Blue
    'rgba(0, 139, 139, 0.8)',  // Dark Cyan
    'rgba(34, 139, 34, 0.8)',  // Forest Green
    'rgba(255, 69, 0, 0.8)',   // Orange Red
    'rgba(255, 223, 0, 0.8)'   // Golden Rod (Level 20)
];

let snake = [{ x: 160, y: 160 }];
let direction = 'RIGHT';
let score = 0;
let fruit;
let gameInterval;
let currentLevel = 1;
let fruitCount = 0;
let boss = null;
let countdownRunning = false; // Tracks if countdown is happening
let snakeColor = neonColors[0]; // Initial snake color

document.getElementById('startButton').addEventListener('click', initGame);

function initGame() {
    document.getElementById('startButton').disabled = true;
    document.removeEventListener('keydown', changeDirection);
    document.addEventListener('keydown', changeDirection);
    snake = [{ x: 160, y: 160 }];
    score = 0;
    currentLevel = 1;
    fruitCount = 0;
    boss = null;
    direction = 'RIGHT';
    document.getElementById('score').textContent = 'Score: 0';
    document.getElementById('level').textContent = 'Level: 1';
    snakeColor = neonColors[0]; // Reset snake color at the beginning
    gameInterval = setInterval(gameLoop, snakeSpeed);
    generateFood();
    updateCanvas();
    removeCongratsMessage();
}

function gameLoop() {
    if (!countdownRunning) {
        moveSnake();
        moveBoss(); // Move the boss to follow the snake
    }
    if (checkCollision()) {
        resetGame();
    } else {
        updateCanvas();
        checkFruitCollision();
    }
}

function resetGame() {
    clearInterval(gameInterval);
    score = 0;
    currentLevel = 1;
    document.getElementById('score').textContent = 'Score: 0';
    document.getElementById('level').textContent = 'Level: 1';
    snake = [{ x: 160, y: 160 }];
    direction = 'RIGHT';
    boss = null;
    document.getElementById('startButton').disabled = false;
    removeCongratsMessage();
}

function moveSnake() {
    const head = { ...snake[0] };

    switch (direction) {
        case 'UP': head.y -= tileSize; break;
        case 'DOWN': head.y += tileSize; break;
        case 'LEFT': head.x -= tileSize; break;
        case 'RIGHT': head.x += tileSize; break;
    }

    snake.unshift(head);
    if (head.x === fruit.x && head.y === fruit.y) {
        score += 10;
        fruitCount++;
        document.getElementById('score').textContent = `Score: ${score}`;
        generateFood(); // Generate food at a different location
        if (fruitCount >= getRequiredFruitCount()) {
            currentLevel++;
            fruitCount = 0;
            if (currentLevel > maxLevels) {
                endGame();
                return;
            }
            if (currentLevel === 10 || currentLevel === 20) {
                startCountdown(3);  // Countdown on levels 10 and 20
            } else {
                resetLevel();
            }
        }
    } else {
        snake.pop();
    }
}

function checkCollision() {
    const head = snake[0];
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        return true;
    }
    if (boss && isCollisionWithBoss(head)) {
        resetGame();  // Reset to level 1 if the snake hits the boss
        return true;
    }
    return snake.slice(1).some(part => part.x === head.x && part.y === head.y);
}

function isCollisionWithBoss(head) {
    return head.x < boss.x + bossSize &&
           head.x + tileSize > boss.x &&
           head.y < boss.y + bossSize &&
           head.y + tileSize > boss.y;
}

function updateCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = snakeColor;  // Persistent snake color after finishing
    snake.forEach(part => {
        ctx.fillRect(part.x, part.y, tileSize, tileSize);
    });

    ctx.fillStyle = 'red';
    ctx.fillRect(fruit.x, fruit.y, tileSize, tileSize);

    if (boss) {
        ctx.fillStyle = 'purple';
        ctx.fillRect(boss.x, boss.y, bossSize, bossSize);  // Draw larger boss
    }
}

function changeDirection(event) {
    const key = event.key;
    const oppositeDirection = {
        'ArrowUp': 'DOWN', 'ArrowDown': 'UP', 'ArrowLeft': 'RIGHT', 'ArrowRight': 'LEFT',
        'w': 'DOWN', 's': 'UP', 'a': 'RIGHT', 'd': 'LEFT'
    };

    if (oppositeDirection[key] !== direction) {
        direction = {
            'ArrowUp': 'UP', 'ArrowDown': 'DOWN', 'ArrowLeft': 'LEFT', 'ArrowRight': 'RIGHT',
            'w': 'UP', 's': 'DOWN', 'a': 'LEFT', 'd': 'RIGHT'
        }[key];
    }
}

function generateFood() {
    let x, y;
    do {
        x = Math.floor(Math.random() * canvas.width / tileSize) * tileSize;
        y = Math.floor(Math.random() * canvas.height / tileSize) * tileSize;
    } while (snake.some(part => part.x === x && part.y === y)); // Ensure fruit is not generated on the snake
    fruit = { x, y };
}

function getRequiredFruitCount() {
    if (currentLevel === 6 || currentLevel === 7) return 2;
    if (currentLevel === 8 || currentLevel === 9) return 2;
    return 4;
}

function resetLevel() {
    clearInterval(gameInterval);
    snake = [{ x: 160, y: 160 }];
    direction = 'RIGHT';
    boss = null;
    snakeColor = neonColors[currentLevel - 1];  // Persistent color based on level

    if (currentLevel === 6 || currentLevel === 7) {
        snakeSpeed = 150;
    } else if (currentLevel === 8 || currentLevel === 9) {
        snakeSpeed = 100;
    } else if (currentLevel === 10 || currentLevel === 20) {
        snakeSpeed = 100;
        generateBoss(); // Generate boss on levels 10 and 20
    } else {
        snakeSpeed = 120;
    }

    gameInterval = setInterval(gameLoop, snakeSpeed);
    document.getElementById('level').textContent = `Level: ${currentLevel}`;
}

function generateBoss() {
    boss = {
        x: Math.floor(Math.random() * canvas.width / tileSize) * tileSize,
        y: Math.floor(Math.random() * canvas.height / tileSize) * tileSize
    };
}

function moveBoss() {
    if (boss) {
        // Boss follows the snake head
        const head = snake[0];
        if (boss.x < head.x) boss.x += tileSize;
        if (boss.x > head.x) boss.x -= tileSize;
        if (boss.y < head.y) boss.y += tileSize;
        if (boss.y > head.y) boss.y -= tileSize;
    }
}

function endGame() {
    clearInterval(gameInterval);

    const congratsDiv = document.createElement('div');
    congratsDiv.className = 'congrats';
    congratsDiv.innerHTML = `<h2>🎉 Congratulations! 🎉</h2><p>You've conquered the Snake Maze Odyssey!</p>`;
    document.body.appendChild(congratsDiv);

    congratsDiv.style.position = 'fixed';
    congratsDiv.style.top = '50%';
    congratsDiv.style.left = '50%';
    congratsDiv.style.transform = 'translate(-50%, -50%)';
    congratsDiv.style.background = '#000';
    congratsDiv.style.color = '#fff';
    congratsDiv.style.padding = '30px';
    congratsDiv.style.textAlign = 'center';
    congratsDiv.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.8)';
    congratsDiv.style.borderRadius = '20px';
    congratsDiv.style.zIndex = 100;
    congratsDiv.style.animation = 'pop-in 2s ease-out';

    document.getElementById('startButton').disabled = false;
}

function removeCongratsMessage() {
    const congratsDiv = document.querySelector('.congrats');
    if (congratsDiv) {
        congratsDiv.remove();
    }
}

// Countdown function for levels 10 and 20
function startCountdown(seconds) {
    countdownRunning = true;
    const countdownElement = document.getElementById('countdown');
    countdownElement.style.display = 'block';
    countdownElement.textContent = seconds;

    const countdownInterval = setInterval(() => {
        seconds--;
        countdownElement.textContent = seconds;
        if (seconds <= 0) {
            clearInterval(countdownInterval);
            countdownElement.style.display = 'none';
            countdownRunning = false;  // Allow the snake to move again
            resetLevel(); // Start the level after the countdown ends
        }
    }, 1000);
}
