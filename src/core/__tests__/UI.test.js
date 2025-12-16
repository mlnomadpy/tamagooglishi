import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UI } from '../UI.js';

describe('UI System', () => {
    let mockDocument;
    let mockGame;
    let mockPet;
    let mockUILayer;
    let gameOverDiv;

    beforeEach(() => {
        // Reset the game over div tracker
        gameOverDiv = null;
        
        // Create mock DOM elements
        mockUILayer = {
            appendChild: vi.fn((child) => {
                gameOverDiv = child;
            })
        };

        mockDocument = {
            getElementById: vi.fn((id) => {
                if (id === 'ui-layer') return mockUILayer;
                if (id === 'game-over') return gameOverDiv;
                // Return null for stat elements to avoid errors
                return null;
            }),
            createElement: vi.fn(() => {
                const elem = {
                    id: '',
                    style: {},
                    innerText: '',
                    appendChild: vi.fn(),
                    onclick: null
                };
                return elem;
            })
        };

        // Replace global document
        global.document = mockDocument;

        mockPet = {
            stats: {
                hunger: 0,
                energy: 100,
                happiness: 100,
                hygiene: 100
            },
            state: 'IDLE',
            age: 0,
            getStage: vi.fn(() => 'BABY'),
            feed: vi.fn(),
            sleep: vi.fn(),
            play: vi.fn()
        };

        mockGame = {
            pet: mockPet,
            cleanPoops: vi.fn()
        };
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should not show Game Over at the beginning of the game with fresh pet', () => {
        // Create UI - this is the beginning of the game with a fresh pet
        const ui = new UI(mockGame);
        
        // Pet is in IDLE state at beginning
        expect(mockPet.state).toBe('IDLE');
        
        // First update cycle - should NOT show game over
        ui.update();
        
        // Game over should not be shown at the very beginning with a fresh pet
        expect(gameOverDiv).toBeNull();
    });

    it('should not show Game Over when pet starts with DEAD state', () => {
        // Simulate loading a saved game where pet was dead
        mockPet.state = 'DEAD';
        
        // Create UI - this is the beginning after loading
        const ui = new UI(mockGame);
        
        // First update should NOT trigger game over display
        ui.update();
        
        expect(gameOverDiv).toBeNull();
    });

    it('should show Game Over after pet dies during gameplay', () => {
        const ui = new UI(mockGame);
        
        // Simulate normal gameplay - pet is alive
        mockPet.state = 'IDLE';
        ui.update();
        expect(gameOverDiv).toBeNull();
        
        // Pet dies during gameplay (not at start)
        mockPet.state = 'DEAD';
        
        // Now update should show game over
        ui.update();
        
        expect(gameOverDiv).not.toBeNull();
        expect(gameOverDiv.innerText).toBe('GAME OVER');
    });
});
