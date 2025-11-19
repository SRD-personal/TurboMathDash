/**
 * TURBO MATH DASH - Enhanced Game Engine v2.0
 * Professional 3D Endless Math Runner for Kids
 * Features: Grade levels, difficulty settings, speed controls, timer
 */

import * as THREE from 'three';

// ============================================
// GAME SETTINGS (User Configurable)
// ============================================
const SETTINGS = {
    grade: '1',           // K, 1, 2, 3, 4
    difficulty: 'easy',   // easy, medium, hard
    speed: 'normal',      // slow, normal, fast, turbo
    questionTime: 20      // seconds to answer question
};

// ============================================
// GAME CONFIGURATION
// ============================================
const CONFIG = {
    lanes: 3,
    laneWidth: 2,
    jumpHeight: 3,
    jumpDuration: 0.6,
    spawnDistance: 50,

    // Speed settings
    speeds: {
        slow: 7,
        normal: 10,
        fast: 14,
        turbo: 20
    },

    // Math ranges by grade level
    mathRanges: {
        'K': { add: [1, 10], sub: [1, 5], mult: null, div: null },
        '1': { add: [1, 20], sub: [1, 10], mult: null, div: null },
        '2': { add: [1, 50], sub: [1, 20], mult: [2, 5], div: null },
        '3': { add: [1, 100], sub: [1, 50], mult: [2, 10], div: [2, 20] },
        '4': { add: [1, 200], sub: [1, 100], mult: [2, 12], div: [2, 50] }
    }
};

// ============================================
// GAME STATE
// ============================================
const gameState = {
    running: false,
    paused: false,
    coins: 0,
    stars: 0,
    distance: 0,
    lives: 3,
    currentLane: 1,
    isJumping: false,
    currentQuestion: null,
    answeredCorrectly: 0,
    totalQuestions: 0,
    questionTimerInterval: null
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

// Animation
let clock = new THREE.Clock();
let characterBob = 0;

// ============================================
// INITIALIZE GAME
// ============================================
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x667eea, 30, 100);

    // Create camera
    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 5, -10);
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
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Enhanced lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -25;
    directionalLight.shadow.camera.right = 25;
    directionalLight.shadow.camera.top = 25;
    directionalLight.shadow.camera.bottom = -25;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Rim light
    const rimLight = new THREE.DirectionalLight(0x4ECDC4, 0.5);
    rimLight.position.set(-5, 5, -10);
    scene.add(rimLight);

    // Create environment
    createGround();
    createSky();
    createEnhancedCharacter();

    // Setup UI and controls
    setupUIEvents();
    setupControls();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Start render loop
    animate();
}

// ============================================
// CREATE ENHANCED GROUND
// ============================================
function createGround() {
    ground = new THREE.Group();

    for (let i = 0; i < 15; i++) {
        // Main ground
        const geometry = new THREE.PlaneGeometry(CONFIG.lanes * CONFIG.laneWidth + 2, 10);
        const material = new THREE.MeshLambertMaterial({
            color: 0x3CB371,
            side: THREE.DoubleSide
        });
        const groundSegment = new THREE.Mesh(geometry, material);
        groundSegment.rotation.x = -Math.PI / 2;
        groundSegment.position.z = i * 10;
        groundSegment.receiveShadow = true;
        ground.add(groundSegment);

        // Lane markers
        for (let lane = 0; lane < CONFIG.lanes - 1; lane++) {
            const x = (lane + 1) * CONFIG.laneWidth - CONFIG.lanes;
            for (let dash = 0; dash < 5; dash++) {
                const dividerGeometry = new THREE.BoxGeometry(0.15, 0.1, 1.5);
                const dividerMaterial = new THREE.MeshLambertMaterial({
                    color: 0xFFFFFF,
                    emissive: 0xFFFFFF,
                    emissiveIntensity: 0.3
                });
                const divider = new THREE.Mesh(dividerGeometry, dividerMaterial);
                divider.position.x = x;
                divider.position.y = 0.06;
                divider.position.z = i * 10 + dash * 2;
                ground.add(divider);
            }
        }
    }

    scene.add(ground);
}

// ============================================
// CREATE SKY
// ============================================
function createSky() {
    const skyGeometry = new THREE.SphereGeometry(200, 32, 32);
    const skyMaterial = new THREE.MeshBasicMaterial({
        color: 0x667eea,
        side: THREE.BackSide
    });
    sky = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(sky);
}

