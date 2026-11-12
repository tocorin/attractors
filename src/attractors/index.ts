import { df, SystemParameters, System, ParameterDescriptor } from "../types";
import { registerRossler } from "./Rossler";
import { registerLorenz } from "./Lorenz";
export { rk4 } from "./RungeKutta";

const modules: System[] = [];

registerRossler(modules);
registerLorenz(modules);

export function getSystemConfig(name: string): System | undefined {
  return modules.find((m) => m.name === name);
}

export function getSystem(name: string): df {
  return getSystemConfig(name)?.derivative as df;
}

export function getParameterDescriptors(name: string): ParameterDescriptor[] {
  return getSystemConfig(name)?.parameters ?? [];
}

export function getDefaultParams(name: string): SystemParameters {
  const params: SystemParameters = {};
  getParameterDescriptors(name).forEach((p) => {
    params[p.key] = p.default;
  });
  return params;
}

export default modules;
