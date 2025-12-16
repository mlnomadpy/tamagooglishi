import { useState, useEffect, useCallback, useRef } from 'react';
import { getLLMService } from '../core/LLMService.js';

export function useChat(stats, stage, actions = {}) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const llmServiceRef = useRef(null);
  const actionsRef = useRef(actions);

  // Keep actions ref updated
  useEffect(() => {
    actionsRef.current = actions;
  }, [actions]);

  // Initialize LLM service
  useEffect(() => {
    const initService = async () => {
      const service = getLLMService();
      llmServiceRef.current = service;
      await service.initialize();
      setIsInitialized(true);
    };
    
    initService();
    
    return () => {
      if (llmServiceRef.current) {
        llmServiceRef.current.destroy();
      }
    };
  }, []);

  // Set up action handler
  useEffect(() => {
    if (llmServiceRef.current && isInitialized) {
      llmServiceRef.current.setActionHandler((action, ...args) => {
        const currentActions = actionsRef.current;
        if (action === 'move' && currentActions.move) {
          currentActions.move(args[0]); // direction
        } else if (currentActions[action]) {
          currentActions[action]();
        }
      });
    }
  }, [isInitialized]);

  // Update LLM context when stats or stage change
  useEffect(() => {
    if (llmServiceRef.current && isInitialized) {
      llmServiceRef.current.updateContext(stage, stats);
    }
  }, [stats, stage, isInitialized]);

  const sendMessage = useCallback(async (content) => {
    if (!llmServiceRef.current || !content.trim()) return;

    // Add user message
    const userMessage = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await llmServiceRef.current.chat(content);
      
      // Add assistant message
      const assistantMessage = {
        role: 'assistant',
        content: response.message,
        suggestedAction: response.suggestedAction,
        executedAction: response.executedAction,
        isAI: response.isAI
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      // Add user-friendly error message based on error type
      let errorContent = "Oops! I couldn't understand that. Try asking me something else! 😅";
      if (error.name === 'NetworkError' || error.message?.includes('network')) {
        errorContent = "I'm having trouble connecting right now. Please try again! 🔄";
      } else if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
        errorContent = "That took too long! Let me try again... ⏳";
      }
      
      const errorMessage = {
        role: 'assistant',
        content: errorContent,
        suggestedAction: null,
        isAI: false
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleOpen = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    if (llmServiceRef.current) {
      llmServiceRef.current.resetConversation();
    }
  }, []);

  return {
    messages,
    isLoading,
    isOpen,
    sendMessage,
    toggleOpen,
    clearMessages,
    isInitialized
  };
}
