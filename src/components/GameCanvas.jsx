import { forwardRef } from 'react';

const GameCanvas = forwardRef(function GameCanvas(props, ref) {
  return (
    <canvas ref={ref} id="game-canvas" />
  );
});

export default GameCanvas;
