import Matter from 'matter-js';

export class Entity {
    constructor(x, y, radius, world) {
        this.body = Matter.Bodies.circle(x, y, radius, {
            restitution: 0.5, // Bounciness
            friction: 0.8,
            frictionAir: 0.05
        });

        this.world = world;
        Matter.Composite.add(this.world, this.body);
    }

    draw(ctx) {
        if (!this.body) return;
        const pos = this.body.position;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, this.body.circleRadius, 0, 2 * Math.PI);
        ctx.fillStyle = '#ff0000';
        ctx.fill();
        ctx.closePath();
    }
}
