
class Player {
    constructor() {
        this.size = 40;           
        this.groundY = 100;       
        this.positionY = this.groundY; 
        this.velocityY = 0;
        this.gravity = -0.94;    
        this.jumpForce = 16;      

        this.element = document.getElementById("player");
        this.updateUI();
    }

    update() {
       
        this.velocityY += this.gravity;
        this.positionY += this.velocityY;

        if (this.positionY < this.groundY) {
            this.positionY = this.groundY;
            this.velocityY = 0;
        }

        this.updateUI();
    }

    isOnGround() {
        return this.positionY <= this.groundY + 0.5;
    }

    jump() {
        
        if (this.isOnGround()) {
            this.velocityY = this.jumpForce;

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
        this.positionX = this.board.offsetWidth + 40;
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
const player = new Player();
const spikes = [];

let score = 0;
let highscore = parseInt(localStorage.getItem("highscore") || "0", 10);
let speed = 7;
let gameSpeed = 1;

const scoreEl = document.getElementById("score-value");
const highscoreEl = document.getElementById("highscore-value");
highscoreEl.textContent = highscore.toString();

let gameRunning = true;


function checkCollisions() {
    const playerRect = player.element.getBoundingClientRect();

    for (const spike of spikes) {
        const spikeRect = spike.element.getBoundingClientRect();

        const overlapX =
            playerRect.left < spikeRect.right &&
            playerRect.right > spikeRect.left;

        const overlapY =
            playerRect.top < spikeRect.bottom &&
            playerRect.bottom > spikeRect.top;

        if (overlapX && overlapY) {
            gameOver();
            return;
        }
    }
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


document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        e.preventDefault();
        player.jump();
    }
});

document.addEventListener("click", () => {
    player.jump();
});


function gameOver() {
    gameRunning = false;

    if (score > highscore) {
        highscore = score;
        localStorage.setItem("highscore", highscore.toString());
        highscoreEl.textContent = highscore.toString();
    }

    localStorage.setItem("finalScore", score.toString());
    location.href = "gameOver.html";
}


gameLoop();
