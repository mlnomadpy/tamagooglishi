import Matter from 'matter-js';

export class Physics {
    constructor(canvas) {
        this.engine = Matter.Engine.create();
        this.world = this.engine.world;

        // Add mouse control
        this.mouse = Matter.Mouse.create(canvas);
        this.mouseConstraint = Matter.MouseConstraint.create(this.engine, {
            mouse: this.mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false
                }
            }
        });

        // Basic walls
        // Tamagotchi Screen Dimensions (Centered)
        const screenWidth = (typeof window !== 'undefined') ? window.innerWidth : 800;
        const screenHeight = (typeof window !== 'undefined') ? window.innerHeight : 600;

        const gameWidth = 400;
        const gameHeight = 500;
        const cx = screenWidth / 2;
        const cy = screenHeight / 2;

        const wallThickness = 100;
        const wallOptions = { isStatic: true, render: { fillStyle: '#333' } };

        this.walls = {
            top: Matter.Bodies.rectangle(cx, cy - gameHeight / 2 - wallThickness / 2, gameWidth + wallThickness * 2, wallThickness, wallOptions),
            bottom: Matter.Bodies.rectangle(cx, cy + gameHeight / 2 + wallThickness / 2, gameWidth + wallThickness * 2, wallThickness, wallOptions),
            left: Matter.Bodies.rectangle(cx - gameWidth / 2 - wallThickness / 2, cy, wallThickness, gameHeight + wallThickness * 2, wallOptions),
            right: Matter.Bodies.rectangle(cx + gameWidth / 2 + wallThickness / 2, cy, wallThickness, gameHeight + wallThickness * 2, wallOptions)
        };

        Matter.Composite.add(this.world, [
            this.walls.top,
            this.walls.bottom,
            this.walls.left,
            this.walls.right,
            this.mouseConstraint
        ]);
    }

    update(delta) {
        Matter.Engine.update(this.engine, delta);
    }

    resize(screenWidth, screenHeight) {
        const gameWidth = 400;
        const gameHeight = 500;
        const cx = screenWidth / 2;
        const cy = screenHeight / 2;
        const wallThickness = 100;

        Matter.Body.setPosition(this.walls.top, { x: cx, y: cy - gameHeight / 2 - wallThickness / 2 });
        Matter.Body.setPosition(this.walls.bottom, { x: cx, y: cy + gameHeight / 2 + wallThickness / 2 });
        Matter.Body.setPosition(this.walls.left, { x: cx - gameWidth / 2 - wallThickness / 2, y: cy });
        Matter.Body.setPosition(this.walls.right, { x: cx + gameWidth / 2 + wallThickness / 2, y: cy });
    }
}
