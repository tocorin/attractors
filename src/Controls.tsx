import { useState } from "react";
import { useSettingsStore, type GridPlane, type VisualProfile } from "./store";
import { getParameterDescriptors } from "./attractors";
import type { c3d } from "./types";

function formatVec(v: [number, number, number]): string {
    return `[${v.join(", ")}]`;
}

function copyToClipboard(text: string, onDone: () => void) {
    const fallbackCopy = () => {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        onDone();
    };
    if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).then(onDone).catch(fallbackCopy);
    } else {
        fallbackCopy();
    }
}

export default function Controls() {
    const [collapsed, setCollapsed] = useState(false);
    const [copied, setCopied] = useState(false);
    const [originCopied, setOriginCopied] = useState(false);
    const [colorsCollapsed, setColorsCollapsed] = useState(true);

    const system = useSettingsStore((state) => state.system);
    const setSystem = useSettingsStore((state) => state.setSystem);
    const params = useSettingsStore((state) => state.params);
    const setParam = useSettingsStore((state) => state.setParam);
    const grids = useSettingsStore((state) => state.grids);
    const toggleGrid = useSettingsStore((state) => state.toggleGrid);
    const gridSize = useSettingsStore((state) => state.gridSize);
    const setGridSize = useSettingsStore((state) => state.setGridSize);
    const gridStep = useSettingsStore((state) => state.gridStep);
    const setGridStep = useSettingsStore((state) => state.setGridStep);
    const animationSpeed = useSettingsStore((state) => state.animationSpeed);
    const setAnimationSpeed = useSettingsStore((state) => state.setAnimationSpeed);
    const particleSize = useSettingsStore((state) => state.particleSize);
    const setParticleSize = useSettingsStore((state) => state.setParticleSize);
    const particleCount = useSettingsStore((state) => state.particleCount);
    const setParticleCount = useSettingsStore((state) => state.setParticleCount);
    const cameraPosition = useSettingsStore((state) => state.cameraPosition);
    const cameraTarget = useSettingsStore((state) => state.cameraTarget);
    const origin = useSettingsStore((state) => state.origin);
    const setOrigin = useSettingsStore((state) => state.setOrigin);
    const colors = useSettingsStore((state) => state.colors);
    const addColor = useSettingsStore((state) => state.addColor);
    const removeColor = useSettingsStore((state) => state.removeColor);
    const setColor = useSettingsStore((state) => state.setColor);
    const visualProfile = useSettingsStore((state) => state.visualProfile);
    const setVisualProfile = useSettingsStore((state) => state.setVisualProfile);

    const updateOriginAxis = (axis: 0 | 1 | 2, value: number) => {
        const next: c3d = [...origin];
        next[axis] = value;
        setOrigin(next);
    };

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
                  <option value="chen">Чен</option>
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
              <>
                <div className="view-info">
                  <h4>Ракурс (текущий)</h4>
                  <div className="view-row">
                    <span>target:</span>
                    <code>{formatVec(cameraTarget)}</code>
                  </div>
                  <div className="view-row">
                    <span>camera:</span>
                    <code>{formatVec(cameraPosition)}</code>
                  </div>
                  <button
                    type="button"
                    className="copy-button"
                    onClick={() => {
                      const markCopied = () => {
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1500);
                      };
                      copyToClipboard(
                        `view: {\n    target: ${formatVec(cameraTarget)},\n    cameraPosition: ${formatVec(cameraPosition)}\n},`,
                        markCopied
                      );
                    }}
                  >
                    {copied ? "Скопировано" : "Копировать view"}
                  </button>
                </div>
                <div className="view-info">
                  <h4>Смещение (origin)</h4>
                  {([0, 1, 2] as const).map((axis) => (
                    <div className="control-row" key={axis}>
                      <label htmlFor={`origin-${axis}`}>{"xyz"[axis]}:</label>
                      <input
                        type="number"
                        id={`origin-${axis}`}
                        value={origin[axis]}
                        step={0.1}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (!isNaN(value)) updateOriginAxis(axis, value);
                        }}
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    className="copy-button"
                    onClick={() => {
                      const markCopied = () => {
                        setOriginCopied(true);
                        setTimeout(() => setOriginCopied(false), 1500);
                      };
                      copyToClipboard(`origin: ${formatVec(origin)},`, markCopied);
                    }}
                  >
                    {originCopied ? "Скопировано" : "Копировать origin"}
                  </button>
                </div>
              </>
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
              <div className="control-row">
                <label htmlFor="grid-size">Размер грида</label>
                <div className="slider-row">
                  <input
                    type="range"
                    id="grid-size"
                    min="10"
                    max="200"
                    step="10"
                    value={gridSize}
                    onChange={(e) => setGridSize(parseInt(e.target.value, 10))}
                  />
                  <span className="value-badge">{gridSize}</span>
                </div>
              </div>
              <div className="control-row">
                <label htmlFor="grid-step">Шаг сетки</label>
                <div className="slider-row">
                  <input
                    type="range"
                    id="grid-step"
                    min="0.5"
                    max="20"
                    step="0.5"
                    value={gridStep}
                    onChange={(e) => setGridStep(parseFloat(e.target.value))}
                  />
                  <span className="value-badge">{gridStep}</span>
                </div>
              </div>
            </section>

            <section>
              <h4>Вид</h4>
              <div className="control-row">
                <label htmlFor="visual-profile">Профиль визуализации</label>
                <select
                  id="visual-profile"
                  value={visualProfile}
                  onChange={(e) => setVisualProfile(e.target.value as VisualProfile)}
                >
                  <option value="sprites">Спрайты + свечение</option>
                  <option value="spheres">Шары</option>
                </select>
              </div>
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

            <section>
              <div
                className="section-header"
                role="button"
                tabIndex={0}
                aria-expanded={!colorsCollapsed}
                aria-label={colorsCollapsed ? "Развернуть цвета" : "Свернуть цвета"}
                onClick={() => setColorsCollapsed((prev) => !prev)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setColorsCollapsed((prev) => !prev);
                  }
                }}
              >
                <h4>Цвета</h4>
                <span aria-hidden="true">{colorsCollapsed ? "▸" : "▾"}</span>
              </div>
              {!colorsCollapsed && (
                <>
                  {colors.map((color, index) => (
                    <div className="color-row" key={index}>
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(index, e.target.value)}
                      />
                      <code>{color}</code>
                      <button
                        type="button"
                        onClick={() => removeColor(index)}
                        disabled={colors.length <= 1}
                        aria-label={`Удалить цвет ${color}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button type="button" className="copy-button" onClick={addColor}>
                    Добавить цвет
                  </button>
                </>
              )}
            </section>
          </div>
        )}
      </div>
    );
}
