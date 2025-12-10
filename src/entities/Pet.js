import { Entity } from './Entity.js';
import { Sprite } from '../core/Sprite.js';
import { AnimationController } from '../core/AnimationController.js';
import { AudioSystem } from '../core/AudioSystem.js';

export class Pet extends Entity {
    constructor(x, y, world, sprites, onPoop) {
        super(x, y, 40, world); // Radius 40 for now

        this.onPoop = onPoop;
        this.audio = new AudioSystem();
        this.spritesAsset = sprites; // Store all assets

        // Sprite Init
        const frameSize = 1030 / 6;
        // Keep Sprite for drawing utility? Or just use it directly.
        // Let's keep Sprite but simplify it or just configure it dynamically.
        this.sprite = new Sprite({
            image: sprites.baby, // Start with baby
            frameWidth: frameSize,
            frameHeight: frameSize,
            rows: {} // We'll manually control frame index now
        });

        this.animator = new AnimationController({
            states: {
                'IDLE': { row: 0, frames: 6, loop: true },
                'EATING': { row: 1, frames: 6, loop: true }, // Loop eating while state active
                'SLEEPING': { row: 2, frames: 6, loop: true },
                'PLAYING': { row: 3, frames: 6, loop: true },
                'DRAGGED': { row: 3, frames: 6, loop: true },
                'DEAD': { row: 2, frames: 1, loop: true } // Reuse sleep row, static frame
            },
            default: 'IDLE'
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

        // Poop Timer (random start 10-30s)
        this.poopTimer = 10 + Math.random() * 20;
    }

    update(delta) {
        if (this.state === 'DEAD') {
            // No updates if dead
            if (this.animator && this.sprite) {
                this.animator.transition('DEAD');
                this.animator.update(delta);
            }
            return;
        }

        // Decay stats
        const seconds = delta / 1000;

        this.stats.hunger = Math.min(100, Math.max(0, this.stats.hunger + (5 * seconds)));
        this.stats.energy = Math.min(100, Math.max(0, this.stats.energy - (2 * seconds)));
        this.stats.happiness = Math.min(100, Math.max(0, this.stats.happiness - (3 * seconds)));

        // Check Death
        if (this.stats.hunger >= 100 || this.stats.energy <= 0 || this.stats.happiness <= 0) {
            this.die();
        }

        // Poop Logic
        if (this.state !== 'SLEEPING') {
            this.poopTimer -= seconds;
            if (this.poopTimer <= 0) {
                this.makePoop();
                this.poopTimer = 30 + Math.random() * 30; // Reset to 30-60s
            }
        }

        this.updateState(delta);

        // Autonomy (AI)
        if (this.state === 'IDLE') {
            const stage = this.getStage();
            if (stage !== 'BABY') {
                // Autonomy Timer? Or random chance per frame?
                // Timer is safer.
                if (Math.random() < 0.005) { // 0.5% chance per tick ~ once every 3-4 sec at 60fps? No, 1/200 ticks.
                    this.performAutonomousAction(stage);
                }
            }
        }

        // Sync Animator
        if (this.animator && this.sprite) {
            this.animator.transition(this.state);
            this.animator.update(delta);

            // Manual sprite override
            const frame = this.animator.getCurrentFrame();
            this.sprite.frameIndex = frame.col;
            this.sprite.currentAnimation = this.state;
        }
    }

    getStage() {
        if (this.age < 300) return 'BABY'; // 0-5 mins
        if (this.age < 900) return 'CHILD'; // 5-15 mins
        return 'ADULT'; // 15+ mins
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
        }
    }

    die() {
        if (this.state === 'DEAD') return;
        this.state = 'DEAD';
        if (this.audio) this.audio.play('DIE');
    }

    feed() {
        if (this.state === 'DEAD') return;
        this.stats.hunger = Math.max(0, this.stats.hunger - 20);
        this.state = 'EATING';
        this.stateTimer = 1.0;
        if (this.audio) this.audio.play('FEED');
    }

    play() {
        if (this.state === 'DEAD') return;
        this.stats.happiness = Math.min(100, this.stats.happiness + 20);
        this.stats.energy = Math.max(0, this.stats.energy - 10);
        this.state = 'PLAYING';
        this.stateTimer = 1.0;
        if (this.audio) this.audio.play('PLAY');
    }

    sleep() {
        if (this.state === 'DEAD') return;
        this.state = 'SLEEPING';
        if (this.audio) this.audio.play('SLEEP');
    }

    performAutonomousAction(stage) {
        const roll = Math.random();

        // Needs priority
        if (this.stats.energy < 30) {
            this.sleep();
            return;
        }

        if (this.stats.happiness < 40) {
            this.play();
            return;
        }

        // Random actions
        if (stage === 'CHILD') {
            if (roll < 0.3) this.play();
        } else if (stage === 'ADULT') {
            if (roll < 0.1) this.sleep(); // Naps
            else if (roll < 0.4) this.play();
        }
    }

    makePoop() {
        if (this.onPoop) {
            this.onPoop(this.body.position.x, this.body.position.y);
        }
    }

    startDrag() {
        if (this.state === 'DEAD') return;
        this.state = 'DRAGGED';
    }

    endDrag() {
        if (this.state === 'DEAD') return;
        this.state = 'IDLE';
    }

    draw(ctx) {
        if (!this.body) return;
        const pos = this.body.position;

        if (this.sprite && this.animator) {
            const frame = this.animator.getCurrentFrame();

            // Switch sprite sheet based on stage
            const stage = this.getStage();
            if (stage === 'BABY') this.sprite.image = this.spritesAsset.baby;
            else if (stage === 'CHILD') this.sprite.image = this.spritesAsset.child;
            else if (stage === 'ADULT') this.sprite.image = this.spritesAsset.adult;

            // Render
            // We can keep specific sizing if we want, or just default 128
            const size = 128;
            this.sprite.drawFrame(ctx, pos.x, pos.y, size, size, frame.row, frame.col);
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
