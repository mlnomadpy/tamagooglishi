import { describe, it, expect, vi } from 'vitest';
import { AnimationController } from '../AnimationController.js';

describe('AnimationController', () => {
    it('should initialize with default state', () => {
        const config = {
            states: {
                'IDLE': { row: 0, frames: 4, loop: true },
                'EAT': { row: 1, frames: 4, loop: false }
            },
            default: 'IDLE'
        };
        const controller = new AnimationController(config);
        expect(controller.currentState).toBe('IDLE');
        expect(controller.finished).toBe(false);
    });

    it('should transition to new state', () => {
        const config = {
            states: {
                'IDLE': { row: 0, frames: 4, loop: true },
                'EAT': { row: 1, frames: 4, loop: false }
            },
            default: 'IDLE'
        };
        const controller = new AnimationController(config);
        controller.transition('EAT');
        expect(controller.currentState).toBe('EAT');
        expect(controller.frameIndex).toBe(0);
        expect(controller.finished).toBe(false);
    });

    it('should handle looping animations', () => {
        const config = {
            states: { 'IDLE': { row: 0, frames: 2, loop: true, speed: 100 } }
        };
        const controller = new AnimationController(config);

        controller.update(50);
        expect(controller.frameIndex).toBe(0);

        controller.update(51); // Total 101ms
        expect(controller.frameIndex).toBe(1);

        controller.update(100); // Back to 0
        expect(controller.frameIndex).toBe(0);
        expect(controller.finished).toBe(false);
    });

    it('should handle non-looping animations', () => {
        const config = {
            states: { 'EAT': { row: 0, frames: 2, loop: false, speed: 100 } },
            default: 'EAT'
        };
        const controller = new AnimationController(config);

        controller.update(100); // Frame 1
        expect(controller.frameIndex).toBe(1);
        expect(controller.finished).toBe(false);

        controller.update(100); // Finished
        expect(controller.frameIndex).toBe(1); // Stay on last frame
        expect(controller.finished).toBe(true);
    });

    it('should trigger onComplete callback', () => {
        const onComplete = vi.fn();
        const config = {
            states: { 'EAT': { row: 0, frames: 2, loop: false, speed: 100 } },
            default: 'EAT',
            onComplete: onComplete
        };
        const controller = new AnimationController(config);

        controller.update(200); // Finish animation
        expect(onComplete).toHaveBeenCalledWith('EAT');
    });
});
