import { Entity } from './Entity.js';

export class Pet extends Entity {
    constructor(x, y, world) {
        super(x, y, 40, world); // Radius 40 for now

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

            // Auto wakeup if full
            if (this.stats.energy >= 100) {
                this.state = 'IDLE';
            }
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
}
