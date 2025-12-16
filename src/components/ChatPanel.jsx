import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { MessageCircle, Send, X, Sparkles } from 'lucide-react';

function ChatPanel({ 
  messages, 
  onSendMessage, 
  onSuggestedAction, 
  isOpen, 
  onToggle,
  stage,
  isLoading 
}) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const getStageEmoji = () => {
    switch (stage) {
      case 'BABY': return '🥚';
      case 'CHILD': return '🐣';
      case 'ADULT': return '🐥';
      default: return '🥚';
    }
  };

  const getStageName = () => {
    switch (stage) {
      case 'BABY': return 'Baby';
      case 'CHILD': return 'Child';
      case 'ADULT': return 'Adult';
      default: return 'Baby';
    }
  };

  // Minimized state - just show chat button
  if (!isOpen) {
    return (
      <Button
        className="absolute bottom-6 right-6 gap-2 shadow-lg hover:shadow-xl transition-shadow"
        size="lg"
        onClick={onToggle}
      >
        <MessageCircle className="h-5 w-5" />
        Chat
      </Button>
    );
  }

  return (
    <Card className="absolute bottom-6 right-6 w-80 h-96 flex flex-col backdrop-blur-sm bg-card/95 shadow-xl">
      <CardHeader className="pb-2 flex flex-row items-center justify-between border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <span>{getStageEmoji()}</span>
          <span>Chat with {getStageName()}</span>
        </CardTitle>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8" 
          onClick={onToggle}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8">
            <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" aria-hidden="true" />
            <p>Say hello to your pet!</p>
            <p className="text-xs mt-1">They'll respond based on their current stage and needs.</p>
          </div>
        )}
        
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {msg.executedAction && msg.role === 'assistant' && (
                <div className="text-xs text-green-600 dark:text-green-400 mb-1 font-medium">
                  ✓ {getExecutedActionText(msg.executedAction)}
                </div>
              )}
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.suggestedAction && msg.role === 'assistant' && !msg.executedAction && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full text-xs h-7"
                  onClick={() => onSuggestedAction(msg.suggestedAction)}
                >
                  {getActionText(msg.suggestedAction)}
                </Button>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-secondary text-secondary-foreground rounded-lg px-3 py-2 text-sm">
              <span className="animate-pulse">...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </CardContent>
      
      <form 
        onSubmit={handleSubmit} 
        className="p-3 border-t flex gap-2"
      >
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          aria-label="Chat message input"
          disabled={isLoading}
          className="flex-1 px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:opacity-50"
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={!inputValue.trim() || isLoading}
          aria-label="Send message"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
        </Button>
      </form>
    </Card>
  );
}

function getActionText(action) {
  switch (action) {
    case 'feed': return '🍼 Feed me!';
    case 'sleep': return '😴 Let me sleep';
    case 'play': return '🎮 Play with me!';
    case 'clean': return '🧼 Clean up';
    default: return action;
  }
}

function getExecutedActionText(action) {
  if (action.startsWith('move:')) {
    const direction = action.split(':')[1];
    return `Moved ${direction.toLowerCase()}`;
  }
  switch (action) {
    case 'feed': return 'Fed the pet';
    case 'sleep': return 'Put to sleep';
    case 'play': return 'Playing now';
    case 'clean': return 'Cleaned up';
    default: return `Executed: ${action}`;
  }
}

export default ChatPanel;
