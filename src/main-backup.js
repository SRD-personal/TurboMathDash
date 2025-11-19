/**
 * TURBO MATH DASH - Main Game Engine
 * 3D Endless Math Runner for Kids
 */

import * as THREE from 'three';

// ============================================
// GAME CONFIGURATION
// ============================================
const CONFIG = {
    lanes: 3,
    laneWidth: 2,
    runSpeed: 10,
    jumpHeight: 3,
    jumpDuration: 0.6,
    spawnDistance: 50,
    difficulty: 'easy' // easy, medium, hard
};

// ============================================
// GAME STATE
// ============================================
const gameState = {
    running: false,
    score: 0,
    coins: 0,
    stars: 0,
    distance: 0,
    lives: 3,
    currentLane: 1, // 0 = left, 1 = center, 2 = right
    isJumping: false,
    currentQuestion: null,
    answeredCorrectly: 0,
    totalQuestions: 0
};

// ============================================
// SCENE SETUP
// ============================================
let scene, camera, renderer;
let character, ground, sky;
let obstacles = [];
let coins = [];
let collectibles = [];
let questionGate = null;

// Touch controls
let touchStartX = 0;
let touchStartY = 0;
let touchStartTime = 0;

// Animation
let clock = new THREE.Clock();
let characterBob = 0;

// ============================================
// INITIALIZE GAME
// ============================================
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x87CEEB, 30, 100);

    // Create camera
    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 4, -8);
    camera.lookAt(0, 2, 0);

    // Create renderer
    const canvas = document.getElementById('game-canvas');
    renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: false
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    // Create lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    scene.add(directionalLight);

    // Create environment
    createGround();
    createSky();
    createCharacter();
    createInitialObstacles();

    // Setup controls
    setupControls();

    // Setup UI events
    document.getElementById('start-button').addEventListener('click', startGame);
    document.getElementById('pause-btn').addEventListener('click', pauseGame);

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Start render loop
    animate();
}

// ============================================
// CREATE GROUND (Endless Runner Track)
// ============================================
function createGround() {
    const groundGroup = new THREE.Group();

    // Create multiple ground segments for endless effect
    for (let i = 0; i < 10; i++) {
        const geometry = new THREE.PlaneGeometry(CONFIG.lanes * CONFIG.laneWidth, 10);
        const material = new THREE.MeshLambertMaterial({
            color: 0x3CB371,
            side: THREE.DoubleSide
        });
        const groundSegment = new THREE.Mesh(geometry, material);
        groundSegment.rotation.x = -Math.PI / 2;
        groundSegment.position.z = i * 10;
        groundSegment.receiveShadow = true;

        // Add lane dividers
        for (let lane = 0; lane < CONFIG.lanes - 1; lane++) {
            const dividerGeometry = new THREE.BoxGeometry(0.1, 0.1, 10);
            const dividerMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
            const divider = new THREE.Mesh(dividerGeometry, dividerMaterial);
            divider.position.x = (lane + 1) * CONFIG.laneWidth - CONFIG.lanes;
            divider.position.y = 0.05;
            divider.position.z = i * 10;
            groundGroup.add(divider);
        }

        groundGroup.add(groundSegment);
    }

    ground = groundGroup;
    scene.add(ground);
}

// ============================================
// CREATE SKY
// ============================================
function createSky() {
    const skyGeometry = new THREE.SphereGeometry(200, 32, 32);
    const skyMaterial = new THREE.MeshBasicMaterial({
        color: 0x87CEEB,
        side: THREE.BackSide
    });
    sky = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(sky);
}

