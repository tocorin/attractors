import { useState } from "react";
import { useSettingsStore, type GridPlane } from "./store";
import { getParameterDescriptors } from "./attractors";

export default function Controls() {
    const [collapsed, setCollapsed] = useState(false);

    const system = useSettingsStore((state) => state.system);
    const setSystem = useSettingsStore((state) => state.setSystem);
    const params = useSettingsStore((state) => state.params);
    const setParam = useSettingsStore((state) => state.setParam);
    const grids = useSettingsStore((state) => state.grids);
    const toggleGrid = useSettingsStore((state) => state.toggleGrid);
    const animationSpeed = useSettingsStore((state) => state.animationSpeed);
    const setAnimationSpeed = useSettingsStore((state) => state.setAnimationSpeed);
    const particleSize = useSettingsStore((state) => state.particleSize);
    const setParticleSize = useSettingsStore((state) => state.setParticleSize);
    const particleCount = useSettingsStore((state) => state.particleCount);
    const setParticleCount = useSettingsStore((state) => state.setParticleCount);

    return (
      <div id="controls">
        <div className="panel-header">
          <h3>🎛️ Ручки</h3>
          <button
            type="button"
            className="panel-toggle"
            onClick={() => setCollapsed((prev) => !prev)}
            aria-label={collapsed ? "Развернуть панель" : "Свернуть панель"}
          >
            {collapsed ? "▸" : "▾"}
          </button>
        </div>

        {!collapsed && (
          <div className="panel-body">
            <section>
              <h4>Система</h4>
              <div className="control-row">
                <label htmlFor="system-select">Система:</label>
                <select
                  id="system-select"
                  value={system}
                  onChange={(e) => setSystem(e.target.value)}
                >
                  <option value="lorenz">Лоренц (хаос)</option>
                  <option value="rossler">Рёсслер</option>
                  <option value="thomas">Томас</option>
                </select>
              </div>
              {getParameterDescriptors(system).map((p) => (
                <div className="control-row" key={p.key}>
                  <label htmlFor={`param-${p.key}`}>{p.label}</label>
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
                </div>
              ))}
            </section>

            <section>
              <h4>Сетки</h4>
              <div className="checkbox-row">
                {(["xy", "yz", "xz"] as GridPlane[]).map((plane) => (
                  <label key={plane}>
                    <input
                      type="checkbox"
                      id={`grid-${plane}`}
                      checked={grids[plane]}
                      onChange={() => toggleGrid(plane)}
                    /> {plane.toUpperCase()}
                  </label>
                ))}
              </div>
            </section>

            <section>
              <h4>Вид</h4>
              <div className="control-row">
                <label htmlFor="animation-speed">Скорость анимации</label>
                <div className="slider-row">
                  <input
                    type="range"
                    id="animation-speed"
                    min="0"
                    max="5"
                    step="0.25"
                    value={animationSpeed}
                    onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                  />
                  <span className="value-badge">{animationSpeed}</span>
                </div>
              </div>

              <div className="control-row">
                <label htmlFor="particle-size">Размер частиц</label>
                <div className="slider-row">
                  <input
                    type="range"
                    id="particle-size"
                    min="0.05"
                    max="1.5"
                    step="0.05"
                    value={particleSize}
                    onChange={(e) => setParticleSize(parseFloat(e.target.value))}
                  />
                  <span className="value-badge">{particleSize.toFixed(2)}</span>
                </div>
              </div>

              <div className="control-row">
                <label htmlFor="particle-count">Количество частиц</label>
                <div className="slider-row">
                  <input
                    type="range"
                    id="particle-count"
                    min="0"
                    max="500"
                    step="10"
                    value={particleCount}
                    onChange={(e) => setParticleCount(parseInt(e.target.value, 10))}
                  />
                  <span className="value-badge">{particleCount}</span>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    );
}
