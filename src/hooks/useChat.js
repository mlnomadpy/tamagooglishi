import { useState, useEffect, useCallback, useRef } from 'react';
import { getLLMService } from '../core/LLMService.js';

export function useChat(stats, stage) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const llmServiceRef = useRef(null);

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
        isAI: response.isAI
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      // Add error message
      const errorMessage = {
        role: 'assistant',
        content: "Oops! Something went wrong... *confused sounds* 😵",
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
