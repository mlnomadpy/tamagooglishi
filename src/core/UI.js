export class UI {
    constructor(game) {
        this.game = game;
        this.pet = game.pet;

        // Cache DOM elements
        this.elHunger = document.getElementById('stat-hunger');
        this.elEnergy = document.getElementById('stat-energy');
        this.elHappiness = document.getElementById('stat-happiness');

        this.btnFeed = document.getElementById('btn-feed');
        this.btnSleep = document.getElementById('btn-sleep');
        this.btnPlay = document.getElementById('btn-play');

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
    }

    update() {
        if (!this.pet) return;
        const stats = this.pet.stats;

        // Update text
        if (this.elHunger) this.elHunger.innerText = Math.floor(stats.hunger);
        if (this.elEnergy) this.elEnergy.innerText = Math.floor(stats.energy);
        if (this.elHappiness) this.elHappiness.innerText = Math.floor(stats.happiness);
    }
}