// ============================================
// CREATE CHARACTER (Simple 3D Dino)
// ============================================
function createCharacter() {
    const characterGroup = new THREE.Group();

    // Body (main)
    const bodyGeometry = new THREE.BoxGeometry(0.8, 1.2, 1);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x40E0D0 }); // Turquoise
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1;
    body.castShadow = true;
    characterGroup.add(body);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0x40E0D0 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.9;
    head.position.z = 0.3;
    head.castShadow = true;
    characterGroup.add(head);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.12, 8, 8);
    const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
    const pupilMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.2, 2, 0.7);
    const leftPupil = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), pupilMaterial);
    leftPupil.position.set(-0.2, 2, 0.8);
    characterGroup.add(leftEye);
    characterGroup.add(leftPupil);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.2, 2, 0.7);
    const rightPupil = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), pupilMaterial);
    rightPupil.position.set(0.2, 2, 0.8);
    characterGroup.add(rightEye);
    characterGroup.add(rightPupil);

    // Belly (yellow)
    const bellyGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.6);
    const bellyMaterial = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
    const belly = new THREE.Mesh(bellyGeometry, bellyMaterial);
    belly.position.y = 0.9;
    belly.position.z = 0.5;
    characterGroup.add(belly);

    // Tail
    const tailGeometry = new THREE.ConeGeometry(0.2, 1, 8);
    const tailMaterial = new THREE.MeshLambertMaterial({ color: 0xFF8C00 });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.set(0, 1, -0.8);
    tail.rotation.x = Math.PI / 2;
    tail.castShadow = true;
    characterGroup.add(tail);

    // Legs (simple)
    const legGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.6, 8);
    const legMaterial = new THREE.MeshLambertMaterial({ color: 0x40E0D0 });

    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.3, 0.3, 0.2);
    leftLeg.castShadow = true;
    characterGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.3, 0.3, 0.2);
    rightLeg.castShadow = true;
    characterGroup.add(rightLeg);

    // Position character
    characterGroup.position.set(0, 0, 0);

    character = characterGroup;
    character.userData = { body, head, tail, leftLeg, rightLeg };
    scene.add(character);
}

// ============================================
// CREATE OBSTACLES & COLLECTIBLES
// ============================================
function createInitialObstacles() {
    // Start with some coins
    for (let i = 0; i < 20; i++) {
        const z = 10 + i * 5;
        const lane = Math.floor(Math.random() * CONFIG.lanes);
        createCoin(lane, z);
    }

    // Add some obstacles
    for (let i = 0; i < 10; i++) {
        const z = 20 + i * 10;
        const lane = Math.floor(Math.random() * CONFIG.lanes);
        if (Math.random() > 0.7) { // 30% chance
            createObstacle(lane, z);
        }
    }
}

function createCoin(lane, z) {
    const geometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16);
    const material = new THREE.MeshLambertMaterial({ color: 0xFFD700, emissive: 0xFFD700, emissiveIntensity: 0.3 });
    const coin = new THREE.Mesh(geometry, material);

    const x = (lane - 1) * CONFIG.laneWidth;
    coin.position.set(x, 1, z);
    coin.rotation.x = Math.PI / 2;
    coin.userData = { type: 'coin', lane, initialZ: z };

    coins.push(coin);
    scene.add(coin);
}

function createObstacle(lane, z) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const obstacle = new THREE.Mesh(geometry, material);

    const x = (lane - 1) * CONFIG.laneWidth;
    obstacle.position.set(x, 0.5, z);
    obstacle.castShadow = true;
    obstacle.receiveShadow = true;
    obstacle.userData = { type: 'obstacle', lane, initialZ: z };

    obstacles.push(obstacle);
    scene.add(obstacle);
}

function createStar(lane, z) {
    // Star collectible
    const geometry = new THREE.SphereGeometry(0.4, 16, 16);
    const material = new THREE.MeshLambertMaterial({
        color: 0xFFFFFF,
        emissive: 0xFFD700,
        emissiveIntensity: 0.5
    });
    const star = new THREE.Mesh(geometry, material);

    const x = (lane - 1) * CONFIG.laneWidth;
    star.position.set(x, 1.5, z);
    star.userData = { type: 'star', lane, initialZ: z };

    collectibles.push(star);
    scene.add(star);
}

