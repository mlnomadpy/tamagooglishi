import { Physics } from "./Physics.js";
import { Pet } from "../entities/Pet.js";
import { Poop } from "../entities/Poop.js";
import { PetAPI } from "./PetAPI.js";
import { Input } from "./Input.js";
import Matter from "matter-js";

// Import sprite assets to ensure Vite processes them correctly
import babySpriteUrl from "../assets/sprites/baby.png";
import childSpriteUrl from "../assets/sprites/child.png";
import adultSpriteUrl from "../assets/sprites/adult.png";

export class Game {
  constructor(options = {}) {
    // When using React, UI is handled by React components
    const { useReactUI = true } = options;
    
    this.canvas = document.getElementById("game-canvas");
    // Handle case where canvas might not be in DOM (e.g. tests)
    if (!this.canvas) {
      console.warn("Canvas not found -- running in headless mode?");
      // Create a dummy canvas for Physics if needed, or Physics handles it
      this.canvas = document.createElement("canvas");
    }

    this.ctx = this.canvas.getContext("2d");

    this.resize();
    if (typeof window !== "undefined") {
      window.addEventListener("resize", () => this.resize());
    }

    this.physics = new Physics(this.canvas);
    this.poops = [];

    // Load assets
    const sprites = {
      baby: new Image(),
      child: new Image(),
      adult: new Image()
    };
    sprites.baby.src = babySpriteUrl;
    sprites.child.src = childSpriteUrl;
    sprites.adult.src = adultSpriteUrl;

    // Create a test entity (The Pet)
    const startX = typeof window !== "undefined" ? window.innerWidth / 2 : 400;
    const startY = typeof window !== "undefined" ? window.innerHeight / 2 : 300;

    this.pet = new Pet(startX, startY, this.physics.world, sprites, (x, y) => this.spawnPoop(x, y));

    // Only create legacy UI when not using React
    this.ui = null;
    if (!useReactUI) {
      // Dynamically import UI to avoid issues when React is used
      import("./UI.js").then(({ UI }) => {
        this.ui = new UI(this);
      });
    }
    
    this.api = new PetAPI(this);
    if (typeof window !== 'undefined') window.gameAPI = this.api;

    this.input = new Input(this);

    this.load(); // Load save data if available

    // Drag & Drop Events
    Matter.Events.on(this.physics.mouseConstraint, "startdrag", (event) => {
      if (event.body === this.pet.body) {
        this.pet.startDrag();
      }
    });

    Matter.Events.on(this.physics.mouseConstraint, "enddrag", (event) => {
      if (event.body === this.pet.body) {
        this.pet.endDrag();
      }
    });

    this.lastTime = 0;
    this.loop = this.loop.bind(this);

    if (typeof requestAnimationFrame !== "undefined") {
      requestAnimationFrame(this.loop);
    }
  }

  resize() {
    if (typeof window !== "undefined") {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;

      if (this.physics) {
        this.physics.resize(this.canvas.width, this.canvas.height);
      }
    }
  }

  loop(timestamp) {
    const delta = timestamp - this.lastTime;
    this.lastTime = timestamp;

    this.update(delta);
    this.draw();

    requestAnimationFrame(this.loop);
  }

  update(delta) {
    this.physics.update(delta);
    if (this.pet) {
      this.pet.update(delta);
    }
    if (this.ui) {
      this.ui.update();
    }
    if (this.input) {
      this.input.update();
    }

    // Auto-save every 5 seconds
    this.saveAccumulator = (this.saveAccumulator || 0) + delta;
    if (this.saveAccumulator > 5000) {
      this.save();
      this.saveAccumulator = 0;
      // console.log("Game Saved");
    }

    // Hygiene Decay due to poop
    if (this.poops.length > 0) {
      // Decay 5 per poop per second?
      const seconds = delta / 1000;
      this.pet.stats.hygiene = Math.max(0, this.pet.stats.hygiene - (2 * this.poops.length * seconds));
    }
  }

  draw() {
    if (!this.ctx) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw Game Background/Frame
    const gameWidth = 400;
    const gameHeight = 500;
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    this.ctx.fillStyle = "#fff";
    this.ctx.strokeStyle = "#333";
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.rect(
      cx - gameWidth / 2,
      cy - gameHeight / 2,
      gameWidth,
      gameHeight
    );
    this.ctx.fill();
    this.ctx.stroke();

    // Render poops
    this.poops.forEach(p => p.draw(this.ctx));

    // Render pet
    this.pet.draw(this.ctx);
  }
  save() {
    if (!this.pet) return;
    const data = this.pet.serialize();
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("tamagooglishi_save", JSON.stringify(data));
    }
  }

  spawnPoop(x, y) {
    const poop = new Poop(x, y, this.physics.world);
    this.poops.push(poop);
  }

  cleanPoops() {
    this.poops.forEach(p => {
      Matter.World.remove(this.physics.world, p.body);
    });
    this.poops = [];
    this.pet.stats.hygiene = 100; // Reset hygiene
  }

  load() {
    if (!this.pet) return;
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem("tamagooglishi_save");
      if (raw) {
        try {
          const data = JSON.parse(raw);
          this.pet.deserialize(data);
        } catch (e) {
          console.error("Failed to load save:", e);
        }
      }
    }
  }
}
