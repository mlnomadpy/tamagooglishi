import { Entity } from './Entity.js';
import { Sprite } from '../core/Sprite.js';

export class Pet extends Entity {
    constructor(x, y, world, spriteImage) {
        super(x, y, 40, world); // Radius 40 for now

        // Sprite Init
        this.sprite = new Sprite({
            image: spriteImage,
            frameWidth: 256, // Assumed 1024x1024 / 4 = 256
            frameHeight: 256,
            frameSpeed: 200,
            rows: {
                'IDLE': { row: 0, frames: 4 },
                'EATING': { row: 1, frames: 4 },
                'SLEEPING': { row: 2, frames: 4 },
                'PLAYING': { row: 3, frames: 4 }
            }
        });

        this.stats = {
            hunger: 0,      // 0 = full, 100 = starving
            energy: 100,    // 100 = full, 0 = exhausted
            happiness: 100, // 100 = happy, 0 = depressed
            hygiene: 100    // 100 = clean, 0 = dirty
        };

        this.state = 'IDLE';
        this.age = 0;

        // Timer for states
        this.stateTimer = 0;
    }

    update(delta) {
        // Decay stats
        // delta is in ms. 
        // 1 sec = 1000ms.
        // Want hunger to go up by say 5 per sec => 5 * (delta/1000)
        const seconds = delta / 1000;

        this.stats.hunger = Math.min(100, Math.max(0, this.stats.hunger + (5 * seconds)));
        this.stats.energy = Math.min(100, Math.max(0, this.stats.energy - (2 * seconds)));
        this.stats.happiness = Math.min(100, Math.max(0, this.stats.happiness - (3 * seconds)));

        this.updateState(delta);

        // Sync Sprite
        if (this.sprite) {
            this.sprite.setAnimation(this.state);
            this.sprite.update(delta);
        }
    }

    updateState(delta) {
        const seconds = delta / 1000;

        if (this.stateTimer > 0) {
            this.stateTimer -= seconds;
        }

        if (this.state === 'EATING') {
            if (this.stateTimer <= 0) this.state = 'IDLE';
        } else if (this.state === 'PLAYING') {
            if (this.stateTimer <= 0) this.state = 'IDLE';
        } else if (this.state === 'SLEEPING') {
            // Recover energy faster than it decays
            this.stats.energy = Math.min(100, this.stats.energy + (10 * seconds));

            if (this.stats.energy >= 100) {
                this.state = 'IDLE';
            }
        } else if (this.state === 'DRAGGED') {
            // Pause decay/recovery while dragged?
            // For now, simple pause.
        }
    }

    feed() {
        this.stats.hunger = Math.max(0, this.stats.hunger - 20);
        this.state = 'EATING';
        this.stateTimer = 1.0; // 1 second
    }

    play() {
        this.stats.happiness = Math.min(100, this.stats.happiness + 20);
        this.stats.energy = Math.max(0, this.stats.energy - 10);
        this.state = 'PLAYING';
        this.stateTimer = 1.0;
    }

    sleep() {
        this.state = 'SLEEPING';
    }

    startDrag() {
        this.state = 'DRAGGED';
    }

    endDrag() {
        this.state = 'IDLE';
    }

    draw(ctx) {
        if (!this.body) return;
        const pos = this.body.position;

        // Debug circle (optional, maybe comment out or keep for collision debug)
        // super.draw(ctx); 

        if (this.sprite) {
            // Draw sprite scaled down
            // Frame is 256x256, draw at 128x128
            this.sprite.draw(ctx, pos.x, pos.y, 128, 128);
        }
    }
    serialize() {
        return {
            stats: { ...this.stats },
            state: this.state,
            age: this.age
        };
    }

    deserialize(data) {
        if (!data) return;
        if (data.stats) this.stats = { ...data.stats };
        if (data.state) this.state = data.state;
        if (data.age) this.age = data.age;
    }
}