// ============================================
// MATH QUESTION SYSTEM
// ============================================
function generateMathQuestion() {
    const operations = ['+', '-'];
    const operation = operations[Math.floor(Math.random() * operations.length)];

    let num1, num2, correctAnswer;

    if (operation === '+') {
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        correctAnswer = num1 + num2;
    } else {
        num1 = Math.floor(Math.random() * 10) + 5;
        num2 = Math.floor(Math.random() * num1);
        correctAnswer = num1 - num2;
    }

    // Generate wrong answers
    const wrongAnswers = [];
    while (wrongAnswers.length < 2) {
        const wrong = correctAnswer + Math.floor(Math.random() * 6) - 3;
        if (wrong !== correctAnswer && wrong > 0 && !wrongAnswers.includes(wrong)) {
            wrongAnswers.push(wrong);
        }
    }

    // Shuffle answers
    const answers = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);

    return {
        question: `${num1} ${operation} ${num2} = ?`,
        correctAnswer,
        answers,
        correctLane: answers.indexOf(correctAnswer)
    };
}

function showMathQuestion() {
    gameState.currentQuestion = generateMathQuestion();

    // Show question UI
    const questionEl = document.getElementById('math-question');
    questionEl.textContent = gameState.currentQuestion.question;
    questionEl.style.display = 'block';

    // Show answer lanes UI
    const lanesEl = document.getElementById('answer-lanes');
    lanesEl.innerHTML = '';
    lanesEl.style.display = 'flex';

    gameState.currentQuestion.answers.forEach((answer, index) => {
        const laneDiv = document.createElement('div');
        laneDiv.className = 'answer-lane';
        laneDiv.textContent = answer;
        lanesEl.appendChild(laneDiv);
    });

    // Create visual gate in 3D world
    createQuestionGate();
}

function createQuestionGate() {
    if (questionGate) {
        scene.remove(questionGate);
    }

    questionGate = new THREE.Group();

    // Create answer pillars for each lane
    for (let i = 0; i < CONFIG.lanes; i++) {
        const geometry = new THREE.BoxGeometry(1.5, 2, 0.5);
        const isCorrect = i === gameState.currentQuestion.correctLane;
        const material = new THREE.MeshLambertMaterial({
            color: 0x4169E1,
            transparent: true,
            opacity: 0.7
        });
        const pillar = new THREE.Mesh(geometry, material);

        const x = (i - 1) * CONFIG.laneWidth;
        pillar.position.set(x, 1, 30);
        pillar.userData = { lane: i, isCorrect };

        questionGate.add(pillar);
    }

    scene.add(questionGate);
}

function checkAnswer(selectedLane) {
    if (!gameState.currentQuestion) return;

    const isCorrect = selectedLane === gameState.currentQuestion.correctLane;
    gameState.totalQuestions++;

    if (isCorrect) {
        gameState.answeredCorrectly++;
        gameState.stars += 1;
        gameState.coins += 10;
        showFeedback('🎉 AWESOME! +10', 'correct');
        updateHUD();
    } else {
        gameState.lives--;
        showFeedback('😅 Try Again!', 'wrong');
        updateLives();

        if (gameState.lives <= 0) {
            gameOver();
        }
    }

    // Hide question UI
    document.getElementById('math-question').style.display = 'none';
    document.getElementById('answer-lanes').style.display = 'none';

    // Remove gate
    if (questionGate) {
        scene.remove(questionGate);
        questionGate = null;
    }

    gameState.currentQuestion = null;
}

function showFeedback(message, type) {
    const feedbackEl = document.getElementById('feedback');
    feedbackEl.textContent = message;
    feedbackEl.className = type;
    feedbackEl.style.display = 'block';

    setTimeout(() => {
        feedbackEl.style.display = 'none';
    }, 1500);
}

// ============================================
// CONTROLS
// ============================================
function setupControls() {
    const canvas = document.getElementById('game-canvas');

    // Touch controls
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        touchStartTime = Date.now();
    });

    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (!gameState.running) return;

        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;
        const deltaTime = Date.now() - touchStartTime;

        // Ignore very small movements
        if (Math.abs(deltaX) < 30 && Math.abs(deltaY) < 30) {
            // Tap - jump
            jump();
            return;
        }

        // Swipe detection
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            if (deltaX > 0) {
                moveRight();
            } else {
                moveLeft();
            }
        } else {
            // Vertical swipe
            if (deltaY < 0) {
                jump();
            }
        }
    });

    // Keyboard controls (for testing on desktop)
    document.addEventListener('keydown', (e) => {
        if (!gameState.running) return;

        switch(e.key) {
            case 'ArrowLeft':
                moveLeft();
                break;
            case 'ArrowRight':
                moveRight();
                break;
            case 'ArrowUp':
            case ' ':
                jump();
                break;
        }
    });
}

