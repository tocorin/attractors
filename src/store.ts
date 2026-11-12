import { create } from 'zustand';
import type { SystemParameters } from './types';
import { getDefaultParams } from './attractors';

export type GridPlane = 'xy' | 'yz' | 'xz';

interface SettingsState {
    system: string;
    params: SystemParameters;
    grids: Record<GridPlane, boolean>;
    animationSpeed: number;
    particleSize: number;
    particleCount: number;
    setSystem: (system: string) => void;
    setParam: (key: string, value: number) => void;
    toggleGrid: (plane: GridPlane) => void;
    setAnimationSpeed: (speed: number) => void;
    setParticleSize: (size: number) => void;
    setParticleCount: (count: number) => void;
}

const DEFAULT_SYSTEM = "lorenz";

export const useSettingsStore = create<SettingsState>((set) => ({
    system: DEFAULT_SYSTEM,
    params: getDefaultParams(DEFAULT_SYSTEM),
    grids: { xy: true, yz: false, xz: false },
    animationSpeed: 2,
    particleSize: 0.35,
    particleCount: 100,
    setSystem: (system) => set({ system, params: getDefaultParams(system) }),
    setParam: (key, value) =>
        set((state) => ({ params: { ...state.params, [key]: value } })),
    toggleGrid: (plane) =>
        set((state) => ({ grids: { ...state.grids, [plane]: !state.grids[plane] } })),
    setAnimationSpeed: (speed) => set({ animationSpeed: speed }),
    setParticleSize: (size) => set({ particleSize: size }),
    setParticleCount: (count) => set({ particleCount: count }),
}));
