function StatsPanel({ stats, stage, age }) {
  return (
    <div id="stats-panel">
      <div className="stat-row">Hunger: <span id="stat-hunger">{stats.hunger}</span>%</div>
      <div className="stat-row">Energy: <span id="stat-energy">{stats.energy}</span>%</div>
      <div className="stat-row">Happiness: <span id="stat-happiness">{stats.happiness}</span>%</div>
      <div className="stat-row">Hygiene: <span id="stat-hygiene">{stats.hygiene}</span>%</div>
      <div className="stat-row">Stage: <span id="stat-age">{stage} ({age}m)</span></div>
    </div>
  );
}

export default StatsPanel;