function moveLeft() {
    if (gameState.currentLane > 0) {
        gameState.currentLane--;
        animateCharacterLaneChange();
    }
}

function moveRight() {
    if (gameState.currentLane < CONFIG.lanes - 1) {
        gameState.currentLane++;
        animateCharacterLaneChange();
    }
}

function animateCharacterLaneChange() {
    const targetX = (gameState.currentLane - 1) * CONFIG.laneWidth;

    // Smooth lane transition using animation
    const startX = character.position.x;
    const duration = 200; // ms
    const startTime = Date.now();

    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        character.position.x = startX + (targetX - startX) * easeProgress;

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }

    animate();
}

function jump() {
    if (gameState.isJumping) return;

    gameState.isJumping = true;
    const startY = character.position.y;
    const startTime = Date.now();
    const duration = CONFIG.jumpDuration * 1000;

    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;

        if (progress < 1) {
            // Parabolic jump arc
            const jumpProgress = Math.sin(progress * Math.PI);
            character.position.y = startY + jumpProgress * CONFIG.jumpHeight;
            requestAnimationFrame(animate);
        } else {
            character.position.y = startY;
            gameState.isJumping = false;
        }
    }

    animate();
}

// ============================================
// GAME LOOP
// ============================================
function animate() {
    requestAnimationFrame(animate);

    if (gameState.running) {
        update();
    }

    renderer.render(scene, camera);
}

function update() {
    const delta = clock.getDelta();

    // Move world toward camera (runner effect)
    moveWorld(delta);

    // Animate character (running animation)
    animateCharacter(delta);

    // Check collisions
    checkCollisions();

    // Spawn new objects
    spawnObjects();

    // Update distance
    gameState.distance += CONFIG.runSpeed * delta;
    updateHUD();

    // Show math question every 100m
    if (Math.floor(gameState.distance) % 100 === 0 &&
        Math.floor(gameState.distance) > 0 &&
        !gameState.currentQuestion &&
        gameState.distance % 100 < 0.5) {
        showMathQuestion();
    }
}

function moveWorld(delta) {
    const moveAmount = CONFIG.runSpeed * delta;

    // Move ground
    ground.children.forEach(segment => {
        segment.position.z -= moveAmount;

        // Reset segments that went behind camera
        if (segment.position.z < -10) {
            segment.position.z += 100;
        }
    });

    // Move obstacles
    obstacles.forEach(obstacle => {
        obstacle.position.z -= moveAmount;
    });

    // Move coins
    coins.forEach(coin => {
        coin.position.z -= moveAmount;
        // Rotate coin
        coin.rotation.z += delta * 3;
    });

    // Move collectibles
    collectibles.forEach(item => {
        item.position.z -= moveAmount;
        // Float animation
        item.position.y = 1.5 + Math.sin(Date.now() * 0.003) * 0.3;
    });

    // Move question gate
    if (questionGate) {
        questionGate.position.z -= moveAmount;

        // Check if player passed through gate
        if (questionGate.position.z < -2) {
            checkAnswer(gameState.currentLane);
        }
    }
}

function animateCharacter(delta) {
    if (!character.userData.body) return;

    // Running animation - simple bob
    characterBob += delta * 10;
    const bobAmount = Math.sin(characterBob) * 0.1;
    character.userData.body.position.y = 1 + bobAmount;

    // Tail wag
    character.userData.tail.rotation.y = Math.sin(characterBob * 0.5) * 0.2;

    // Leg animation
    character.userData.leftLeg.rotation.x = Math.sin(characterBob) * 0.3;
    character.userData.rightLeg.rotation.x = Math.sin(characterBob + Math.PI) * 0.3;
}

