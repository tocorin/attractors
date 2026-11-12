/**
 * A pair of 3 real number.
 */
export type c3d = [number, number, number];

/**
 * A derivative function.
 */
export type df = (t: number, state: c3d, parameters?: any) => c3d;

export interface Trajectory {
    points: c3d[];
    color: number;
    initial: c3d;
}

export interface SystemParameters {
    [key: string]: number;
}

export type System = {
    name: string;
    parameters: ParameterDescriptor[];
    integration: IntegrationSettings;
    initialConditions: c3d[];
    derivative: df;
};

export type ParameterDescriptor = {
    key: string;
    label: string;
    default: number;
    step?: number;
    min?: number;
};

export type IntegrationSettings = {
    timeSpan: number;
    dt: number;
};

export type ParticleSettings = {
    size?: number;
    colors: number[];
};

export type Flag = 0 | 1;
export type VectorFlag = [Flag, Flag, Flag];

export type GridSettings = {
    opacity: number;
    enable: VectorFlag[];
};

export type TrajectorySettings = {
    colors: number[];
};

export type VisualizeParameters = {
    particleSettings?: ParticleSettings;
    gridSettings?: GridSettings;
    trajectorySettings?: TrajectorySettings;
};
