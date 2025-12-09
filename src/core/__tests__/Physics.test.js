import { describe, it, expect, vi } from 'vitest';
import { Physics } from '../Physics.js';
import Matter from 'matter-js';

// Mock Matter.js to avoid canvas/browser dependencies in unit tests if possible, 
// but Matter.js core can run in Node. We just need to mock the Canvas for Mouse.create
vi.mock('matter-js', async () => {
    const actual = await vi.importActual('matter-js');
    return {
        ...actual,
        Engine: {
            ...actual.Engine,
            create: vi.fn(() => ({
                world: { gravity: { x: 0, y: 1 } },
                // Add other engine properties as needed
            })),
            update: vi.fn(),
        },
        Mouse: {
            create: vi.fn(() => ({})),
        },
        MouseConstraint: {
            create: vi.fn(() => ({})),
        }
    };
});

describe('Physics System', () => {
    it('should initialize Matter.js Engine', () => {
        const mockCanvas = {};
        const physics = new Physics(mockCanvas);
        expect(Matter.Engine.create).toHaveBeenCalled();
        expect(physics.engine).toBeDefined();
        expect(physics.world).toBeDefined();
    });

    it('should create boundaries/walls', () => {
        // We might need to inspect the world composite to see if bodies were added
        // For now, let's just ensure no errors on init
        const mockCanvas = { width: 800, height: 600 };
        // Mock window innerWidth/Height since they are used in constructor
        global.window = { innerWidth: 800, innerHeight: 600 };

        const physics = new Physics(mockCanvas);
        expect(physics.world).toBeDefined();
    });
});
