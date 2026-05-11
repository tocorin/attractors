import React from "react";

export default function Controls() {
    return (
      <div id="controls">
        <h3>🎛️ Ручки</h3>
        <label htmlFor="system-select">Система:</label>
        <select id="system-select">
          <option value="lorenz">Лоренц (хаос)</option>
          <option value="rossler">Рёсслер</option>
          <option value="custom">Своя (в коде)</option>
        </select>
        <label>σ (sigma):</label>
        <input type="number" id="sigma" value="10" step="0.1" />

        <label>ρ (rho):</label>
        <input type="number" id="rho" value="28" step="0.1" />
      </div>
    );
}
