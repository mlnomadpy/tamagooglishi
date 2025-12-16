import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LLMService, getLLMService } from '../LLMService.js';

describe('LLMService', () => {
  let service;

  beforeEach(() => {
    service = new LLMService();
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      expect(service.isAvailable).toBe(false);
      expect(service.currentStage).toBe('BABY');
      expect(service.conversationHistory).toEqual([]);
    });

    it('should initialize and set isAvailable to false when browser AI is not available', async () => {
      await service.initialize();
      expect(service.isAvailable).toBe(false);
    });
  });

  describe('context management', () => {
    it('should update context with stage and stats', () => {
      const stats = { hunger: 50, energy: 80, happiness: 60, hygiene: 90 };
      service.updateContext('CHILD', stats);
      
      expect(service.currentStage).toBe('CHILD');
      expect(service.petStats).toEqual(stats);
    });

    it('should default to BABY stage if no stage provided', () => {
      service.updateContext(null, {});
      expect(service.currentStage).toBe('BABY');
    });
  });

  describe('personality', () => {
    it('should return BABY personality by default', () => {
      const personality = service.getPersonality();
      expect(personality.systemPrompt).toContain('baby');
    });

    it('should return CHILD personality when stage is CHILD', () => {
      service.currentStage = 'CHILD';
      const personality = service.getPersonality();
      expect(personality.systemPrompt).toContain('child');
    });

    it('should return ADULT personality when stage is ADULT', () => {
      service.currentStage = 'ADULT';
      const personality = service.getPersonality();
      expect(personality.systemPrompt).toContain('adult');
    });
  });

  describe('fallback responses', () => {
    beforeEach(() => {
      service.petStats = { hunger: 50, energy: 80, happiness: 60, hygiene: 90 };
    });

    it('should respond to hello greeting', async () => {
      const response = await service.chat('Hello!');
      expect(response.message).toBeTruthy();
      expect(response.isAI).toBe(false);
    });

    it('should suggest feed action when asking about food', async () => {
      service.petStats.hunger = 80; // High hunger
      const response = await service.chat('Are you hungry?');
      expect(response.suggestedAction).toBe('feed');
    });

    it('should suggest sleep action when asking about tiredness', async () => {
      service.petStats.energy = 20; // Low energy
      const response = await service.chat('Are you tired?');
      expect(response.suggestedAction).toBe('sleep');
    });

    it('should suggest play action when asking about playing', async () => {
      service.petStats.happiness = 30; // Low happiness
      const response = await service.chat('Do you want to play?');
      expect(response.suggestedAction).toBe('play');
    });

    it('should suggest clean action when asking about cleaning', async () => {
      service.petStats.hygiene = 30; // Low hygiene
      const response = await service.chat('Do you need cleaning?');
      expect(response.suggestedAction).toBe('clean');
    });

    it('should respond to needs inquiry', async () => {
      service.petStats.hunger = 80; // High hunger (urgent need)
      const response = await service.chat('What do you need?');
      expect(response.message).toBeTruthy();
      expect(response.suggestedAction).toBe('feed');
    });
  });

  describe('conversation history', () => {
    it('should add messages to conversation history', async () => {
      await service.chat('Hello!');
      expect(service.conversationHistory.length).toBe(2); // user + assistant
    });

    it('should reset conversation', async () => {
      await service.chat('Hello!');
      service.resetConversation();
      expect(service.conversationHistory).toEqual([]);
    });
  });

  describe('stage-specific responses', () => {
    it('should use baby talk for BABY stage', () => {
      service.currentStage = 'BABY';
      service.petStats = { hunger: 80, energy: 50, happiness: 50, hygiene: 50 };
      const response = service.getHungerResponse();
      expect(response).toContain('Hungwy');
    });

    it('should use child language for CHILD stage', () => {
      service.currentStage = 'CHILD';
      service.petStats = { hunger: 80, energy: 50, happiness: 50, hygiene: 50 };
      const response = service.getHungerResponse();
      expect(response).toContain('hungry');
    });

    it('should use adult language for ADULT stage', () => {
      service.currentStage = 'ADULT';
      service.petStats = { hunger: 80, energy: 50, happiness: 50, hygiene: 50 };
      const response = service.getHungerResponse();
      expect(response).toContain('hungry');
    });
  });

  describe('getMostUrgentNeed', () => {
    it('should return feed when hunger is highest', () => {
      service.petStats = { hunger: 80, energy: 70, happiness: 70, hygiene: 70 };
      expect(service.getMostUrgentNeed()).toBe('feed');
    });

    it('should return sleep when energy is lowest', () => {
      service.petStats = { hunger: 30, energy: 20, happiness: 70, hygiene: 70 };
      expect(service.getMostUrgentNeed()).toBe('sleep');
    });

    it('should return play when happiness is lowest', () => {
      service.petStats = { hunger: 30, energy: 70, happiness: 20, hygiene: 70 };
      expect(service.getMostUrgentNeed()).toBe('play');
    });

    it('should return clean when hygiene is lowest', () => {
      service.petStats = { hunger: 30, energy: 70, happiness: 70, hygiene: 20 };
      expect(service.getMostUrgentNeed()).toBe('clean');
    });

    it('should return null when all stats are good', () => {
      service.petStats = { hunger: 20, energy: 80, happiness: 80, hygiene: 80 };
      expect(service.getMostUrgentNeed()).toBeNull();
    });
  });

  describe('singleton', () => {
    it('should return the same instance', () => {
      const instance1 = getLLMService();
      const instance2 = getLLMService();
      expect(instance1).toBe(instance2);
    });
  });
});
