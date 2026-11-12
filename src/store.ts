import { create } from 'zustand';

export type GridPlane = 'xy' | 'yz' | 'xz';

interface SettingsState {
    system: string;
    grids: Record<GridPlane, boolean>;
    animationSpeed: number;
    particleSize: number;
    particleCount: number;
    setSystem: (system: string) => void;
    toggleGrid: (plane: GridPlane) => void;
    setAnimationSpeed: (speed: number) => void;
    setParticleSize: (size: number) => void;
    setParticleCount: (count: number) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
    system: "lorenz",
    grids: { xy: true, yz: false, xz: false },
    animationSpeed: 2,
    particleSize: 0.35,
    particleCount: 100,
    setSystem: (system) => set({ system }),
    toggleGrid: (plane) =>
        set((state) => ({ grids: { ...state.grids, [plane]: !state.grids[plane] } })),
    setAnimationSpeed: (speed) => set({ animationSpeed: speed }),
    setParticleSize: (size) => set({ particleSize: size }),
    setParticleCount: (count) => set({ particleCount: count }),
}));
