export class Sprite {
    constructor(config) {
        this.image = config.image;
        this.frameWidth = config.frameWidth || 32;
        this.frameHeight = config.frameHeight || 32;
        this.rows = config.rows || {};
        this.frameSpeed = config.frameSpeed || 200;

        // Default to first key in rows or 'IDLE'
        this.currentAnimation = Object.keys(this.rows)[0] || 'IDLE';
        this.frameIndex = 0;
        this.timer = 0;
    }

    setAnimation(name) {
        if (this.currentAnimation === name) return;
        if (!this.rows[name]) return;

        this.currentAnimation = name;
        this.frameIndex = 0;
        this.timer = 0;
    }

    update(delta) {
        this.timer += delta;
        if (this.timer >= this.frameSpeed) {
            this.timer -= this.frameSpeed;
            const currentRow = this.rows[this.currentAnimation];
            if (currentRow) {
                this.frameIndex = (this.frameIndex + 1) % currentRow.frames;
            }
        }
    }

    draw(ctx, x, y, width, height) {
        if (!this.image) return;

        const currentRow = this.rows[this.currentAnimation];
        if (!currentRow) return;

        const srcX = this.frameIndex * this.frameWidth;
        const srcY = currentRow.row * this.frameHeight;

        ctx.drawImage(
            this.image,
            srcX, srcY, this.frameWidth, this.frameHeight,
            x - width / 2, y - height / 2, width, height
        );
    }

    drawFrame(ctx, x, y, width, height, row, col) {
        if (!this.image) return;

        const srcX = col * this.frameWidth;
        const srcY = row * this.frameHeight;

        ctx.drawImage(
            this.image,
            srcX, srcY, this.frameWidth, this.frameHeight,
            x - width / 2, y - height / 2, width, height
        );
    }
}
