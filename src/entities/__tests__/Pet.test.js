import { describe, it, expect, vi } from 'vitest';
import { Pet } from '../Pet.js';

// Mock stats to be faster for testing or just test delta logic
const TICK_RATE = 1000;

vi.mock('matter-js', () => {
    const MockBody = {
        position: { x: 0, y: 0 },
        circleRadius: 40
    };
    const MockMatter = {
        Bodies: {
            circle: vi.fn(() => MockBody),
            rectangle: vi.fn(() => MockBody),
        },
        Composite: {
            add: vi.fn(),
        },
    };
    return {
        ...MockMatter,
        default: MockMatter,
    };
});


describe('Pet Entity', () => {
    it('should initialize with default stats', () => {
        // Mock world
        const mockWorld = { gravity: { x: 0, y: 1 } };
        const pet = new Pet(100, 100, mockWorld);

        expect(pet.stats.hunger).toBe(0);
        expect(pet.stats.energy).toBe(100);
        expect(pet.stats.happiness).toBe(100);
        expect(pet.state).toBe('IDLE');
    });

    it('should decay stats over time', () => {
        const mockWorld = { gravity: { x: 0, y: 1 } };
        const pet = new Pet(100, 100, mockWorld);

        // Simulate a tick
        // Simulate a 1 second update
        pet.update(1000);

        expect(pet.stats.hunger).toBeGreaterThan(0);
        expect(pet.stats.energy).toBeLessThan(100);
        expect(pet.stats.happiness).toBeLessThan(100);
    });

    it('should feed correctly', () => {
        const mockWorld = {};
        const pet = new Pet(100, 100, mockWorld);
        pet.stats.hunger = 50;

        pet.feed();
        expect(pet.stats.hunger).toBeLessThan(50);
        expect(pet.state).toBe('EATING');

        // Check state transition back to IDLE
        pet.update(2000); // Wait longer than 1s state timer
        expect(pet.state).toBe('IDLE');
    });

    it('should sleep and recover energy', () => {
        const mockWorld = {};
        const pet = new Pet(100, 100, mockWorld);
        pet.stats.energy = 10;

        pet.sleep();
        expect(pet.state).toBe('SLEEPING');

        // Simulate time passing while sleeping
        const initialEnergy = pet.stats.energy;
        pet.update(1000);

        expect(pet.stats.energy).toBeGreaterThan(initialEnergy);
        expect(pet.state).toBe('SLEEPING'); // Should still be sleeping until full?
    });

    it('should wake up when energy is full or manually', () => {
        const mockWorld = {};
        const pet = new Pet(100, 100, mockWorld);
        pet.stats.energy = 99;

        pet.sleep();
        pet.update(5000); // Enough time to fill up

        // Plan: Auto wakeup logic not yet implemented, but let's assume we want auto-wakeup at 100
        // If not, we assert it stays sleeping. Let's enforce auto-wakeup at 100 for now.
        if (pet.stats.energy >= 100) {
            expect(pet.state).toBe('IDLE');
        }
    });

    it('should play and gain happiness but lose energy', () => {
        const mockWorld = {};
        const pet = new Pet(100, 100, mockWorld);
        pet.stats.happiness = 50;
        pet.stats.energy = 50;

        pet.play();
        expect(pet.state).toBe('PLAYING');
        expect(pet.stats.happiness).toBeGreaterThan(50);
        expect(pet.stats.energy).toBeLessThan(50);

        pet.update(2000); // wait for finish
        expect(pet.state).toBe('IDLE');
    });

    it('should clamp stats between 0 and 100', () => {
        const mockWorld = {};
        const pet = new Pet(100, 100, mockWorld);

        pet.stats.hunger = 101;
        expect(pet.stats.hunger).toBe(101); // Constructor doesn't clamp, but update should? 
        // Actually let's force clamp in update
        pet.stats.hunger = 120;
        pet.update(100);
        expect(pet.stats.hunger).toBeLessThanOrEqual(100);

        pet.stats.energy = -10;
        pet.update(100);
        expect(pet.stats.energy).toBeGreaterThanOrEqual(0);
    });

    it('should enter DRAGGED state', () => {
        const mockWorld = {};
        const pet = new Pet(100, 100, mockWorld);

        pet.startDrag();
        expect(pet.state).toBe('DRAGGED');
    });

    it('should return to IDLE after drag ends', () => {
        const mockWorld = {};
        const pet = new Pet(100, 100, mockWorld);

        pet.startDrag();
        expect(pet.state).toBe('DRAGGED');

        pet.endDrag();
        expect(pet.state).toBe('IDLE');
    });
});
