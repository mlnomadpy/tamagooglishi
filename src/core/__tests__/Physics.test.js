import { describe, it, expect, vi } from 'vitest';
import { Physics } from '../Physics.js';
import Matter from 'matter-js';

// Mock Matter.js to avoid canvas/browser dependencies in unit tests if possible, 
// but Matter.js core can run in Node. We just need to mock the Canvas for Mouse.create
vi.mock('matter-js', () => {
    // simplified mock without importActual to ensure full control over the default export
    const MockEngine = {
        create: vi.fn(() => ({
            world: {
                gravity: { x: 0, y: 1 },
                bodies: []
            }
        })),
        update: vi.fn(),
    };
    const MockMouse = {
        create: vi.fn(() => ({})),
    };
    const MockMouseConstraint = {
        create: vi.fn(() => ({})),
    };
    const MockBodies = {
        rectangle: vi.fn(() => ({ isStatic: false })),
        circle: vi.fn(() => ({ isStatic: false })),
    };
    const MockComposite = {
        add: vi.fn(),
    };

    return {
        Engine: MockEngine,
        Mouse: MockMouse,
        MouseConstraint: MockMouseConstraint,
        Bodies: MockBodies,
        Composite: MockComposite,
        default: {
            Engine: MockEngine,
            Mouse: MockMouse,
            MouseConstraint: MockMouseConstraint,
            Bodies: MockBodies,
            Composite: MockComposite,
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
