import { create } from 'zustand';
import type { SystemParameters, c3d } from './types';
import { getDefaultParams, getSystemConfig } from './attractors';

export type GridPlane = 'xy' | 'yz' | 'xz';

export type VisualProfile = 'sprites' | 'spheres';

interface SettingsState {
    system: string;
    params: SystemParameters;
    grids: Record<GridPlane, boolean>;
    gridSize: number;
    gridStep: number;
    animationSpeed: number;
    particleSize: number;
    particleCount: number;
    cameraPosition: c3d;
    cameraTarget: c3d;
    origin: c3d;
    colors: string[];
    visualProfile: VisualProfile;
    setSystem: (system: string) => void;
    setParam: (key: string, value: number) => void;
    setOrigin: (origin: c3d) => void;
    addColor: () => void;
    removeColor: (index: number) => void;
    setColor: (index: number, color: string) => void;
    setVisualProfile: (profile: VisualProfile) => void;
    toggleGrid: (plane: GridPlane) => void;
    setGridSize: (size: number) => void;
    setGridStep: (step: number) => void;
    setAnimationSpeed: (speed: number) => void;
    setParticleSize: (size: number) => void;
    setParticleCount: (count: number) => void;
    setCameraPose: (position: c3d, target: c3d) => void;
}

const DEFAULT_SYSTEM = "lorenz";
const DEFAULT_VIEW = getSystemConfig(DEFAULT_SYSTEM)!.view;
const DEFAULT_ORIGIN = getSystemConfig(DEFAULT_SYSTEM)!.origin;

const round2 = (n: number) => Math.round(n * 100) / 100;

const DEFAULT_COLORS = [
    "#0088ff", "#ff4444", "#00ff88", "#ffaa00",
    "#aa00ff", "#ff00aa", "#00ffff", "#ffff00",
];

export const useSettingsStore = create<SettingsState>((set) => ({
    system: DEFAULT_SYSTEM,
    params: getDefaultParams(DEFAULT_SYSTEM),
    grids: { xy: true, yz: false, xz: false },
    gridSize: 60,
    gridStep: 1,
    animationSpeed: 2,
    particleSize: 0.35,
    particleCount: 100,
    cameraPosition: DEFAULT_VIEW.cameraPosition,
    cameraTarget: DEFAULT_VIEW.target,
    origin: DEFAULT_ORIGIN,
    colors: DEFAULT_COLORS,
    visualProfile: "sprites",
    setSystem: (system) => set({
        system,
        params: getDefaultParams(system),
        origin: getSystemConfig(system)?.origin ?? [0, 0, 0],
    }),
    setParam: (key, value) =>
        set((state) => ({ params: { ...state.params, [key]: value } })),
    setOrigin: (origin) => set({ origin }),
    addColor: () =>
        set((state) => ({
            colors: [
                ...state.colors,
                `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0")}`,
            ],
        })),
    removeColor: (index) =>
        set((state) => ({
            colors: state.colors.length > 1
                ? state.colors.filter((_, i) => i !== index)
                : state.colors,
        })),
    setColor: (index, color) =>
        set((state) => ({
            colors: state.colors.map((c, i) => (i === index ? color : c)),
        })),
    setVisualProfile: (profile) => set({ visualProfile: profile }),
    toggleGrid: (plane) =>
        set((state) => ({ grids: { ...state.grids, [plane]: !state.grids[plane] } })),
    setGridSize: (size) => set({ gridSize: size }),
    setGridStep: (step) => set({ gridStep: step }),
    setAnimationSpeed: (speed) => set({ animationSpeed: speed }),
    setParticleSize: (size) => set({ particleSize: size }),
    setParticleCount: (count) => set({ particleCount: count }),
    setCameraPose: (position, target) => set({
        cameraPosition: [round2(position[0]), round2(position[1]), round2(position[2])],
        cameraTarget: [round2(target[0]), round2(target[1]), round2(target[2])],
    }),
}));
