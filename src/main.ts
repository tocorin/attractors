import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { c3d, Trajectory, SystemParameters } from './types';
import { rk4, getSystem } from './attractors';



const COLORS = [
    0x0088ff, 0xff4444, 0x00ff88, 0xffaa00,
    0xaa00ff, 0xff00aa, 0x00ffff, 0xffff00
];

let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let trajectories: Trajectory[] = [];
let trajectoryMeshes: THREE.Line[] = [];
let particleMeshes: THREE.Mesh[] = [];
let particleIndices: number[] = [];
let particleTrajectoryIndices: number[] = [];
const PARTICLE_SPEED = 2;
const PARTICLES_PER_TRAJECTORY = 100;
let animationId: number | null = null;

// Инициализация Three.js
function init() {
    console.log("initialize three.js")
    const container = document.getElementById('canvas-container')!;

    // Сцена
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    

    // Камера
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.up.set(0, 0, 1);
    camera.position.set(40, 30, 40);
	

    // Рендерер
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Контролы орбиты
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Оси координат
    const axesHelper = new THREE.AxesHelper(30);
    scene.add(axesHelper);

    // Свет
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    // Обработчики событий
    window.addEventListener('resize', onWindowResize);
    setupControls();

    // Запуск цикла рендеринга
    animate();

    // Запуск по умолчанию
    runSimulation();
}

function setupControls() {

}

function animate() {
    animationId = requestAnimationFrame(animate);

    particleMeshes.forEach((mesh, idx) => {
        const trajectory = trajectories[particleTrajectoryIndices[idx]];
        if (!trajectory || trajectory.points.length === 0) {
            return;
        }

        const frame = particleIndices[idx] % trajectory.points.length;
        const point = trajectory.points[frame];
        mesh.position.set(point[0], point[1], point[2]);
        particleIndices[idx] = (particleIndices[idx] + PARTICLE_SPEED) % trajectory.points.length;
    });

    controls.update();
    renderer.render(scene, camera);
}

// Создание геометрии траектории
function createTrajectoryLine(points: c3d[], color: number): THREE.Line {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(points.length * 3);
    
    points.forEach((point, i) => {
        positions[i * 3] = point[0];
        positions[i * 3 + 1] = point[1];
        positions[i * 3 + 2] = point[2];
    });
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.LineBasicMaterial({ 
        color, 
        linewidth: 2,
        transparent: true,
        opacity: 0.1
    });
    
    return new THREE.Line(geometry, material);
}

function createMovingParticle(color: number): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(0.35, 16, 16);
    const material = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.2
    });

    return new THREE.Mesh(geometry, material);
}

// Запуск симуляции
function runSimulation() {
    clearTrajectories();
    
    // const systemName = (document.getElementById('system-select') as HTMLSelectElement).value;
    // const sigma = parseFloat((document.getElementById('sigma') as HTMLInputElement).value);
    // const rho = parseFloat((document.getElementById('rho') as HTMLInputElement).value);
    // const beta = parseFloat((document.getElementById('beta') as HTMLInputElement).value);
    // const timeSpan = parseFloat((document.getElementById('time-span') as HTMLInputElement).value);
    // const dt = parseFloat((document.getElementById('dt') as HTMLInputElement).value);
    

	const systemName = "rossler";
    const sigma = 0.2;
    const rho = 0.2
    const beta = 0.2
    const timeSpan = 100
    const dt = 0.01


    const params: SystemParameters = { sigma, rho, beta };
    const derivativeFn = getSystem(systemName);
    
    // Несколько начальных условий для наглядности
    const initialConditions: c3d[] = [
        [1, 1, 1],
        [1.1, 1, 1],
        [-5, 0, 10],
        [5, 5, 5]
    ];
    
    initialConditions.forEach((ic, idx) => {
        const points = rk4(derivativeFn, ic, [0, timeSpan], dt, params);
        const color = COLORS[idx % COLORS.length];
        
        const trajectory: Trajectory = {
            points,
            color,
            initial: ic
        };
        trajectories.push(trajectory);
        
        const line = createTrajectoryLine(points, color);
        scene.add(line);
        trajectoryMeshes.push(line);

        for (let i = 0; i < PARTICLES_PER_TRAJECTORY; i++) {
            const particle = createMovingParticle(color);
            const randomFrame = Math.floor(Math.random() * points.length);
            const point = points[randomFrame];
            particle.position.set(point[0], point[1], point[2]);

            scene.add(particle);
            particleMeshes.push(particle);
            particleIndices.push(randomFrame);
            particleTrajectoryIndices.push(idx);
        }
    });
}

// Очистка траекторий
function clearTrajectories() {
    trajectoryMeshes.forEach(mesh => {
        scene.remove(mesh);
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
    });

    particleMeshes.forEach(mesh => {
        scene.remove(mesh);
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
    });

    trajectoryMeshes = [];
    particleMeshes = [];
    particleIndices = [];
    particleTrajectoryIndices = [];
    trajectories = [];
}

// Обработка изменения размера окна
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}


// Запуск
init();