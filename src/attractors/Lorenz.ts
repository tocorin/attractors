import { df, System } from "../types";

const lorenz: df = (t, state, parameters) => {
    const [x, y, z] = state;
    const { sigma = 10, rho = 28, beta = 8 / 3 } = parameters || {};

    return [
        sigma * (y - x),
        x * (rho - z) - y,
        x * y - beta * z
    ];
}

export function registerLorenz(modules: System[]) {
    const system: System = {
        name: "lorenz",
        parameters: [
            { key: "sigma", label: "σ (sigma)", default: 10, step: 0.1 },
            { key: "rho", label: "ρ (rho)", default: 28, step: 0.1 },
            { key: "beta", label: "β (beta)", default: 8 / 3, step: 0.01 },
        ],
        integration: { timeSpan: 100, dt: 0.01 },
        initialConditions: [
            [1, 1, 1],
            [1.1, 1, 1],
            [-5, 0, 10],
            [5, 5, 5]
        ],
        derivative: lorenz
    }
    modules.push(system);
}