// ============================================
// CREATE ENHANCED CHARACTER
// ============================================
function createEnhancedCharacter() {
    character = new THREE.Group();

    // Body - more rounded and polished
    const bodyGeometry = new THREE.CapsuleGeometry(0.5, 1.0, 8, 16);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x40E0D0,
        roughness: 0.7,
        metalness: 0.1
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.2;
    body.castShadow = true;
    character.add(body);

    // Head - larger and more expressive
    const headGeometry = new THREE.SphereGeometry(0.6, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({
        color: 0x40E0D0,
        roughness: 0.6,
        metalness: 0.1
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.2;
    head.position.z = 0.2;
    head.scale.set(1, 1.1, 1);
    head.castShadow = true;
    character.add(head);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.15, 12, 12);
    const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF,
        emissive: 0xFFFFFF,
        emissiveIntensity: 0.2
    });
    const pupilGeometry = new THREE.SphereGeometry(0.08, 12, 12);
    const pupilMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.25, 2.3, 0.75);
    const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    leftPupil.position.set(-0.25, 2.3, 0.85);
    character.add(leftEye);
    character.add(leftPupil);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.25, 2.3, 0.75);
    const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    rightPupil.position.set(0.25, 2.3, 0.85);
    character.add(rightEye);
    character.add(rightPupil);

    // Belly
    const bellyGeometry = new THREE.SphereGeometry(0.45, 12, 12);
    const bellyMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFD700,
        roughness: 0.8
    });
    const belly = new THREE.Mesh(bellyGeometry, bellyMaterial);
    belly.position.y = 1.1;
    belly.position.z = 0.6;
    belly.scale.set(1, 1.2, 0.8);
    character.add(belly);

    // Tail
    const tailGeometry = new THREE.ConeGeometry(0.25, 1.2, 12);
    const tailMaterial = new THREE.MeshStandardMaterial({
        color: 0xFF8C00,
        roughness: 0.7
    });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.set(0, 1.3, -0.9);
    tail.rotation.x = Math.PI / 2.5;
    tail.castShadow = true;
    character.add(tail);

    // Legs
    const legGeometry = new THREE.CapsuleGeometry(0.18, 0.5, 8, 12);
    const legMaterial = new THREE.MeshStandardMaterial({
        color: 0x40E0D0,
        roughness: 0.7
    });

    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.35, 0.4, 0.2);
    leftLeg.castShadow = true;
    character.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.35, 0.4, 0.2);
    rightLeg.castShadow = true;
    character.add(rightLeg);

    // Feet
    const footGeometry = new THREE.SphereGeometry(0.2, 12, 12);
    const footMaterial = new THREE.MeshStandardMaterial({
        color: 0x32CD32,
        roughness: 0.9
    });

    const leftFoot = new THREE.Mesh(footGeometry, footMaterial);
    leftFoot.position.set(-0.35, 0.12, 0.35);
    leftFoot.scale.set(1, 0.5, 1.3);
    leftFoot.castShadow = true;
    character.add(leftFoot);

    const rightFoot = new THREE.Mesh(footGeometry, footMaterial);
    rightFoot.position.set(0.35, 0.12, 0.35);
    rightFoot.scale.set(1, 0.5, 1.3);
    rightFoot.castShadow = true;
    character.add(rightFoot);

    // Back spikes
    for (let i = 0; i < 3; i++) {
        const spikeGeometry = new THREE.ConeGeometry(0.12, 0.3, 4);
        const spikeMaterial = new THREE.MeshStandardMaterial({
            color: 0xFF8C00,
            roughness: 0.6,
            metalness: 0.2
        });
        const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
        spike.position.set(0, 1.5 + i * 0.3, -0.4);
        spike.rotation.z = Math.PI / 2;
        spike.rotation.y = Math.PI / 2;
        spike.castShadow = true;
        character.add(spike);
    }

    character.userData = { body, head, tail, leftLeg, rightLeg, leftFoot, rightFoot };
    scene.add(character);
}

