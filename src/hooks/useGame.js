import { useState, useEffect, useRef, useCallback } from 'react';
import { Game } from '../core/Game.js';

export function useGame(canvasRef) {
  const [stats, setStats] = useState({
    hunger: 0,
    energy: 100,
    happiness: 100,
    hygiene: 100
  });
  const [stage, setStage] = useState('BABY');
  const [age, setAge] = useState(0);
  const [isDead, setIsDead] = useState(false);
  const [wasAlive, setWasAlive] = useState(true);
  const gameRef = useRef(null);

  // Initialize game when canvas is ready
  useEffect(() => {
    if (!canvasRef.current) return;

    // Set the canvas element in the DOM with the expected ID
    canvasRef.current.id = 'game-canvas';
    
    // Create game instance
    const game = new Game();
    gameRef.current = game;

    // Update UI at a reasonable interval
    const updateInterval = setInterval(() => {
      if (game.pet) {
        const pet = game.pet;
        setStats({
          hunger: Math.floor(pet.stats.hunger),
          energy: Math.floor(pet.stats.energy),
          happiness: Math.floor(pet.stats.happiness),
          hygiene: Math.floor(pet.stats.hygiene)
        });
        setStage(pet.getStage());
        setAge(Math.floor(pet.age / 60));
        
        const currentlyDead = pet.state === 'DEAD';
        if (!currentlyDead) {
          setWasAlive(true);
        }
        setIsDead(currentlyDead);
      }
    }, 100);

    return () => {
      clearInterval(updateInterval);
    };
  }, [canvasRef]);

  const feed = useCallback(() => {
    if (gameRef.current?.pet) {
      gameRef.current.pet.feed();
    }
  }, []);

  const sleep = useCallback(() => {
    if (gameRef.current?.pet) {
      gameRef.current.pet.sleep();
    }
  }, []);

  const play = useCallback(() => {
    if (gameRef.current?.pet) {
      gameRef.current.pet.play();
    }
  }, []);

  const clean = useCallback(() => {
    if (gameRef.current) {
      gameRef.current.cleanPoops();
    }
  }, []);

  const move = useCallback((direction) => {
    if (gameRef.current?.api) {
      gameRef.current.api.move(direction);
    }
  }, []);

  const restart = useCallback(() => {
    // Clear saved game data and reload the page
    // Note: A full page reload is used here to properly reinitialize the Game class,
    // which sets up Matter.js physics, event listeners, and animation loops.
    // A proper in-memory reset would require significant refactoring of the Game class.
    localStorage.removeItem('tamagooglishi_save');
    window.location.reload();
  }, []);

  return {
    stats,
    stage,
    age,
    isDead,
    wasAlive,
    actions: {
      feed,
      sleep,
      play,
      clean,
      move,
      restart
    }
  };
}
