import { df, System } from "../types";

const chen: df = (t, state, parameters) => {
    const [x, y, z] = state;
    const { sigma = 35, rho = 28, beta = 3 } = parameters || {};

    return [
        sigma * (y - x),
        (rho - sigma) * x - x * z + rho * y,
        x * y - beta * z
    ];
}

export function registerChen(modules: System[]) {
    const system: System = {
        name: "chen",
        parameters: [
            { key: "sigma", label: "σ (sigma)", default: 35, step: 0.5 },
            { key: "rho", label: "ρ (rho)", default: 28, step: 0.5 },
            { key: "beta", label: "β (beta)", default: 3, step: 0.1 },
        ],
        integration: { timeSpan: 100, dt: 0.005 },
        initialConditions: [
            [-3, 2, 20],
            [-3.1, 2, 20],
            [5, 5, 20],
            [-5, -5, 20]
        ],
        origin: [0, 0, 24],
        view: {
            target: [0, 0, 1],
            cameraPosition: [55, 45, 46]
        },
        derivative: chen
    }
    modules.push(system);
}
