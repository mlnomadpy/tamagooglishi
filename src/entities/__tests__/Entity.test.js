import { describe, it, expect, vi } from 'vitest';
import { Entity } from '../Entity.js';
import Matter from 'matter-js';

// Mock Physics World
const mockWorld = {
    gravity: { x: 0, y: 1 },
    bodies: []
};

// Mock Matter Composite.add
vi.spyOn(Matter.Composite, 'add').mockImplementation(() => { });

describe('Entity Class', () => {
    it('should create a physical body', () => {
        const entity = new Entity(100, 100, 20, mockWorld);
        expect(entity.body).toBeDefined();
        // Check if it's a circle (Matter.Bodies.circle returns a body with label 'Circle Body' by default or we check properties)
        expect(entity.body.position.x).toBe(100);
        expect(entity.body.position.y).toBe(100);
    });

    it('should add itself to the world', () => {
        const entity = new Entity(100, 100, 20, mockWorld);
        expect(Matter.Composite.add).toHaveBeenCalledWith(mockWorld, entity.body);
    });
});
