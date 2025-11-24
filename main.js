class Player {
    constructor() {
       this.width = 4;           // ← pequeño
        this.height = 4;          // ← pequeño
        this.positionX = 10; 
        this.positionY = 25;      // ← empieza dentro del tubo
        this.velocityY = 0;
        this.gravity = 1.2;
        this.jumpForce = 18;      // ← salto más fuerte para llegar arriba
        this.speedY = 0; 
        this.groundY = 25;        // ← suelo del tubo
        this.maxY = 70; 

        this.updateUI();
    }

    update() {
        
        this.positionY += this.speedY;

        if (this.positionY < this.groundY) this.positionY = this.groundY;
        if (this.positionY > this.maxY) this.positionY = this.maxY;

        
        this.velocityY -= this.gravity;
        this.positionY += this.velocityY;

       
        if (this.positionY < this.groundY) {
            this.positionY = this.groundY;
            this.velocityY = 0;
        }

        this.speedY = 0;

        this.updateUI();
    }

    jump() {
        if (this.positionY <= this.groundY + 2) { 
            this.velocityY = this.jumpForce;
        }
    }

    moveUp() {
        this.speedY = 1.2;
    }

    moveDown() {
        this.speedY = -1.2;
    }

    updateUI() {
        const playerElm = document.getElementById("player");
        playerElm.style.width = this.width + "vw";
        playerElm.style.height = this.height + "vh";
        playerElm.style.left = this.positionX + "vw";
        playerElm.style.bottom = this.positionY + "vh";
    }
}

class Obstacle {
    constructor() {
        this.width = 15;
        this.height = 20;
        this.positionX = 95; 
        this.positionY = Math.floor(Math.random() * 65) + 5; 
        this.obstacleElm = null;

        this.createDomElement();
        this.updateUI();
    }

    createDomElement() {
        this.obstacleElm = document.createElement("div");
        this.obstacleElm.className = "obstacle";
        const parentElm = document.getElementById("board");
        parentElm.appendChild(this.obstacleElm);
    }

    updateUI() {
        this.obstacleElm.style.width = this.width + "vw";
        this.obstacleElm.style.height = this.height + "vh";
        this.obstacleElm.style.left = this.positionX + "vw";
        this.obstacleElm.style.bottom = this.positionY + "vh";
    }

    moveLeft() {
        this.positionX -= 1.5; 
        this.updateUI();
    }
}

const player = new Player();
const obstaclesArr = [];


setInterval(() => {
    const newObstacle = new Obstacle();
    obstaclesArr.push(newObstacle);
}, 2000);


setInterval(() => {
  
    player.update();

    
    obstaclesArr.forEach((obstacleInstance, i, arr) => {
        obstacleInstance.moveLeft();

    
        if (obstacleInstance.positionX < -obstacleInstance.width - 10) {
            obstacleInstance.obstacleElm.remove();
            arr.splice(i, 1);
            return;
        }

        if (
            player.positionX < obstacleInstance.positionX + obstacleInstance.width &&
            player.positionX + player.width > obstacleInstance.positionX &&
            player.positionY < obstacleInstance.positionY + obstacleInstance.height &&
            player.positionY + player.height > obstacleInstance.positionY
        ) {
            console.log("¡GAME OVER!");
            location.href = "gameOver.html"; 
        }
    });
}, 40);


document.addEventListener('keydown', (e) => {
    switch(e.code) {
        case 'ArrowUp':
            player.moveUp();
            break;
        case 'ArrowDown':
            player.moveDown();
            break;
        case 'Space':
            e.preventDefault(); 
            player.jump();
            break;
    }

   
function createPipeWalls() {
    const board = document.getElementById("board");

    
    const topWall = document.createElement("div");
    topWall.style.position = "absolute";
    topWall.style.top = "0";
    topWall.style.left = "0";
    topWall.style.width = "100vw";
    topWall.style.height = "23vh";
    topWall.style.background = "#8B4513";
    topWall.style.borderBottom = "8px solid #654321";
    topWall.style.zIndex = "1";
    board.appendChild(topWall);

    
    const bottomWall = document.createElement("div");
    bottomWall.style.position = "absolute";
    bottomWall.style.bottom = "0";
    bottomWall.style.left = "0";
    bottomWall.style.width = "100vw";
    bottomWall.style.height = "23vh";
    bottomWall.style.background = "#8B4513";
    bottomWall.style.borderTop = "8px solid #654321";
    bottomWall.style.zIndex = "1";
    board.appendChild(bottomWall);
}

createPipeWalls();
});