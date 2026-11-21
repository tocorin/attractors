import { c3d, df, System } from "../types";

const thomas: df = (t, state, parameters) => {
    const [x, y, z] = state;
    const { b = 0.208 } = parameters || {};

    return [
        Math.sin(y) - b * x,
        Math.sin(z) - b * y,
        Math.sin(x) - b * z
    ];
}

export function registerThomas(modules: System[]) {
    const system: System = {
        name: "thomas",
        parameters: [
            { key: "b", label: "b", default: 0.208, step: 0.002 },
        ],
        integration: { timeSpan: 500, dt: 0.01 },
        initialConditions: [
            [1.1, 1.1, 0.1],
            [0.1, 1.1, 1.1],
            [1.1, 0.1, 1.1],
            [0.1, 0.1, 0.1]
        ] as c3d[],
        view: {
            target: [1.3, 1.3, 1.3],
            cameraPosition: [7, 6, 9]
        },
        derivative: thomas
    }
    modules.push(system);
}
