export class UI {
    constructor(game) {
        this.game = game;
        this.pet = game.pet;

        // Cache DOM elements
        this.elHunger = document.getElementById('stat-hunger');
        this.elEnergy = document.getElementById('stat-energy');
        this.elHappiness = document.getElementById('stat-happiness');
        this.elHygiene = document.getElementById('stat-hygiene');

        this.btnFeed = document.getElementById('btn-feed');
        this.btnSleep = document.getElementById('btn-sleep');
        this.btnPlay = document.getElementById('btn-play');
        this.btnClean = document.getElementById('btn-clean');

        // Bind events
        const bindAction = (btn, action) => {
            if (!btn) return;
            btn.onclick = () => action();
            btn.ontouchstart = (e) => {
                e.preventDefault(); // Prevent ghost clicks
                action();
            };
        };

        bindAction(this.btnFeed, () => this.pet.feed());
        bindAction(this.btnSleep, () => this.pet.sleep());
        bindAction(this.btnPlay, () => this.pet.play());
        bindAction(this.btnClean, () => this.game.cleanPoops());
    }

    update() {
        if (!this.pet) return;
        const stats = this.pet.stats;

        // Update text
        if (this.elHunger) this.elHunger.innerText = Math.floor(stats.hunger);
        if (this.elEnergy) this.elEnergy.innerText = Math.floor(stats.energy);
        if (this.elHappiness) this.elHappiness.innerText = Math.floor(stats.happiness);
        if (this.elHygiene) this.elHygiene.innerText = Math.floor(stats.hygiene);

        if (this.pet.state === 'DEAD') {
            this.showGameOver();
        }
    }

    showGameOver() {
        // Simple overlay check
        if (!document.getElementById('game-over')) {
            const div = document.createElement('div');
            div.id = 'game-over';
            div.style.position = 'absolute';
            div.style.top = '50%';
            div.style.left = '50%';
            div.style.transform = 'translate(-50%, -50%)';
            div.style.backgroundColor = 'rgba(0,0,0,0.8)';
            div.style.color = 'red';
            div.style.padding = '20px';
            div.style.fontSize = '32px';
            div.style.fontFamily = '"Press Start 2P", monospace';
            div.innerText = 'GAME OVER';

            // Restart button?
            const btn = document.createElement('button');
            btn.innerText = 'RESTART';
            btn.style.display = 'block';
            btn.style.marginTop = '20px';
            btn.style.fontSize = '16px';
            btn.onclick = () => {
                localStorage.removeItem('tamagooglishi_save');
                location.reload();
            };
            div.appendChild(btn);

            document.getElementById('ui-layer').appendChild(div);
        }
    }
}
