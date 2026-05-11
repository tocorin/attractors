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
    [key: string]: number
}

export type System = {
    name: string;
    parameters: SystemParameters;
    derivative: df;
}