// ============================================
// UI EVENTS
// ============================================
function setupUIEvents() {
    document.getElementById('start-button').addEventListener('click', startGame);

    document.getElementById('open-settings').addEventListener('click', () => {
        document.getElementById('start-screen').style.display = 'none';
        document.getElementById('settings-screen').style.display = 'flex';
    });

    document.getElementById('close-settings').addEventListener('click', () => {
        document.getElementById('settings-screen').style.display = 'none';
        document.getElementById('start-screen').style.display = 'flex';
    });

    // Settings buttons
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const setting = btn.dataset.setting;
            const value = btn.dataset.value;

            SETTINGS[setting] = value;

            // Update selected state
            document.querySelectorAll(`[data-setting="${setting}"]`).forEach(b => {
                b.classList.remove('selected');
            });
            btn.classList.add('selected');
        });
    });
}

// ============================================
// CONTROLS
// ============================================
function setupControls() {
    const canvas = document.getElementById('game-canvas');
    let touchStartX = 0;
    let touchStartY = 0;

    // Touch controls
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    });

    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (!gameState.running) return;

        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;

        // Tap detection
        if (Math.abs(deltaX) < 30 && Math.abs(deltaY) < 30) {
            jump();
            return;
        }

        // Swipe detection
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 0) {
                moveRight();
            } else {
                moveLeft();
            }
        } else {
            if (deltaY < 0) {
                jump();
            }
        }
    });

    // Keyboard controls
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

function animateLaneChange() {
    const targetX = (gameState.currentLane - 1) * CONFIG.laneWidth;
    const startX = character.position.x;
    const duration = 200;
    const startTime = Date.now();

    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        character.position.x = startX + (targetX - startX) * easeProgress;
        if (progress < 1) requestAnimationFrame(animate);
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
// MATH QUESTION SYSTEM
// ============================================
function generateMathQuestion() {
    const grade = SETTINGS.grade;
    const difficulty = SETTINGS.difficulty;
    const ranges = CONFIG.mathRanges[grade];

    // Determine available operations
    const operations = [];
    if (ranges.add) operations.push('+');
    if (ranges.sub) operations.push('-');
    if (ranges.mult) operations.push('×');
    if (ranges.div) operations.push('÷');

    const operation = operations[Math.floor(Math.random() * operations.length)];
    let num1, num2, correctAnswer;

    if (operation === '+') {
        const [min, max] = ranges.add;
        num1 = Math.floor(Math.random() * (max - min + 1)) + min;
        num2 = Math.floor(Math.random() * (max - min + 1)) + min;
        correctAnswer = num1 + num2;
    } else if (operation === '-') {
        const [min, max] = ranges.sub;
        num1 = Math.floor(Math.random() * (max - min + 1)) + min + 5;
        num2 = Math.floor(Math.random() * num1);
        correctAnswer = num1 - num2;
    } else if (operation === '×') {
        const [min, max] = ranges.mult;
        num1 = Math.floor(Math.random() * (max - min + 1)) + min;
        num2 = Math.floor(Math.random() * (max - min + 1)) + min;
        correctAnswer = num1 * num2;
    } else if (operation === '÷') {
        const [min, max] = ranges.div;
        num2 = Math.floor(Math.random() * (max - min + 1)) + min;
        correctAnswer = Math.floor(Math.random() * 10) + 1;
        num1 = num2 * correctAnswer;
    }

    // Generate wrong answers based on difficulty
    const wrongAnswers = [];
    const numWrong = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 4;

    while (wrongAnswers.length < numWrong) {
        const offset = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 15;
        const wrong = correctAnswer + Math.floor(Math.random() * offset * 2) - offset;
        if (wrong > 0 && wrong !== correctAnswer && !wrongAnswers.includes(wrong)) {
            wrongAnswers.push(wrong);
        }
    }

    // Shuffle answers and limit to number of lanes
    const answers = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
    const finalAnswers = answers.slice(0, CONFIG.lanes);

    return {
        question: `${num1} ${operation} ${num2} = ?`,
        correctAnswer,
        answers: finalAnswers,
        correctLane: finalAnswers.indexOf(correctAnswer)
    };
}

function showMathQuestion() {
    gameState.currentQuestion = generateMathQuestion();

    // Update UI
    const container = document.getElementById('math-question-container');
    const questionText = document.getElementById('question-text');
    const lanesEl = document.getElementById('answer-lanes');
    const timerEl = document.getElementById('question-timer');
    const progressBar = document.getElementById('question-progress-bar');

    questionText.textContent = gameState.currentQuestion.question;
    container.style.display = 'block';

    // Create answer lanes
    lanesEl.innerHTML = '';
    lanesEl.style.display = 'flex';
    gameState.currentQuestion.answers.forEach((answer, index) => {
        const laneDiv = document.createElement('div');
        laneDiv.className = 'answer-lane';
        laneDiv.textContent = answer;
        lanesEl.appendChild(laneDiv);
    });

    // Start countdown timer
    let timeLeft = parseInt(SETTINGS.questionTime);
    timerEl.textContent = timeLeft;
    progressBar.style.width = '100%';

    gameState.questionTimerInterval = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;
        const percentage = (timeLeft / parseInt(SETTINGS.questionTime)) * 100;
        progressBar.style.width = `${percentage}%`;

        if (timeLeft <= 0) {
            clearInterval(gameState.questionTimerInterval);
            checkAnswer(-1); // Time's up
        }
    }, 1000);
}

