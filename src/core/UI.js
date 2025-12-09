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
        if (this.btnFeed) this.btnFeed.onclick = () => this.pet.feed();
        if (this.btnSleep) this.btnSleep.onclick = () => this.pet.sleep();
        if (this.btnPlay) this.btnPlay.onclick = () => this.pet.play();
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
