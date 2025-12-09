export class AudioSystem {
    constructor() {
        this.ctx = typeof window !== 'undefined' ? new (window.AudioContext || window.webkitAudioContext)() : null;
        this.sounds = {};
        this.muted = false;
        // Simple synth for placeholders if no file
    }

    play(name) {
        if (!this.ctx || this.muted) return;

        // Resume context if suspended (browser policy)
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        // Placeholder synth sounds
        const oscillator = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        if (name === 'FEED') {
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(300, this.ctx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.5, this.ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
            oscillator.start();
            oscillator.stop(this.ctx.currentTime + 0.1);
        } else if (name === 'PLAY') {
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(400, this.ctx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.5, this.ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
            oscillator.start();
            oscillator.stop(this.ctx.currentTime + 0.2);
        } else if (name === 'SLEEP') {
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(200, this.ctx.currentTime);
            oscillator.frequency.linearRampToValueAtTime(150, this.ctx.currentTime + 0.5);
            gainNode.gain.setValueAtTime(0.3, this.ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
            oscillator.start();
            oscillator.stop(this.ctx.currentTime + 0.5);
        }
    }
}
