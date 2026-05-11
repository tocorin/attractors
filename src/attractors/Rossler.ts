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
    const system = {
        name: "rossler",
        parameters: {
            a: 0.2,
            b: 0.2,
            c: 5.7
        },
        derivative: rossler
    }
    modules.push(system);
}