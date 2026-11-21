import { create } from 'zustand';
import type { SystemParameters, c3d } from './types';
import { getDefaultParams, getSystemConfig } from './attractors';

export type GridPlane = 'xy' | 'yz' | 'xz';

interface SettingsState {
    system: string;
    params: SystemParameters;
    grids: Record<GridPlane, boolean>;
    animationSpeed: number;
    particleSize: number;
    particleCount: number;
    cameraPosition: c3d;
    cameraTarget: c3d;
    setSystem: (system: string) => void;
    setParam: (key: string, value: number) => void;
    toggleGrid: (plane: GridPlane) => void;
    setAnimationSpeed: (speed: number) => void;
    setParticleSize: (size: number) => void;
    setParticleCount: (count: number) => void;
    setCameraPose: (position: c3d, target: c3d) => void;
}

const DEFAULT_SYSTEM = "lorenz";
const DEFAULT_VIEW = getSystemConfig(DEFAULT_SYSTEM)!.view;

const round2 = (n: number) => Math.round(n * 100) / 100;

export const useSettingsStore = create<SettingsState>((set) => ({
    system: DEFAULT_SYSTEM,
    params: getDefaultParams(DEFAULT_SYSTEM),
    grids: { xy: true, yz: false, xz: false },
    animationSpeed: 2,
    particleSize: 0.35,
    particleCount: 100,
    cameraPosition: DEFAULT_VIEW.cameraPosition,
    cameraTarget: DEFAULT_VIEW.target,
    setSystem: (system) => set({ system, params: getDefaultParams(system) }),
    setParam: (key, value) =>
        set((state) => ({ params: { ...state.params, [key]: value } })),
    toggleGrid: (plane) =>
        set((state) => ({ grids: { ...state.grids, [plane]: !state.grids[plane] } })),
    setAnimationSpeed: (speed) => set({ animationSpeed: speed }),
    setParticleSize: (size) => set({ particleSize: size }),
    setParticleCount: (count) => set({ particleCount: count }),
    setCameraPose: (position, target) => set({
        cameraPosition: [round2(position[0]), round2(position[1]), round2(position[2])],
        cameraTarget: [round2(target[0]), round2(target[1]), round2(target[2])],
    }),
}));
