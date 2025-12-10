export class Input {
    constructor(game) {
        this.game = game;
        this.api = game.api;

        this.keys = {};

        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);

        if (typeof window !== 'undefined') {
            window.addEventListener('keydown', this.handleKeyDown);
            window.addEventListener('keyup', this.handleKeyUp);
        }
    }

    handleKeyDown(e) {
        this.keys[e.code] = true;
        this.processInput(e.code);
    }

    handleKeyUp(e) {
        this.keys[e.code] = false;
    }

    processInput(code) {
        // Direct Action Mapping?
        if (code === 'Space') {
            // Jump? Or just generic interact?
        }
    }

    update() {
        // Continuous movement check
        if (this.keys['ArrowUp'] || this.keys['KeyW']) this.api.move('UP');
        if (this.keys['ArrowDown'] || this.keys['KeyS']) this.api.move('DOWN');
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) this.api.move('LEFT');
        if (this.keys['ArrowRight'] || this.keys['KeyD']) this.api.move('RIGHT');
    }
}
