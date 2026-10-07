const player = document.getElementById('player');
const container = document.getElementById('game-container');
const heartsContainer = document.getElementById('hearts-container');
const overlay = document.getElementById('game-overlay');
const overlayMsg = document.getElementById('overlay-msg');
const resetBtn = document.getElementById('reset-btn');
const promptText = document.getElementById('prompt-text');
const startOverlay = document.getElementById('start-overlay');
const playBtn = document.getElementById('play-btn');

let lives = 5;
let isGameOver = false;
let isInvincible = false;
let isGameStarted = false;

let path = [];
let allpath = [];
let controlsEnabled = false;

let topBulletTimer = null;
let sideBulletTimer = null;

function updateHearts() {
    heartsContainer.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        const div = document.createElement('div');
        div.className = i < lives ? 'pixel-heart' : 'pixel-heart lost';
        heartsContainer.appendChild(div);
    }
}

updateHearts();

function startGame() {
    isGameStarted = true;
    controlsEnabled = true;
    startOverlay.classList.add('hidden');
    promptText.textContent = 'Avoid the incoming bullets!';

    topBulletTimer = setInterval(spawnTopBulletsWave, 1600);
    sideBulletTimer = setInterval(spawnSideBulletsWave, 2200);

    requestAnimationFrame(gameLoop);
}

playBtn.addEventListener('click', startGame);

function triggerGameOver() {
    isGameOver = true;
    controlsEnabled = false;
    clearInterval(topBulletTimer);
    clearInterval(sideBulletTimer);
    overlayMsg.textContent = 'GAME OVER';
    overlay.classList.remove('hidden');
}

function takeDamage() {
    if (isGameOver || isInvincible || !isGameStarted) return;

    lives--;
    updateHearts();

    isInvincible = true;
    player.style.filter = 'brightness(0.4) sepia(1) hue-rotate(-50deg) saturate(5)';

    setTimeout(() => {
        isInvincible = false;
        player.style.filter = 'none';
    }, 800);

    if (lives <= 0) {
        triggerGameOver();
    }
}

function resetGame() {
    lives = 5;
    updateHearts();

    posX = 370;
    posY = platSurface - playerHeight;
    velocityY = 0;
    isGrounded = true;

    path = [];
    allpath = [];
    isGameOver = false;
    isInvincible = false;
    controlsEnabled = true;
    player.style.filter = 'none';

    for (let key in keys) {
        keys[key] = false;
    }

    characterState = 'idle';
    frameIndex = 1;
    player.src = 'moves/idle-1.png';
    promptText.textContent = 'Avoid the incoming bullets!';

    bullets.forEach(b => b.element.remove());
    bullets = [];

    clearInterval(topBulletTimer);
    clearInterval(sideBulletTimer);
    topBulletTimer = setInterval(spawnTopBulletsWave, 1600);
    sideBulletTimer = setInterval(spawnSideBulletsWave, 2200);

    overlay.classList.add('hidden');
    player.style.left = posX + 'px';
    player.style.top = posY + 'px';
    requestAnimationFrame(gameLoop);
}

resetBtn.addEventListener('click', resetGame);

let posX = 370;
let posY = 235;
let velocityY = 0;
let gravity = 0.8;
let jumpPower = -15;
let speed = 5;

let isGrounded = true;

const platSurface = 300;
const groundSurface = 490;
const playerHeight = 65;
const playerWidth = 45;
const platLeft = 270;
const platRight = 515;

player.style.left = posX + 'px';
player.style.top = posY + 'px';

let characterState = 'idle';
let frameIndex = 1;
let animCounter = 0;
const animSpeed = 6;

const runFramesRight = [1, 2, 3, 4, 5];
const runFramesLeft = [1, 2, 3, 4, 6];
let walkPointer = 0;

let bullets = [];
const keys = {};

