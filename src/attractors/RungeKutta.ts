import { c3d, df, SystemParameters } from "../types";

// Классический метод Рунге-Кутты 4-го порядка
export function rk4(
  f: df,
  initialState: c3d,
  tSpan: [number, number],
  dt: number,
  params?: SystemParameters,
): c3d[] {
  const [t0, tEnd] = tSpan;
  const steps = Math.floor((tEnd - t0) / dt);
  const trajectory: c3d[] = [initialState];

  let t = t0;
  let state: c3d = [...initialState];

  for (let i = 0; i < steps; i++) {
    const k1 = f(t, state, params);
    const k2 = f(
      t + dt / 2,
      [
        state[0] + (dt / 2) * k1[0],
        state[1] + (dt / 2) * k1[1],
        state[2] + (dt / 2) * k1[2],
      ],
      params,
    );
    const k3 = f(
      t + dt / 2,
      [
        state[0] + (dt / 2) * k2[0],
        state[1] + (dt / 2) * k2[1],
        state[2] + (dt / 2) * k2[2],
      ],
      params,
    );
    const k4 = f(
      t + dt,
      [state[0] + dt * k3[0], state[1] + dt * k3[1], state[2] + dt * k3[2]],
      params,
    );

    state = [
      state[0] + (dt / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]),
      state[1] + (dt / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]),
      state[2] + (dt / 6) * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]),
    ];

    t += dt;
    trajectory.push(state);
  }

  return trajectory;
}
