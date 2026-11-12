import React from "react";
import { useSettingsStore, type GridPlane } from "./store";
import { getParameterDescriptors } from "./attractors";

export default function Controls() {
    const grids = useSettingsStore((state) => state.grids);
    const toggleGrid = useSettingsStore((state) => state.toggleGrid);
    const system = useSettingsStore((state) => state.system);
    const setSystem = useSettingsStore((state) => state.setSystem);
    const params = useSettingsStore((state) => state.params);
    const setParam = useSettingsStore((state) => state.setParam);

    return (
      <div id="controls">
        <h3>🎛️ Ручки</h3>
        <label htmlFor="system-select">Система:</label>
        <select
          id="system-select"
          value={system}
          onChange={(e) => setSystem(e.target.value)}
        >
          <option value="lorenz">Лоренц (хаос)</option>
          <option value="rossler">Рёсслер</option>
        </select>
        {getParameterDescriptors(system).map((p) => (
          <React.Fragment key={p.key}>
            <label htmlFor={`param-${p.key}`}>{p.label}:</label>
            <input
              type="number"
              id={`param-${p.key}`}
              value={params[p.key] ?? p.default}
              step={p.step ?? 0.1}
              min={p.min}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (!isNaN(value)) setParam(p.key, value);
              }}
            />
          </React.Fragment>
        ))}

        <h4>Сетки</h4>
        {(['xy', 'yz', 'xz'] as GridPlane[]).map((plane) => (
          <label key={plane}>
            <input
              type="checkbox"
              id={`grid-${plane}`}
              checked={grids[plane]}
              onChange={() => toggleGrid(plane)}
            /> {plane.toUpperCase()}
          </label>
        ))}

        <h4>Вид</h4>
        <label htmlFor="animation-speed">Скорость анимации:</label>
        <input type="number" id="animation-speed" value="2" step="0.5" min="0" />

        <label htmlFor="particle-size">Размер частиц:</label>
        <input type="number" id="particle-size" value="0.35" step="0.05" min="0.05" />

        <label htmlFor="particle-count">Количество частиц:</label>
        <input type="number" id="particle-count" value="100" step="10" min="0" />
      </div>
    );
}