window.addEventListener('keydown', (e) => {
    if (!controlsEnabled) return;
    keys[e.code] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

const BULLET_SIZE = 42;

function createBullet(startX, startY, vx, vy, type) {
    const bulletImg = document.createElement('img');
    bulletImg.src = `moves/bullet_${type}.png`;
    bulletImg.className = 'bullet';
    bulletImg.style.transform = 'none';

    bulletImg.style.left = startX + 'px';
    bulletImg.style.top = startY + 'px';
    container.appendChild(bulletImg);

    bullets.push({
        element: bulletImg,
        x: startX,
        y: startY,
        width: BULLET_SIZE,
        height: BULLET_SIZE,
        vx: vx,
        vy: vy
    });
}

function spawnTopBulletsWave() {
    if (isGameOver || !isGameStarted) return;
    
    const count = Math.floor(Math.random() * 2) + 2;
    const occupiedX = [];

    for (let i = 0; i < count; i++) {
        let startX;
        let attempts = 0;
        do {
            startX = Math.floor(Math.random() * (800 - BULLET_SIZE));
            attempts++;
        } while (occupiedX.some(x => Math.abs(x - startX) < 110) && attempts < 10);

        occupiedX.push(startX);
        const startY = -BULLET_SIZE - (i * 30);
        const vy = 4 + Math.random() * 2.5;

        createBullet(startX, startY, 0, vy, 'v');
    }
}

function spawnSideBulletsWave() {
    if (isGameOver || !isGameStarted) return;

    const count = Math.floor(Math.random() * 2) + 2;
    const occupiedY = [];

    for (let i = 0; i < count; i++) {
        let startY;
        let attempts = 0;
        do {
            startY = 140 + Math.random() * 320;
            attempts++;
        } while (occupiedY.some(y => Math.abs(y - startY) < 70) && attempts < 10);

        occupiedY.push(startY);
        const startX = 810 + (i * 55);
        const vx = -(4 + Math.random() * 2.5);

        createBullet(startX, startY, vx, 0, 'h');
    }
}

function gameLoop() {
    if (isGameOver || !isGameStarted) {
        return;
    }

    let lastState = characterState;

    let isCrouching = controlsEnabled && (keys['ArrowDown'] || keys['KeyS']) && isGrounded;
    let movingRight = controlsEnabled && (keys['ArrowRight'] || keys['KeyD']) && !isCrouching;
    let movingLeft = controlsEnabled && (keys['ArrowLeft'] || keys['KeyA']) && !isCrouching;

    if (movingRight) posX += speed;
    if (movingLeft) posX -= speed;

    velocityY += gravity;
    posY += velocityY;

    isGrounded = false;

    if (velocityY >= 0 && posX + 40 > platLeft && posX < platRight - 10) {
        if (posY + playerHeight >= platSurface && posY + playerHeight <= platSurface + 20) {
            posY = platSurface - playerHeight;
            velocityY = 0;
            isGrounded = true;
        }
    }

    if (posY >= 550) {
        lives = 0;
        updateHearts();
        promptText.textContent = 'Patuti fell into the void!';
        triggerGameOver();
        return;
    }

    if (controlsEnabled && (keys['ArrowUp'] || keys['Space'] || keys['KeyW']) && isGrounded && !isCrouching) {
        velocityY = jumpPower;
        isGrounded = false;
    }

    if (!isGrounded) {
        characterState = 'jump';
    } else if (isCrouching) {
        characterState = 'dock';
    } else if (movingRight) {
        characterState = 'right';
    } else if (movingLeft) {
        characterState = 'left';
    } else {
        characterState = 'idle';
    }

    if (characterState !== lastState) {
        animCounter = 0;
        walkPointer = 0;
        frameIndex = 1;

        if (characterState === 'dock') player.src = 'moves/dock-1.png';
        else if (characterState === 'right') player.src = 'moves/right-1.png';
        else if (characterState === 'left') player.src = 'moves/left-1.png';
        else if (characterState === 'idle') player.src = 'moves/idle-1.png';
    }

    if (characterState === 'jump') {
        if (velocityY <= -11) frameIndex = 1;
        else if (velocityY <= -7) frameIndex = 2;
        else if (velocityY <= -3) frameIndex = 3;
        else if (velocityY < 2) frameIndex = 4;
        else if (velocityY <= 6) frameIndex = 5;
        else if (velocityY <= 10) frameIndex = 6;
        else frameIndex = 7;
        player.src = `moves/jump-${frameIndex}.png`;
    } else {
        animCounter++;
        if (animCounter >= animSpeed) {
            animCounter = 0;

            if (characterState === 'dock') {
                if (frameIndex < 5) {
                    frameIndex++;
                    player.src = `moves/dock-${frameIndex}.png`;
                }
            } else if (characterState === 'right') {
                walkPointer = (walkPointer + 1) % runFramesRight.length;
                player.src = `moves/right-${runFramesRight[walkPointer]}.png`;
            } else if (characterState === 'left') {
                walkPointer = (walkPointer + 1) % runFramesLeft.length;
                player.src = `moves/left-${runFramesLeft[walkPointer]}.png`;
            } else if (characterState === 'idle') {
                frameIndex = (frameIndex % 2) + 1;
                player.src = `moves/idle-${frameIndex}.png`;
            }
        }
    }

    let currentHeight = isCrouching ? playerHeight * 0.6 : playerHeight;

    for (let i = bullets.length - 1; i >= 0; i--) {
        let b = bullets[i];
        b.x += b.vx;
        b.y += b.vy;

        b.element.style.left = b.x + 'px';
        b.element.style.top = b.y + 'px';

        let hitX = (b.x < posX + playerWidth && b.x + b.width > posX + 10);
        let hitY = (b.y < posY + playerHeight && b.y + b.height > (posY + playerHeight - currentHeight));

        if (hitX && hitY) {
            takeDamage();
            b.element.remove();
            bullets.splice(i, 1);
            continue;
        }

        if (b.y > 550 || b.x < -BULLET_SIZE - 20) {
            b.element.remove();
            bullets.splice(i, 1);
        }
    }

    if (posX < 0) posX = 0;
    if (posX > 740) posX = 740;
    player.style.left = posX + 'px';
    player.style.top = posY + 'px';

    requestAnimationFrame(gameLoop);
}