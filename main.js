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
        if (this.jumpCount < 3) { 
            this.velocityY = this.jumpForce;
            this.jumpCount++;
            this.element.classList.add("jump");
            setTimeout(() => this.element.classList.remove("jump"), 200);
        }
    }
    updateUI() {
        this.element.style.bottom = this.positionY + "px";
    }
}

class Spike {
    constructor(board) {
        this.board = board;
        this.positionX = board.offsetWidth + 100;
        this.createElement();
    }
    createElement() {
        const s = document.createElement("div");
        s.className = "spike";
        s.style.left = this.positionX + "px";
        s.style.bottom = "100px";
        this.board.appendChild(s);
        this.element = s;
    }
    update(speed) {
        this.positionX -= speed;
        this.element.style.left = this.positionX + "px";
        if (this.positionX < -100) {
            this.element.remove();
            return true;
        }
        return false;
    }
}

class Wall {
    constructor(board) {
        this.board = board;
        this.positionX = board.offsetWidth + 100;
        this.elements = [];
        this.createWall();
    }
    createWall() {
        for (let i = 0; i < 3; i++) { 
            const block = document.createElement("div");
            block.className = "wall-block";
            block.style.left = this.positionX + "px";
            block.style.bottom = (100 + i * 52) + "px";
            this.board.appendChild(block);
            this.elements.push(block);
        }
    }
    update(speed) {
        this.positionX -= speed;
        this.elements.forEach(b => b.style.left = this.positionX + "px");
        if (this.positionX < -100) {
            this.elements.forEach(b => b.remove());
            return true;
        }
        return false;
    }
}


class SpikeCluster {
    constructor(board) {
        this.board = board;
        this.positionX = board.offsetWidth + 100;
        this.elements = [];
        this.createCluster();
    }
    createCluster() {
        for (let i = 0; i < 3; i++) {
            const s = document.createElement("div");
            s.className = "spike";
            s.style.left = (this.positionX + i * 50) + "px";
            s.style.bottom = "100px";
            this.board.appendChild(s);
            this.elements.push(s);
        }
    }
    update(speed) {
        this.positionX -= speed;
        this.elements[0].style.left = this.positionX + "px";
        this.elements[1].style.left = (this.positionX + 50) + "px";
        this.elements[2].style.left = (this.positionX + 100) + "px";
        if (this.positionX < -150) {
            this.elements.forEach(s => s.remove());
            return true;
        }
        return false;
    }
}

const board = document.getElementById("board");
const startScreen = document.getElementById("start-screen");
const player = new Player();

const spikes = [];
const walls = [];
const clusters = []; 

let score = 0;
let highscore = parseInt(localStorage.getItem("highscore") || "0", 10);
let speed = 7;
let gameSpeed = 1;

const scoreEl = document.getElementById("score-value");
const highscoreEl = document.getElementById("highscore-value");
highscoreEl.textContent = highscore.toString();

let gameRunning = false;
let hasStarted = false;
let lastWallTime = 0;
let lastClusterTime = 0;
let consecutiveSpikes = 0;

function startGame() {
    if (hasStarted) return;
    hasStarted = true;
    gameRunning = true;

    if (startScreen) {
        startScreen.style.opacity = "0";
        setTimeout(() => startScreen.style.display = "none", 400);
    }

    score = 0;
    speed = 7;
    gameSpeed = 1;
    scoreEl.textContent = "0";

    spikes.length = 0;
    walls.length = 0;
    clusters.length = 0;
    consecutiveSpikes = 0;

    document.querySelectorAll(".spike, .wall-block").forEach(el => el.remove());

    lastWallTime = Date.now();
    lastClusterTime = Date.now();
    gameLoop();
}

function gameLoop() {
    if (!gameRunning) return;

    player.update();

    const now = Date.now();

    const shouldSpawnWall = (now - lastWallTime > 2800 + Math.random() * 400);
    const canSpawnSpike = consecutiveSpikes < 2;

    if (shouldSpawnWall) {
        walls.push(new Wall(board));
        lastWallTime = now;
        consecutiveSpikes = 0;
    } else if (canSpawnSpike && Math.random() < 0.04 * gameSpeed) {
        spikes.push(new Spike(board));
        consecutiveSpikes++;
    }

    
    if (now - lastClusterTime > 12000) {
        clusters.push(new SpikeCluster(board));
        lastClusterTime = now;
    }

    
    for (let i = spikes.length - 1; i >= 0; i--) {
        if (spikes[i].update(speed * gameSpeed)) {
            spikes.splice(i, 1);
            score += 10;
            scoreEl.textContent = score.toString();
        }
    }

    
    for (let i = walls.length - 1; i >= 0; i--) {
        if (walls[i].update(speed * gameSpeed)) {
            walls.splice(i, 1);
            score += 20;
            scoreEl.textContent = score.toString();
        }
    }

    
    for (let i = clusters.length - 1; i >= 0; i--) {
        if (clusters[i].update(speed * gameSpeed)) {
            clusters.splice(i, 1);
            score += 25; 
            scoreEl.textContent = score.toString();
        }
    }

    checkCollisions();
    gameSpeed += 0.0004;
    requestAnimationFrame(gameLoop);
}

function checkCollisions() {
    const p = player.element.getBoundingClientRect();

    
    for (const s of spikes) {
        const r = s.element.getBoundingClientRect();
        if (p.right > r.left && p.left < r.right && p.bottom > r.top && p.top < r.bottom) {
            gameOver();
        }
    }

    
    for (const w of walls) {
        for (const b of w.elements) {
            const r = b.getBoundingClientRect();
            if (p.right > r.left && p.left < r.right && p.bottom > r.top && p.top < r.bottom) {
                gameOver();
            }
        }
    }


    for (const c of clusters) {
        for (const s of c.elements) {
            const r = s.getBoundingClientRect();
            if (p.right > r.left && p.left < r.right && p.bottom > r.top && p.top < r.bottom) {
                gameOver();
            }
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
    setTimeout(() => location.href = "gameOver.html", 500);
}


document.addEventListener("keydown", e => {
    if (e.code === "Space") {
        e.preventDefault();
        if (!hasStarted) startGame();
        else if (gameRunning) player.jump();
    }
});

document.addEventListener("click", () => {
    if (!hasStarted) startGame();
    else if (gameRunning) player.jump();
});

board.addEventListener("touchstart", e => {
    e.preventDefault();
    if (!hasStarted) startGame();
    else if (gameRunning) player.jump();
});