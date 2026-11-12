import { c3d, df, SystemParameters, System } from "../types";
import { registerRossler } from "./Rossler";
import { registerLorenz } from "./Lorenz";
export { rk4 } from "./RungeKutta";

const modules: System[] = [];

registerRossler(modules);
registerLorenz(modules);

export function getSystem(name: string): df {
  switch (name) {
    default:
      return modules.find((m) => m.name === name)?.derivative as df;
  }
}

export default modules;
