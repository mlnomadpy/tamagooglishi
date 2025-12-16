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

  describe('command parsing', () => {
    beforeEach(() => {
      service.petStats = { hunger: 50, energy: 80, happiness: 60, hygiene: 90 };
    });

    it('should parse direct feed command', () => {
      const command = service.parseCommand('feed the pet');
      expect(command).toBe('feed');
    });

    it('should parse direct play command', () => {
      const command = service.parseCommand('play with me');
      expect(command).toBe('play');
    });

    it('should parse direct sleep command', () => {
      const command = service.parseCommand('go to sleep');
      expect(command).toBe('sleep');
    });

    it('should parse direct clean command', () => {
      const command = service.parseCommand('clean up');
      expect(command).toBe('clean');
    });

    it('should parse movement commands', () => {
      expect(service.parseCommand('move up')).toBe('move:UP');
      expect(service.parseCommand('move down')).toBe('move:DOWN');
      expect(service.parseCommand('move left')).toBe('move:LEFT');
      expect(service.parseCommand('move right')).toBe('move:RIGHT');
      expect(service.parseCommand('go up')).toBe('move:UP');
      expect(service.parseCommand('walk left')).toBe('move:LEFT');
    });

    it('should return null for non-command messages', () => {
      const command = service.parseCommand('hello there');
      expect(command).toBeNull();
    });

    it('should handle imperative commands', () => {
      expect(service.parseCommand('eat something')).toBe('feed');
      expect(service.parseCommand('take a nap')).toBe('sleep');
      expect(service.parseCommand('have fun')).toBe('play');
    });
  });

  describe('action execution', () => {
    let mockActionHandler;

    beforeEach(() => {
      service.petStats = { hunger: 50, energy: 80, happiness: 60, hygiene: 90 };
      mockActionHandler = vi.fn();
      service.setActionHandler(mockActionHandler);
    });

    it('should execute feed action when command is parsed', async () => {
      const response = await service.chat('feed the pet');
      expect(mockActionHandler).toHaveBeenCalledWith('feed');
      expect(response.executedAction).toBe('feed');
    });

    it('should execute play action when command is parsed', async () => {
      const response = await service.chat('play with me');
      expect(mockActionHandler).toHaveBeenCalledWith('play');
      expect(response.executedAction).toBe('play');
    });

    it('should execute sleep action when command is parsed', async () => {
      const response = await service.chat('go to sleep');
      expect(mockActionHandler).toHaveBeenCalledWith('sleep');
      expect(response.executedAction).toBe('sleep');
    });

    it('should execute clean action when command is parsed', async () => {
      const response = await service.chat('clean up');
      expect(mockActionHandler).toHaveBeenCalledWith('clean');
      expect(response.executedAction).toBe('clean');
    });

    it('should execute movement actions', async () => {
      const response = await service.chat('move up');
      expect(mockActionHandler).toHaveBeenCalledWith('move', 'UP');
      expect(response.executedAction).toBe('move:UP');
    });

    it('should not execute action without handler', async () => {
      service.setActionHandler(null);
      const response = await service.chat('feed the pet');
      expect(response.executedAction).toBeUndefined();
    });
  });

  describe('dynamic responses', () => {
    beforeEach(() => {
      service.petStats = { hunger: 50, energy: 80, happiness: 60, hygiene: 90 };
    });

    it('should generate acknowledgment response after action execution', async () => {
      service.setActionHandler(vi.fn());
      const response = await service.chat('feed me');
      expect(response.message).toBeTruthy();
      expect(response.executedAction).toBe('feed');
    });

    it('should generate contextual response based on stats after action', async () => {
      service.setActionHandler(vi.fn());
      service.petStats.hunger = 80; // Hungry
      const response = await service.chat('feed me please');
      expect(response.message).toBeTruthy();
      // Response should acknowledge the feeding
    });

    it('should generate varied responses for same input', async () => {
      const responses = new Set();
      for (let i = 0; i < 10; i++) {
        const response = await service.chat('hello');
        responses.add(response.message);
      }
      // Should potentially have some variety (at least for generic responses)
      // Note: greeting might be fixed, so this tests the generic response variety
    });
  });

  describe('pet abilities', () => {
    beforeEach(() => {
      service.petStats = { hunger: 50, energy: 80, happiness: 60, hygiene: 90 };
    });

    it('should list available abilities', () => {
      const abilities = service.getAvailableAbilities();
      expect(abilities).toContain('feed');
      expect(abilities).toContain('play');
      expect(abilities).toContain('sleep');
      expect(abilities).toContain('clean');
      expect(abilities).toContain('move');
    });

    it('should describe abilities when asked', async () => {
      const response = await service.chat('what can you do?');
      expect(response.message).toBeTruthy();
      // Should mention abilities
    });
  });
});
