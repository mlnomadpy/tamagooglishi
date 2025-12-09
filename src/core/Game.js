import { Physics } from './Physics.js';
import { Pet } from '../entities/Pet.js';
import Matter from 'matter-js';

export class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        // Handle case where canvas might not be in DOM (e.g. tests)
        if (!this.canvas) {
            console.warn("Canvas not found -- running in headless mode?");
            // Create a dummy canvas for Physics if needed, or Physics handles it
            this.canvas = document.createElement('canvas');
        }

        this.ctx = this.canvas.getContext('2d');

        this.resize();
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', () => this.resize());
        }

        this.physics = new Physics(this.canvas);

        // Load assets
        const spriteImage = new Image();
        spriteImage.src = '/src/assets/sprites.png';

        // Create a test entity (The Pet)
        const startX = typeof window !== 'undefined' ? window.innerWidth / 2 : 400;
        const startY = typeof window !== 'undefined' ? window.innerHeight / 2 : 300;

        this.pet = new Pet(startX, startY, this.physics.world, spriteImage);

        // Drag & Drop Events
        Matter.Events.on(this.physics.mouseConstraint, 'startdrag', (event) => {
            if (event.body === this.pet.body) {
                this.pet.startDrag();
            }
        });

        Matter.Events.on(this.physics.mouseConstraint, 'enddrag', (event) => {
            if (event.body === this.pet.body) {
                this.pet.endDrag();
            }
        });

        this.lastTime = 0;
        this.loop = this.loop.bind(this);

        if (typeof requestAnimationFrame !== 'undefined') {
            requestAnimationFrame(this.loop);
        }
    }

    resize() {
        if (typeof window !== 'undefined') {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }
    }

    loop(timestamp) {
        const delta = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(delta);
        this.draw();

        requestAnimationFrame(this.loop);
    }

    update(delta) {
        this.physics.update(delta);
        if (this.pet) {
            this.pet.update(delta);
        }
    }

    draw() {
        if (!this.ctx) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Render pet
        this.pet.draw(this.ctx);
    }
}
