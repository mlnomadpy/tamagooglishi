function GameOverOverlay({ onRestart }) {
  return (
    <div id="game-over">
      <div className="game-over-text">GAME OVER</div>
      <button className="restart-btn" onClick={onRestart}>
        RESTART
      </button>
    </div>
  );
}

export default GameOverOverlay;
