import { Entity } from './Entity.js';

export class Poop extends Entity {
    constructor(x, y, world) {
        super(x, y, 15, world); // Smaller radius
        this.body.label = 'POOP';
        this.body.friction = 0.5;
        this.body.restitution = 0.2;
    }

    draw(ctx) {
        const pos = this.body.position;
        ctx.fillStyle = '#8B4513'; // SaddleBrown
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 15, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();

        // rudimentary shine?
        ctx.fillStyle = '#A0522D';
        ctx.beginPath();
        ctx.arc(pos.x - 5, pos.y - 5, 5, 0, 2 * Math.PI);
        ctx.fill();
    }
}