function checkAnswer(selectedLane) {
    clearInterval(gameState.questionTimerInterval);

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
    document.getElementById('math-question-container').style.display = 'none';
    document.getElementById('answer-lanes').style.display = 'none';

    gameState.currentQuestion = null;
}

function showFeedback(message, type) {
    const feedbackEl = document.getElementById('feedback');
    feedbackEl.textContent = message;
    feedbackEl.className = type;
    feedbackEl.style.display = 'block';

    setTimeout(() => {
        feedbackEl.style.display = 'none';
    }, 2000);
}

// ============================================
// CREATE OBSTACLES
// ============================================
function createCoin(lane, z) {
    const geometry = new THREE.CylinderGeometry(0.35, 0.35, 0.12, 20);
    const material = new THREE.MeshStandardMaterial({
        color: 0xFFD700,
        emissive: 0xFFD700,
        emissiveIntensity: 0.5,
        metalness: 0.8,
        roughness: 0.2
    });
    const coin = new THREE.Mesh(geometry, material);

    const x = (lane - 1) * CONFIG.laneWidth;
    coin.position.set(x, 1, z);
    coin.rotation.x = Math.PI / 2;
    coin.userData = { type: 'coin', lane, initialZ: z };
    coin.castShadow = true;

    coins.push(coin);
    scene.add(coin);
}

function createObstacle(lane, z) {
    const geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    const material = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        roughness: 0.8,
        metalness: 0.1
    });
    const obstacle = new THREE.Mesh(geometry, material);

    const x = (lane - 1) * CONFIG.laneWidth;
    obstacle.position.set(x, 0.6, z);
    obstacle.rotation.y = Math.random() * Math.PI;
    obstacle.castShadow = true;
    obstacle.receiveShadow = true;
    obstacle.userData = { type: 'obstacle', lane, initialZ: z };

    obstacles.push(obstacle);
    scene.add(obstacle);
}

function createStar(lane, z) {
    const geometry = new THREE.SphereGeometry(0.4, 16, 16);
    const material = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF,
        emissive: 0xFFD700,
        emissiveIntensity: 0.8,
        metalness: 0.5,
        roughness: 0.2
    });
    const star = new THREE.Mesh(geometry, material);

    const x = (lane - 1) * CONFIG.laneWidth;
    star.position.set(x, 1.5, z);
    star.userData = { type: 'star', lane, initialZ: z };

    collectibles.push(star);
    scene.add(star);
}

// ============================================
// GAME CONTROL
// ============================================
function startGame() {
    gameState.running = true;
    gameState.coins = 0;
    gameState.stars = 0;
    gameState.distance = 0;
    gameState.lives = 3;
    gameState.currentLane = 1;

    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('speed-indicator').style.display = 'block';

    // Update speed indicator
    const speedText = SETTINGS.speed.charAt(0).toUpperCase() + SETTINGS.speed.slice(1);
    document.getElementById('current-speed').textContent = speedText;

    updateHUD();
    updateLives();

    // Spawn initial objects
    for (let i = 0; i < 30; i++) {
        const z = 10 + i * 5;
        const lane = Math.floor(Math.random() * CONFIG.lanes);
        createCoin(lane, z);

        if (Math.random() > 0.8) {
            const obsLane = Math.floor(Math.random() * CONFIG.lanes);
            createObstacle(obsLane, 20 + i * 8);
        }
    }
}

