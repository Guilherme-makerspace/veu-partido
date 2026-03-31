import { useEffect, useRef } from 'react';
import { createGame } from './game/main.js';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;
    gameRef.current = createGame('phaser-game');
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: '#0d0c10',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        margin: 0,
        padding: 0,
      }}
    >
      <div
        id="phaser-game"
        ref={containerRef}
        style={{ width: '100%', height: '100%', maxWidth: '1280px', maxHeight: '720px' }}
      />
    </div>
  );
}
