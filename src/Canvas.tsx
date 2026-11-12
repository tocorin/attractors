import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { c3d, Trajectory, SystemParameters } from './types';
import { rk4, getSystem } from './attractors';
import { useSettingsStore } from './store';

const COLORS = [
    0x0088ff, 0xff4444, 0x00ff88, 0xffaa00,
    0xaa00ff, 0xff00aa, 0x00ffff, 0xffff00
];

const PARTICLE_SPEED = 2;
const PARTICLES_PER_TRAJECTORY = 100;

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

export default function Canvas() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current!;
        let animationId: number | null = null;

        // Сцена
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1a2e);

        // Камера
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.up.set(0, 0, 1);
        camera.position.set(40, 30, 40);

        // Рендерер
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        // Контролы орбиты
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        // Оси координат
        const axesHelper = new THREE.AxesHelper(30);
        scene.add(axesHelper);

        // Гриды по плоскостям XY, YZ, XZ (серый, прозрачность 75%)
        const createGrid = () => {
            const grid = new THREE.GridHelper(60, 60, 0x808080, 0x808080);
            (grid.material as THREE.Material).transparent = true;
            (grid.material as THREE.Material).opacity = 0.25;
            return grid;
        };

        // GridHelper по умолчанию лежит в плоскости XZ
        const gridXY = createGrid();
        gridXY.rotation.x = Math.PI / 2;
        const gridYZ = createGrid();
        gridYZ.rotation.z = Math.PI / 2;
        const gridXZ = createGrid();

        const grids: Record<string, THREE.GridHelper> = { xy: gridXY, yz: gridYZ, xz: gridXZ };
        const syncGrids = (gridsState: Record<string, boolean>) => {
            Object.entries(grids).forEach(([plane, grid]) => {
                grid.visible = !!gridsState[plane];
            });
        };
        syncGrids(useSettingsStore.getState().grids);
        const unsubscribeGrids = useSettingsStore.subscribe((state) => syncGrids(state.grids));
        scene.add(gridXY, gridYZ, gridXZ);

        // Свет
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        scene.add(directionalLight);

        // Симуляция
        const trajectories: Trajectory[] = [];
        const trajectoryMeshes: THREE.Line[] = [];
        const particleMeshes: THREE.Mesh[] = [];
        const particleIndices: number[] = [];
        const particleTrajectoryIndices: number[] = [];

        const clearTrajectories = () => {
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
            trajectories.length = 0;
            trajectoryMeshes.length = 0;
            particleMeshes.length = 0;
            particleIndices.length = 0;
            particleTrajectoryIndices.length = 0;
        };

        const buildTrajectories = (systemName: string) => {
            clearTrajectories();

            const sigma = 0.2;
            const rho = 0.2;
            const beta = 0.2;
            const timeSpan = 100;
            const dt = 0.01;

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

                trajectories.push({ points, color, initial: ic });

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
        };

        buildTrajectories(useSettingsStore.getState().system);
        const unsubscribeSystem = useSettingsStore.subscribe((state, prevState) => {
            if (state.system !== prevState.system) {
                buildTrajectories(state.system);
            }
        });

        // Цикл рендеринга
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

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        window.addEventListener('resize', onWindowResize);
        animate();

        // Очистка при размонтировании
        return () => {
            if (animationId !== null) {
                cancelAnimationFrame(animationId);
            }
            window.removeEventListener('resize', onWindowResize);
            unsubscribeGrids();
            unsubscribeSystem();
            controls.dispose();

            clearTrajectories();

            renderer.dispose();
            container.removeChild(renderer.domElement);
        };
    }, []);

    return <div ref={containerRef} id="canvas-container"></div>;
}
