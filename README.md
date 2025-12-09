# Tamagooglishi 🥚

A modern, web-based virtual pet game built with **Vanilla JavaScript** and **Vite**. It features physics-based interactions using **Matter.js** and classic sprite-sheet animations.

## 🎮 Gameplay
Your goal is to keep your Tamagooglishi alive and happy!

- **Feed**: Click the food icon to drop food into the world.
- **Play**: Drag and drop your pet to play with it (Physics enabled!).
- **Clean**: Click to clean up after your pet.
- **Sleep**: Turn off the lights to let your pet rest.

## 🛠️ Tech Stack
- **Build Tool**: [Vite](https://vitejs.dev/) - Fast development and building.
- **Language**: JavaScript (ES Modules) - core logic.
- **Rendering**: HTML5 Canvas - optimized rendering.
- **Physics**: [Matter.js](https://brm.io/matter-js/) - 2D rigid body physics for the world and entities.
- **State Management**: Reactive state formatting (Finite State Machine).

## 📂 Project Structure
```
/src
  /core         # Game Loop, Physics Engine, State Management
  /entities     # Game objects (Pet, Food, Poop)
  /render       # Canvas Rendering & Spreadsheet Animation
  /ui           # DOM-based UI overlay
  /utils        # Helpers and Constants
  main.js       # Entry point
```

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Run Tests**
   ```bash
   npm run test
   ```

## 📝 Plan
We follow a TDD (Test Driven Development) approach.
1. Define Entity behaviors (Eat, Sleep, Play).
2. Implement Physics World constraints.
3. Hook up the Game Loop and Renderer.
