class Player {
    constructor() {
        this.size = 40;
        this.groundY = 100;
        this.positionY = this.groundY;
        this.velocityY = 0;

        this.gravity = -0.9;
        this.jumpForce = 16;

        this.jumpCount = 0;

        this.element = document.getElementById("player");
        this.updateUI();
    }

    update() {
        this.velocityY += this.gravity;
        this.positionY += this.velocityY;

        if (this.positionY < this.groundY) {
            this.positionY = this.groundY;
            this.velocityY = 0;
            this.jumpCount = 0;
        }

        this.updateUI();
    }

    jump() {
        if (this.jumpCount < 2) {
            this.velocityY = this.jumpForce;
            this.jumpCount++;

            this.element.classList.add("jump");
            setTimeout(() => {
                this.element.classList.remove("jump");
            }, 200);
        }
    }

    updateUI() {
        this.element.style.bottom = this.positionY + "px";
    }
}

class Spike {
    constructor(board) {
        this.board = board;
        this.positionX = board.offsetWidth + 40;
        this.bottomY = 100;
        this.createElement();
    }

    createElement() {
        const spike = document.createElement("div");
        spike.className = "spike";
        spike.style.left = this.positionX + "px";
        spike.style.bottom = this.bottomY + "px";
        this.board.appendChild(spike);
        this.element = spike;
    }

    update(speed) {
        this.positionX -= speed;
        this.element.style.left = this.positionX + "px";

        if (this.positionX < -60) {
            this.element.remove();
            return true;
        }
        return false;
    }
}


const board = document.getElementById("board");
const startScreen = document.getElementById("start-screen");
const player = new Player();

const spikes = [];
let score = 0;
let highscore = parseInt(localStorage.getItem("highscore") || "0", 10);
let speed = 7;
let gameSpeed = 1;

const scoreEl = document.getElementById("score-value");
const highscoreEl = document.getElementById("highscore-value");  // ← ¡CORREGIDO! Era "ByById"
highscoreEl.textContent = highscore.toString();


let gameRunning = false;
let hasStarted = false;


function startGame() {
    if (hasStarted) return;

    hasStarted = true;
    gameRunning = true;

    
    if (startScreen) {
        startScreen.style.opacity = "0";
        setTimeout(() => {
            startScreen.style.display = "none";
        }, 400);
    }

    
    score = 0;
    speed = 7;
    gameSpeed = 1;
    scoreEl.textContent = "0";
    spikes.length = 0;

    
    document.querySelectorAll(".spike").forEach(s => s.remove());

    gameLoop();
}


function gameLoop() {
    if (!gameRunning) return;

    player.update();

  
    if (Math.random() < 0.02 * gameSpeed) {
        spikes.push(new Spike(board));
    }

  
    for (let i = spikes.length - 1; i >= 0; i--) {
        const removed = spikes[i].update(speed * gameSpeed);
        if (removed) {
            spikes.splice(i, 1);
            score += 10;
            scoreEl.textContent = score.toString();
        }
    }

    checkCollisions();
    gameSpeed += 0.0004;

    requestAnimationFrame(gameLoop);
}


function checkCollisions() {
    const playerRect = player.element.getBoundingClientRect();

    for (const spike of spikes) {
        const spikeRect = spike.element.getBoundingClientRect();

        const overlapX = playerRect.left < spikeRect.right && playerRect.right > spikeRect.left;
        const overlapY = playerRect.top < spikeRect.bottom && playerRect.bottom > spikeRect.top;

        if (overlapX && overlapY) {
            gameOver();
            return;
        }
    }
}


function gameOver() {
    gameRunning = false;

    if (score > highscore) {
        highscore = score;
        localStorage.setItem("highscore", highscore.toString());
        highscoreEl.textContent = highscore.toString();
    }

    localStorage.setItem("finalScore", score.toString());
    setTimeout(() => {
        location.href = "gameOver.html";
    }, 500);
}


document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        e.preventDefault();
        if (!hasStarted) {
            startGame();
        } else if (gameRunning) {
            player.jump();
        }
    }
});

document.addEventListener("click", () => {
    if (!hasStarted) {
        startGame();
    } else if (gameRunning) {
        player.jump();
    }
});


board.addEventListener("touchstart", (e) => {
    e.preventDefault();
    if (!hasStarted) {
        startGame();
    } else if (gameRunning) {
        player.jump();
    }
});