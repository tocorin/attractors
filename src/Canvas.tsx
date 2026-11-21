import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import type { c3d, Trajectory, SystemParameters } from './types';
import { rk4 } from './attractors';
import { getSystemConfig, getDefaultParams } from './attractors';
import { useSettingsStore, type VisualProfile } from './store';

const PARTICLE_BASE_SIZE = 0.35;
// Масштаб спрайта относительно particleSize (квад спрайта в единицах сцены)
const SPRITE_SCALE = 4;

// Радиальный градиент для glow-спрайтов, общий для всех частиц
let glowTexture: THREE.Texture | null = null;
function getGlowTexture(): THREE.Texture {
    if (!glowTexture) {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 64;
        const ctx = canvas.getContext('2d')!;
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.35, 'rgba(255,255,255,0.5)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
        glowTexture = new THREE.CanvasTexture(canvas);
    }
    return glowTexture;
}

function createTrajectoryLine(points: c3d[], color: string): THREE.Line {
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

function applyParticleScale(obj: THREE.Object3D, size: number, profile: VisualProfile) {
    if (profile === 'sprites') {
        obj.scale.set(size * SPRITE_SCALE, size * SPRITE_SCALE, 1);
    } else {
        obj.scale.setScalar(size / PARTICLE_BASE_SIZE);
    }
}

function createMovingParticle(profile: VisualProfile, color: string, size: number): THREE.Object3D {
    if (profile === 'sprites') {
        const material = new THREE.SpriteMaterial({
            map: getGlowTexture(),
            color,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            transparent: true,
        });
        const sprite = new THREE.Sprite(material);
        applyParticleScale(sprite, size, profile);
        return sprite;
    }

    const geometry = new THREE.SphereGeometry(PARTICLE_BASE_SIZE, 16, 16);
    const material = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.2
    });

    const mesh = new THREE.Mesh(geometry, material);
    applyParticleScale(mesh, size, profile);
    return mesh;
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

        // Рендерер
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        // Постобработка для профиля 'sprites': свечение ярких областей
        const composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.2,  // strength
            0.4,  // radius
            0.5   // threshold
        );
        composer.addPass(bloomPass);
        composer.addPass(new OutputPass());

        // Контролы орбиты
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        // Синхронизация положения камеры в стор (для панели)
        let lastPoseSync = 0;
        const syncCameraPose = () => {
            const now = performance.now();
            if (now - lastPoseSync < 100) {
                return;
            }
            lastPoseSync = now;
            useSettingsStore.getState().setCameraPose(
                [camera.position.x, camera.position.y, camera.position.z],
                [controls.target.x, controls.target.y, controls.target.z]
            );
        };
        controls.addEventListener('change', syncCameraPose);

        // Оси координат
        const axesHelper = new THREE.AxesHelper(30);
        scene.add(axesHelper);

        // Гриды по плоскостям XY, YZ, XZ (серый, прозрачность 75%)
        const createGrid = (size: number, divisions: number) => {
            const grid = new THREE.GridHelper(size, divisions, 0x808080, 0x808080);
            (grid.material as THREE.Material).transparent = true;
            (grid.material as THREE.Material).opacity = 0.25;
            return grid;
        };

        // GridHelper по умолчанию лежит в плоскости XZ
        let grids: Record<string, THREE.GridHelper> = {};
        const buildGrids = (size: number, step: number) => {
            Object.values(grids).forEach(grid => {
                scene.remove(grid);
                grid.geometry.dispose();
                (grid.material as THREE.Material).dispose();
            });

            const divisions = Math.max(1, Math.round(size / step));
            const gridXY = createGrid(size, divisions);
            gridXY.rotation.x = Math.PI / 2;
            const gridYZ = createGrid(size, divisions);
            gridYZ.rotation.z = Math.PI / 2;
            const gridXZ = createGrid(size, divisions);

            grids = { xy: gridXY, yz: gridYZ, xz: gridXZ };
            scene.add(gridXY, gridYZ, gridXZ);
        };

        const syncGrids = (gridsState: Record<string, boolean>) => {
            Object.entries(grids).forEach(([plane, grid]) => {
                grid.visible = !!gridsState[plane];
            });
        };
        buildGrids(
            useSettingsStore.getState().gridSize,
            useSettingsStore.getState().gridStep
        );
        syncGrids(useSettingsStore.getState().grids);
        const unsubscribeGrids = useSettingsStore.subscribe((state, prevState) => {
            if (state.gridSize !== prevState.gridSize || state.gridStep !== prevState.gridStep) {
                buildGrids(state.gridSize, state.gridStep);
            }
            syncGrids(state.grids);
        });

        // Свет
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        scene.add(directionalLight);

        // Симуляция
        const trajectories: Trajectory[] = [];
        const trajectoryMeshes: THREE.Line[] = [];
        const particleMeshes: THREE.Object3D[] = [];
        const particleIndices: number[] = [];
        const particleTrajectoryIndices: number[] = [];

        const disposeParticle = (obj: THREE.Object3D) => {
            scene.remove(obj);
            // у спрайтов геометрия общая (внутренняя у three) — не трогаем
            if (obj instanceof THREE.Mesh) {
                obj.geometry.dispose();
            }
            const material = (obj as THREE.Mesh | THREE.Sprite).material as THREE.Material;
            material.dispose();
        };

        const clearTrajectories = () => {
            trajectoryMeshes.forEach(mesh => {
                scene.remove(mesh);
                mesh.geometry.dispose();
                (mesh.material as THREE.Material).dispose();
            });
            particleMeshes.forEach(disposeParticle);
            trajectories.length = 0;
            trajectoryMeshes.length = 0;
            particleMeshes.length = 0;
            particleIndices.length = 0;
            particleTrajectoryIndices.length = 0;
        };

        const buildTrajectories = (systemName: string, paramValues: SystemParameters) => {
            clearTrajectories();

            const config = getSystemConfig(systemName);
            if (!config) {
                return;
            }

            const { derivative: derivativeFn, integration, initialConditions } = config;
            const { timeSpan, dt } = integration;
            const params = { ...getDefaultParams(systemName), ...paramValues };
            const particleCount = useSettingsStore.getState().particleCount;
            const particleSize = useSettingsStore.getState().particleSize;
            const origin = useSettingsStore.getState().origin;
            const colors = useSettingsStore.getState().colors;
            const profile = useSettingsStore.getState().visualProfile;

            initialConditions.forEach((ic, idx) => {
                const rawPoints = rk4(derivativeFn, ic, [0, timeSpan], dt, params);
                const points: c3d[] = rawPoints.map(([x, y, z]) => [
                    x - origin[0],
                    y - origin[1],
                    z - origin[2]
                ]);
                const color = colors[idx % colors.length];

                trajectories.push({ points, color, initial: ic });

                const line = createTrajectoryLine(points, color);
                scene.add(line);
                trajectoryMeshes.push(line);

                for (let i = 0; i < particleCount; i++) {
                    const particle = createMovingParticle(profile, color, particleSize);
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

        // Ракурс применяется только при смене системы, не при изменении параметров
        const applyView = (systemName: string) => {
            const view = getSystemConfig(systemName)?.view;
            if (!view) {
                return;
            }
            camera.position.set(...view.cameraPosition);
            controls.target.set(...view.target);
            controls.update();
        };

        applyView(useSettingsStore.getState().system);
        buildTrajectories(
            useSettingsStore.getState().system,
            useSettingsStore.getState().params
        );
        const unsubscribeSystem = useSettingsStore.subscribe((state, prevState) => {
            if (state.system !== prevState.system) {
                applyView(state.system);
            }
            if (
                state.system !== prevState.system ||
                state.params !== prevState.params ||
                state.particleCount !== prevState.particleCount ||
                state.origin !== prevState.origin ||
                state.visualProfile !== prevState.visualProfile
            ) {
                buildTrajectories(state.system, state.params);
            }
        });
        const unsubscribeParticleSize = useSettingsStore.subscribe((state, prevState) => {
            if (state.particleSize !== prevState.particleSize) {
                particleMeshes.forEach(mesh =>
                    applyParticleScale(mesh, state.particleSize, state.visualProfile));
            }
        });
        // Перекраска без перестроения: цвета меняются чаще, чем траектории
        const applyColors = (colors: string[]) => {
            trajectoryMeshes.forEach((mesh, i) => {
                (mesh.material as THREE.LineBasicMaterial)
                    .color.set(colors[i % colors.length]);
            });
            particleMeshes.forEach((mesh, p) => {
                const tIdx = particleTrajectoryIndices[p];
                const material = ((mesh as THREE.Mesh | THREE.Sprite).material) as THREE.MeshStandardMaterial | THREE.SpriteMaterial;
                material.color.set(colors[tIdx % colors.length]);
                if (material instanceof THREE.MeshStandardMaterial) {
                    material.emissive.set(colors[tIdx % colors.length]);
                }
            });
        };
        const unsubscribeColors = useSettingsStore.subscribe((state, prevState) => {
            if (state.colors !== prevState.colors) {
                applyColors(state.colors);
            }
        });

        // Цикл рендеринга
        function animate() {
            animationId = requestAnimationFrame(animate);

            const speed = useSettingsStore.getState().animationSpeed;

            particleMeshes.forEach((mesh, idx) => {
                const trajectory = trajectories[particleTrajectoryIndices[idx]];
                if (!trajectory || trajectory.points.length === 0) {
                    return;
                }

                const frame = Math.floor(particleIndices[idx]) % trajectory.points.length;
                const point = trajectory.points[frame];
                mesh.position.set(point[0], point[1], point[2]);
                particleIndices[idx] = (particleIndices[idx] + speed) % trajectory.points.length;
            });

            controls.update();
            if (useSettingsStore.getState().visualProfile === 'sprites') {
                composer.render();
            } else {
                renderer.render(scene, camera);
            }
        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            composer.setSize(window.innerWidth, window.innerHeight);
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
            unsubscribeParticleSize();
            unsubscribeColors();
            controls.dispose();
            composer.dispose();

            clearTrajectories();

            renderer.dispose();
            container.removeChild(renderer.domElement);
        };
    }, []);

    return <div ref={containerRef} id="canvas-container"></div>;
}
