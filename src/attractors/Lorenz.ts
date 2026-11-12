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
    const system = {
        name: "lorenz",
        parameters: {
            sigma: 10,
            rho: 28,
            beta: 8 / 3
        },
        derivative: lorenz
    }
    modules.push(system);
}
