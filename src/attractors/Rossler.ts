import { df, System } from "../types";

const rossler: df = (t, state, parameters) => {
    const [x, y, z] = state;
    const {a = 0.2, b = 0.2, c = 5.7} = parameters || {};

    return [
        -y - z,
        x + a * y,
        b + z * (x - c)
    ];
}

export function registerRossler(modules: System[]) {
    const system: System = {
        name: "rossler",
        parameters: [
            { key: "a", label: "a", default: 0.2, step: 0.05 },
            { key: "b", label: "b", default: 0.2, step: 0.05 },
            { key: "c", label: "c", default: 5.7, step: 0.1 },
        ],
        integration: { timeSpan: 100, dt: 0.01 },
        initialConditions: [
            [1, 1, 0],
            [1.1, 1, 0],
            [-5, 0, 10],
            [5, 5, 5]
        ],
        derivative: rossler
    }
    modules.push(system);
}
