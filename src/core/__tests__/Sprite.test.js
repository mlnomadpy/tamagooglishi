import { describe, it, expect, vi } from 'vitest';
import { Sprite } from '../Sprite.js';

describe('Sprite System', () => {
    it('should initialize with config', () => {
        const mockImage = {};
        const config = {
            image: mockImage,
            frameWidth: 32,
            frameHeight: 32,
            rows: {
                'IDLE': { row: 0, frames: 4 },
                'EATING': { row: 1, frames: 4 }
            }
        };

        const sprite = new Sprite(config);
        expect(sprite.currentAnimation).toBe('IDLE'); // Default to first?
        expect(sprite.frameIndex).toBe(0);
    });

    it('should update animation frames', () => {
        const mockImage = {};
        const config = {
            image: mockImage,
            frameWidth: 32,
            frameHeight: 32,
            rows: { 'IDLE': { row: 0, frames: 2 } },
            frameSpeed: 100 // ms per frame
        };

        const sprite = new Sprite(config);

        // 0ms - Frame 0
        sprite.update(50);
        expect(sprite.frameIndex).toBe(0);

        // 100ms total - Frame 1
        sprite.update(51);
        expect(sprite.frameIndex).toBe(1);

        // 200ms total - Loop back to Frame 0
        sprite.update(100);
        expect(sprite.frameIndex).toBe(0);
    });

    it('should change animation state', () => {
        const mockImage = {};
        const config = {
            image: mockImage,
            frameWidth: 32,
            frameHeight: 32,
            rows: {
                'IDLE': { row: 0, frames: 4 },
                'EATING': { row: 1, frames: 4 }
            }
        };

        const sprite = new Sprite(config);
        sprite.setAnimation('EATING');
        expect(sprite.currentAnimation).toBe('EATING');
        expect(sprite.frameIndex).toBe(0); // Should reset frame
    });
});
