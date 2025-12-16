function ActionsPanel({ actions }) {
  const handleAction = (action) => (e) => {
    e.preventDefault();
    action();
  };

  return (
    <div id="actions-panel">
      <button 
        id="btn-feed" 
        className="action-btn"
        onClick={handleAction(actions.feed)}
        onTouchStart={handleAction(actions.feed)}
      >
        FEED
      </button>
      <button 
        id="btn-sleep" 
        className="action-btn"
        onClick={handleAction(actions.sleep)}
        onTouchStart={handleAction(actions.sleep)}
      >
        SLEEP
      </button>
      <button 
        id="btn-play" 
        className="action-btn"
        onClick={handleAction(actions.play)}
        onTouchStart={handleAction(actions.play)}
      >
        PLAY
      </button>
      <button 
        id="btn-clean" 
        className="action-btn"
        onClick={handleAction(actions.clean)}
        onTouchStart={handleAction(actions.clean)}
      >
        CLEAN
      </button>
    </div>
  );
}

export default ActionsPanel;
