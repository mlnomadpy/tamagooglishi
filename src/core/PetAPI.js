export class PetAPI {
    constructor(game) {
        this.game = game;
        this.pet = game.pet;
    }

    getState() {
        return {
            stats: this.pet.stats,
            state: this.pet.state,
            age: this.pet.age,
            stage: this.pet.getStage(),
            poops: this.game.poops.length,
            position: this.pet.body.position
        };
    }

    feed() {
        this.pet.feed();
        return "FED";
    }

    sleep() {
        this.pet.sleep();
        return "SLEEPING";
    }

    play() {
        this.pet.play();
        return "PLAYING";
    }

    clean() {
        this.game.cleanPoops();
        return "CLEANED";
    }

    // Move command for detailed control (WASD)
    move(direction) {
        if (this.pet.state === 'DEAD' || this.pet.state === 'SLEEPING') return "CANNOT_MOVE";

        const force = 0.005; // Adjust as needed
        const body = this.pet.body;

        switch (direction.toUpperCase()) {
            case 'UP':
            case 'W':
                this.pet.applyForce({ x: 0, y: -force });
                break;
            case 'DOWN':
            case 'S':
                this.pet.applyForce({ x: 0, y: force });
                break;
            case 'LEFT':
            case 'A':
                this.pet.applyForce({ x: -force, y: 0 });
                break;
            case 'RIGHT':
            case 'D':
                this.pet.applyForce({ x: force, y: 0 });
                break;
            default:
                return "INVALID_DIRECTION";
        }
        return `MOVED_${direction}`;
    }
}
