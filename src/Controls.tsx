import React from "react";
import { useSettingsStore, type GridPlane } from "./store";

export default function Controls() {
    const grids = useSettingsStore((state) => state.grids);
    const toggleGrid = useSettingsStore((state) => state.toggleGrid);
    const system = useSettingsStore((state) => state.system);
    const setSystem = useSettingsStore((state) => state.setSystem);

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
        <label>σ (sigma):</label>
        <input type="number" id="sigma" value="10" step="0.1" />

        <label>ρ (rho):</label>
        <input type="number" id="rho" value="28" step="0.1" />

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