function checkCollisions() {
    const characterZ = 0;
    const characterX = character.position.x;

    // Check coin collection
    coins.forEach((coin, index) => {
        if (Math.abs(coin.position.z - characterZ) < 1 &&
            Math.abs(coin.position.x - characterX) < 1) {
            // Collect coin
            gameState.coins++;
            scene.remove(coin);
            coins.splice(index, 1);
        }
    });

    // Check star collection
    collectibles.forEach((item, index) => {
        if (Math.abs(item.position.z - characterZ) < 1 &&
            Math.abs(item.position.x - characterX) < 1) {
            // Collect star
            gameState.stars++;
            gameState.coins += 5;
            scene.remove(item);
            collectibles.splice(index, 1);
        }
    });

    // Check obstacle collision (only if not jumping high enough)
    obstacles.forEach((obstacle, index) => {
        if (Math.abs(obstacle.position.z - characterZ) < 1 &&
            Math.abs(obstacle.position.x - characterX) < 1 &&
            character.position.y < 1.5) {
            // Hit obstacle
            gameState.lives--;
            updateLives();
            scene.remove(obstacle);
            obstacles.splice(index, 1);

            if (gameState.lives <= 0) {
                gameOver();
            }
        }
    });
}

function spawnObjects() {
    // Spawn coins
    if (Math.random() < 0.02) {
        const lane = Math.floor(Math.random() * CONFIG.lanes);
        createCoin(lane, CONFIG.spawnDistance);
    }

    // Spawn obstacles
    if (Math.random() < 0.01) {
        const lane = Math.floor(Math.random() * CONFIG.lanes);
        createObstacle(lane, CONFIG.spawnDistance);
    }

    // Spawn stars (rare)
    if (Math.random() < 0.005) {
        const lane = Math.floor(Math.random() * CONFIG.lanes);
        createStar(lane, CONFIG.spawnDistance);
    }

    // Remove objects that are behind camera
    coins = coins.filter(coin => {
        if (coin.position.z < -10) {
            scene.remove(coin);
            return false;
        }
        return true;
    });

    obstacles = obstacles.filter(obstacle => {
        if (obstacle.position.z < -10) {
            scene.remove(obstacle);
            return false;
        }
        return true;
    });

    collectibles = collectibles.filter(item => {
        if (item.position.z < -10) {
            scene.remove(item);
            return false;
        }
        return true;
    });
}

// ============================================
// UI UPDATES
// ============================================
function updateHUD() {
    document.getElementById('coins').textContent = gameState.coins;
    document.getElementById('stars').textContent = gameState.stars;
    document.getElementById('distance').textContent = Math.floor(gameState.distance);
}

function updateLives() {
    const heartsContainer = document.querySelector('.hud-hearts');
    heartsContainer.innerHTML = '';
    for (let i = 0; i < gameState.lives; i++) {
        const heart = document.createElement('span');
        heart.textContent = '❤️';
        heartsContainer.appendChild(heart);
    }
}

// ============================================
// GAME CONTROL
// ============================================
function startGame() {
    gameState.running = true;
    gameState.score = 0;
    gameState.coins = 0;
    gameState.stars = 0;
    gameState.distance = 0;
    gameState.lives = 3;
    gameState.currentLane = 1;

    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('pause-btn').style.display = 'block';

    updateHUD();
    updateLives();
}

function pauseGame() {
    gameState.running = !gameState.running;
    document.getElementById('pause-btn').textContent = gameState.running ? '⏸' : '▶️';
}

function gameOver() {
    gameState.running = false;

    const accuracy = gameState.totalQuestions > 0
        ? Math.round((gameState.answeredCorrectly / gameState.totalQuestions) * 100)
        : 0;

    alert(`
🎮 GAME OVER! 🎮

📏 Distance: ${Math.floor(gameState.distance)}m
💰 Coins: ${gameState.coins}
⭐ Stars: ${gameState.stars}
📊 Math Accuracy: ${accuracy}%
✅ Correct Answers: ${gameState.answeredCorrectly}/${gameState.totalQuestions}

Tap OK to restart!
    `);

    // Reset game
    location.reload();
}

// ============================================
// WINDOW RESIZE
// ============================================
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ============================================
// START
// ============================================
init();
