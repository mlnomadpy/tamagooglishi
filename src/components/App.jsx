import { useRef, useCallback, useMemo } from 'react';
import { useGame } from '../hooks/useGame.js';
import { useChat } from '../hooks/useChat.js';
import StatsPanel from './StatsPanel.jsx';
import ActionsPanel from './ActionsPanel.jsx';
import GameCanvas from './GameCanvas.jsx';
import GameOverOverlay from './GameOverOverlay.jsx';
import ChatPanel from './ChatPanel.jsx';

function App() {
  const canvasRef = useRef(null);
  const { stats, stage, age, isDead, wasAlive, actions } = useGame(canvasRef);
  
  // Memoize chat actions to prevent unnecessary re-renders
  const chatActions = useMemo(() => ({
    feed: actions.feed,
    sleep: actions.sleep,
    play: actions.play,
    clean: actions.clean,
    move: actions.move
  }), [actions.feed, actions.sleep, actions.play, actions.clean, actions.move]);

  const { 
    messages, 
    isLoading, 
    isOpen, 
    sendMessage, 
    toggleOpen 
  } = useChat(stats, stage, chatActions);

  // Handle suggested actions from chat
  const handleSuggestedAction = useCallback((action) => {
    if (actions[action]) {
      actions[action]();
    }
  }, [actions]);

  return (
    <div id="app">
      <div id="ui-layer">
        <StatsPanel stats={stats} stage={stage} age={age} />
        <ActionsPanel actions={actions} />
        {isDead && wasAlive && (
          <GameOverOverlay onRestart={actions.restart} />
        )}
        <ChatPanel
          messages={messages}
          onSendMessage={sendMessage}
          onSuggestedAction={handleSuggestedAction}
          isOpen={isOpen}
          onToggle={toggleOpen}
          stage={stage}
          isLoading={isLoading}
        />
      </div>
      <GameCanvas ref={canvasRef} />
    </div>
  );
}

export default App;
