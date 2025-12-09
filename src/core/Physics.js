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
        // Use window dimensions if available, otherwise defaults (useful for testing)
        const width = (typeof window !== 'undefined') ? window.innerWidth : 800;
        const height = (typeof window !== 'undefined') ? window.innerHeight : 600;
        const wallThickness = 100;

        const ground = Matter.Bodies.rectangle(width / 2, height + wallThickness / 2 - 10, width, wallThickness, { isStatic: true });
        const leftWall = Matter.Bodies.rectangle(0 - wallThickness / 2, height / 2, wallThickness, height, { isStatic: true });
        const rightWall = Matter.Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height, { isStatic: true });
        const ceiling = Matter.Bodies.rectangle(width / 2, -wallThickness * 2, width, wallThickness, { isStatic: true });

        Matter.Composite.add(this.world, [ground, leftWall, rightWall, ceiling, this.mouseConstraint]);
    }

    update(delta) {
        Matter.Engine.update(this.engine, delta);
    }
}
