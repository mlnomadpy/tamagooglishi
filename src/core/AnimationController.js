export class AnimationController {
    constructor(config) {
        this.states = config.states || {};
        this.currentState = config.default || Object.keys(this.states)[0];
        this.onComplete = config.onComplete || null;

        this.frameIndex = 0;
        this.timer = 0;
        this.finished = false;
    }

    transition(newState) {
        if (this.currentState === newState) return;
        if (!this.states[newState]) return;

        this.currentState = newState;
        this.reset();
    }

    reset() {
        this.frameIndex = 0;
        this.timer = 0;
        this.finished = false;
    }

    update(delta) {
        const stateConfig = this.states[this.currentState];
        if (!stateConfig) return;

        if (this.finished && !stateConfig.loop) return;

        this.timer += delta;
        const speed = stateConfig.speed || 200;

        while (this.timer >= speed) {
            this.timer -= speed;

            // Advance frame
            if (this.frameIndex < stateConfig.frames - 1) {
                this.frameIndex++;
            } else {
                // Loop or Finish
                if (stateConfig.loop) {
                    this.frameIndex = 0;
                } else {
                    this.finished = true;
                    if (this.onComplete) {
                        this.onComplete(this.currentState);
                    }
                    return;
                }
            }
        }
    }

    // Helper for rendering
    getCurrentFrame() {
        const stateConfig = this.states[this.currentState];
        return {
            row: stateConfig ? stateConfig.row : 0,
            col: this.frameIndex
        };
    }
}
