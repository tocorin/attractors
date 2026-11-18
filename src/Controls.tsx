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
    const animationSpeed = useSettingsStore((state) => state.animationSpeed);
    const setAnimationSpeed = useSettingsStore((state) => state.setAnimationSpeed);
    const particleSize = useSettingsStore((state) => state.particleSize);
    const setParticleSize = useSettingsStore((state) => state.setParticleSize);
    const particleCount = useSettingsStore((state) => state.particleCount);
    const setParticleCount = useSettingsStore((state) => state.setParticleCount);

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
        <input
          type="number"
          id="animation-speed"
          value={animationSpeed}
          step="0.25"
          min="0"
          max="5"
          onChange={(e) => {
            const value = parseFloat(e.target.value);
            if (!isNaN(value)) setAnimationSpeed(value);
          }}
        />

        <label htmlFor="particle-size">Размер частиц:</label>
        <input
          type="number"
          id="particle-size"
          value={particleSize}
          step="0.05"
          min="0.05"
          onChange={(e) => {
            const value = parseFloat(e.target.value);
            if (!isNaN(value)) setParticleSize(value);
          }}
        />

        <label htmlFor="particle-count">Количество частиц:</label>
        <input
          type="number"
          id="particle-count"
          value={particleCount}
          step="10"
          min="0"
          onChange={(e) => {
            const value = parseInt(e.target.value, 10);
            if (!isNaN(value)) setParticleCount(value);
          }}
        />
      </div>
    );
}