function gameOver() {
    gameState.running = false;

    const accuracy = gameState.totalQuestions > 0
        ? Math.round((gameState.answeredCorrectly / gameState.totalQuestions) * 100)
        : 0;

    alert(`🎮 GAME OVER!

📏 Distance: ${Math.floor(gameState.distance)}m
💰 Coins: ${gameState.coins}
⭐ Stars: ${gameState.stars}
📊 Math Accuracy: ${accuracy}%
✅ Correct Answers: ${gameState.answeredCorrectly}/${gameState.totalQuestions}

Tap OK to restart!`);

    location.reload();
}

function updateHUD() {
    document.getElementById('coins').textContent = gameState.coins;
    document.getElementById('stars').textContent = gameState.stars;
}

function updateLives() {
    const heartsContainer = document.getElementById('hearts-container');
    heartsContainer.innerHTML = '';
    for (let i = 0; i < gameState.lives; i++) {
        const heart = document.createElement('span');
        heart.className = 'heart';
        heart.textContent = '❤️';
        heartsContainer.appendChild(heart);
    }
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
    const speed = CONFIG.speeds[SETTINGS.speed] || CONFIG.speeds.normal;

    // Move world
    ground.children.forEach(segment => {
        segment.position.z -= speed * delta;
        if (segment.position.z < -10) {
            segment.position.z += 150;
        }
    });

    // Move obstacles
    obstacles.forEach((obstacle, index) => {
        obstacle.position.z -= speed * delta;
        obstacle.rotation.y += delta;

        if (obstacle.position.z < -5) {
            scene.remove(obstacle);
            obstacles.splice(index, 1);
        }

        // Collision detection
        if (Math.abs(obstacle.position.z) < 1 &&
            Math.abs(obstacle.position.x - character.position.x) < 0.8 &&
            character.position.y < 1.5) {
            gameState.lives--;
            updateLives();
            scene.remove(obstacle);
            obstacles.splice(index, 1);

            if (gameState.lives <= 0) {
                gameOver();
            }
        }
    });

    // Move coins
    coins.forEach((coin, index) => {
        coin.position.z -= speed * delta;
        coin.rotation.z += delta * 3;

        if (coin.position.z < -5) {
            scene.remove(coin);
            coins.splice(index, 1);
        }

        // Collection detection
        if (Math.abs(coin.position.z) < 1 &&
            Math.abs(coin.position.x - character.position.x) < 0.6) {
            gameState.coins++;
            updateHUD();
            scene.remove(coin);
            coins.splice(index, 1);
        }
    });

    // Move collectibles
    collectibles.forEach((item, index) => {
        item.position.z -= speed * delta;
        item.position.y = 1.5 + Math.sin(Date.now() * 0.003) * 0.3;

        if (item.position.z < -5) {
            scene.remove(item);
            collectibles.splice(index, 1);
        }

        if (Math.abs(item.position.z) < 1 &&
            Math.abs(item.position.x - character.position.x) < 0.6) {
            gameState.stars++;
            gameState.coins += 5;
            updateHUD();
            scene.remove(item);
            collectibles.splice(index, 1);
        }
    });

    // Animate character
    characterBob += delta * 10;
    if (character.userData.body) {
        character.userData.body.position.y = 1.2 + Math.sin(characterBob) * 0.08;
    }
    if (character.userData.tail) {
        character.userData.tail.rotation.y = Math.sin(characterBob * 0.5) * 0.2;
    }
    if (character.userData.leftLeg) {
        character.userData.leftLeg.rotation.x = Math.sin(characterBob) * 0.3;
        character.userData.rightLeg.rotation.x = Math.sin(characterBob + Math.PI) * 0.3;
    }

    // Update distance
    gameState.distance += speed * delta;

    // Show math question every 100m
    if (!gameState.currentQuestion &&
        Math.floor(gameState.distance) % 100 === 0 &&
        Math.floor(gameState.distance) > 10 &&
        gameState.distance % 100 < 0.5) {
        showMathQuestion();
    }

    // Spawn new objects
    if (Math.random() < 0.015) {
        const lane = Math.floor(Math.random() * CONFIG.lanes);
        createCoin(lane, CONFIG.spawnDistance);
    }

    if (Math.random() < 0.008) {
        const lane = Math.floor(Math.random() * CONFIG.lanes);
        createObstacle(lane, CONFIG.spawnDistance);
    }

    if (Math.random() < 0.003) {
        const lane = Math.floor(Math.random() * CONFIG.lanes);
        createStar(lane, CONFIG.spawnDistance);
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ============================================
// INITIALIZE GAME
// ============================================
init();
