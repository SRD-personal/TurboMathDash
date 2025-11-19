/**
 * TURBO MATH DASH - Enhanced Game Engine v2.0
 * Professional 3D Endless Math Runner for Kids
 * With Settings, Difficulty Levels, Speed Controls, and Enhanced UI
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

    // Speed multipliers
    speeds: {
        slow: 7,
        normal: 10,
        fast: 14,
        turbo: 20
    },

    // Grade level math ranges
    mathRanges: {
        'K': { add: [1, 10], sub: [1, 5], mult: null, div: null },
        '1': { add: [1, 20], sub: [1, 10], mult: null, div: null },
        '2': { add: [1, 50], sub: [1, 20], mult: [1, 5], div: null },
        '3': { add: [1, 100], sub: [1, 50], mult: [1, 10], div: [1, 20] },
        '4': { add: [1, 200], sub: [1, 100], mult: [1, 12], div: [1, 50] }
    },

    // Difficulty modifiers
    difficultyMods: {
        easy: { wrongChoices: 2, timeBonus: 1.5, spawnRate: 0.7 },
        medium: { wrongChoices: 3, timeBonus: 1.0, spawnRate: 1.0 },
        hard: { wrongChoices: 4, timeBonus: 0.8, spawnRate: 1.3 }
    }
};

function getRunSpeed() {
    return CONFIG.speeds[SETTINGS.speed] || CONFIG.speeds.normal;
}

// ============================================
// GAME STATE
// ============================================
const gameState = {
    running: false,
    paused: false,
    score: 0,
    coins: 0,
    stars: 0,
    distance: 0,
    lives: 3,
    currentLane: 1,
    isJumping: false,
    currentQuestion: null,
    answeredCorrectly: 0,
    totalQuestions: 0,
    questionTimer: null,
    questionTimeLeft: 0,
    questionStartTime: 0
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

// Animation
let clock = new THREE.Clock();
let characterBob = 0;
let lastSpawnCheck = 0;

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

    // Add rim light for character
    const rimLight = new THREE.DirectionalLight(0x4ECDC4, 0.5);
    rimLight.position.set(-5, 5, -10);
    scene.add(rimLight);

    // Create environment
    createGround();
    createSky();
    createEnhancedCharacter();
    createInitialObstacles();

    // Setup controls
    setupControls();

    // Setup UI events
    setupUIEvents();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Start render loop
    animate();
}

// ============================================
// CREATE ENHANCED GROUND
// ============================================
function createGround() {
    const groundGroup = new THREE.Group();

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
        groundGroup.add(groundSegment);

        // Lane markers (dashed lines)
        for (let lane = 0; lane < CONFIG.lanes - 1; lane++) {
            const x = (lane + 1) * CONFIG.laneWidth - CONFIG.lanes;

            // Create dashed line effect
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
                groundGroup.add(divider);
            }
        }
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
        color: 0x667eea,
        side: THREE.BackSide
    });
    sky = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(sky);
}

// ============================================
// CREATE ENHANCED CHARACTER (Better Dash the Dino)
// ============================================
function createEnhancedCharacter() {
    const characterGroup = new THREE.Group();

    // Body (main torso) - more rounded
    const bodyGeometry = new THREE.CapsuleGeometry(0.5, 1.0, 8, 16);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x40E0D0,
        roughness: 0.7,
        metalness: 0.1
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.2;
    body.castShadow = true;
    body.receiveShadow = true;
    characterGroup.add(body);

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
    characterGroup.add(head);

    // Eyes - bigger and more expressive
    const eyeGeometry = new THREE.SphereGeometry(0.15, 12, 12);
    const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF,
        emissive: 0xFFFFFF,
        emissiveIntensity: 0.2
    });
    const pupilGeometry = new THREE.SphereGeometry(0.08, 12, 12);
    const pupilMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000
    });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.25, 2.3, 0.75);
    const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    leftPupil.position.set(-0.25, 2.3, 0.85);
    characterGroup.add(leftEye);
    characterGroup.add(leftPupil);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.25, 2.3, 0.75);
    const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    rightPupil.position.set(0.25, 2.3, 0.85);
    characterGroup.add(rightEye);
    characterGroup.add(rightPupil);

    // Belly (yellow)
    const bellyGeometry = new THREE.SphereGeometry(0.45, 12, 12);
    const bellyMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFD700,
        roughness: 0.8,
        metalness: 0.0
    });
    const belly = new THREE.Mesh(bellyGeometry, bellyMaterial);
    belly.position.y = 1.1;
    belly.position.z = 0.6;
    belly.scale.set(1, 1.2, 0.8);
    characterGroup.add(belly);

    // Tail - more dynamic
    const tailGeometry = new THREE.ConeGeometry(0.25, 1.2, 12);
    const tailMaterial = new THREE.MeshStandardMaterial({
        color: 0xFF8C00,
        roughness: 0.7,
        metalness: 0.1
    });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.set(0, 1.3, -0.9);
    tail.rotation.x = Math.PI / 2.5;
    tail.castShadow = true;
    characterGroup.add(tail);

    // Legs (more rounded)
    const legGeometry = new THREE.CapsuleGeometry(0.18, 0.5, 8, 12);
    const legMaterial = new THREE.MeshStandardMaterial({
        color: 0x40E0D0,
        roughness: 0.7,
        metalness: 0.1
    });

    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.35, 0.4, 0.2);
    leftLeg.castShadow = true;
    characterGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.35, 0.4, 0.2);
    rightLeg.castShadow = true;
    characterGroup.add(rightLeg);

    // Feet
    const footGeometry = new THREE.SphereGeometry(0.2, 12, 12);
    const footMaterial = new THREE.MeshStandardMaterial({
        color: 0x32CD32,
        roughness: 0.9,
        metalness: 0.0
    });

    const leftFoot = new THREE.Mesh(footGeometry, footMaterial);
    leftFoot.position.set(-0.35, 0.12, 0.35);
    leftFoot.scale.set(1, 0.5, 1.3);
    leftFoot.castShadow = true;
    characterGroup.add(leftFoot);

    const rightFoot = new THREE.Mesh(footGeometry, footMaterial);
    rightFoot.position.set(0.35, 0.12, 0.35);
    rightFoot.scale.set(1, 0.5, 1.3);
    rightFoot.castShadow = true;
    characterGroup.add(rightFoot);

    // Spikes on back (small triangles)
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
        characterGroup.add(spike);
    }

    // Position character
    characterGroup.position.set(0, 0, 0);

    character = characterGroup;
    character.userData = { body, head, tail, leftLeg, rightLeg, leftFoot, rightFoot };
    scene.add(character);
}

// ============================================
// CREATE OBSTACLES & COLLECTIBLES
// ============================================
function createInitialObstacles() {
    for (let i = 0; i < 20; i++) {
        const z = 10 + i * 5;
        const lane = Math.floor(Math.random() * CONFIG.lanes);
        createCoin(lane, z);
    }

    for (let i = 0; i < 10; i++) {
        const z = 20 + i * 10;
        const lane = Math.floor(Math.random() * CONFIG.lanes);
        if (Math.random() > 0.7) {
            createObstacle(lane, z);
        }
    }
}

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
    // Create a star shape using multiple cones
    const starGroup = new THREE.Group();

    const coreGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    const coreMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF,
        emissive: 0xFFD700,
        emissiveIntensity: 0.8,
        metalness: 0.5,
        roughness: 0.2
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    starGroup.add(core);

    const x = (lane - 1) * CONFIG.laneWidth;
    starGroup.position.set(x, 1.5, z);
    starGroup.userData = { type: 'star', lane, initialZ: z };

    collectibles.push(starGroup);
    scene.add(starGroup);
}

// Continue in next part...
