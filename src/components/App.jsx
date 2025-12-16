import { useRef } from 'react';
import { useGame } from '../hooks/useGame.js';
import StatsPanel from './StatsPanel.jsx';
import ActionsPanel from './ActionsPanel.jsx';
import GameCanvas from './GameCanvas.jsx';
import GameOverOverlay from './GameOverOverlay.jsx';

function App() {
  const canvasRef = useRef(null);
  const { stats, stage, age, isDead, wasAlive, actions } = useGame(canvasRef);

  return (
    <div id="app">
      <div id="ui-layer">
        <StatsPanel stats={stats} stage={stage} age={age} />
        <ActionsPanel actions={actions} />
        {isDead && wasAlive && (
          <GameOverOverlay onRestart={actions.restart} />
        )}
      </div>
      <GameCanvas ref={canvasRef} />
    </div>
  );
}

export default App;
