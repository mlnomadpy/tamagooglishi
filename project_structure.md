# Project Structure

```
tamagooglishi/
├── public/              # Static assets (images, sounds)
│   └── assets/
├── src/
│   ├── core/            # Core Engine Logic
│   │   ├── Game.js      # Main Controller, Loop, Canvas management
│   │   ├── Physics.js   # Matter.js Wrapper & World Config
│   │   └── State.js     # Global Game State (Save/Load)
│   ├── entities/        # Game Objects
│   │   ├── Entity.js    # Base Class (Matter Body + optional Sprite)
│   │   └── Pet.js       # The Tamagotchi Logic (Stats, AI)
│   ├── render/          # Rendering System
│   │   ├── Renderer.js  # Custom Canvas Renderer
│   │   └── Animator.js  # Sprite Sheet Animator
│   ├── ui/              # HTML/CSS UI
│   │   └── UI.js        # DOM Manipulation
│   ├── utils/           # Helpers
│   ├── main.js          # Entry Point
│   └── style.css        # Global CSS
├── index.html           # HTML Entry
├── package.json         # Dependencies & Scripts
├── vite.config.js       # Build Configuration
└── README.md            # Quick Start
```
