import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { ArenaScene } from '../game/scenes/ArenaScene';

interface GameCanvasProps {
  onMove: (dx: number, dy: number) => void;
  sceneRef: React.MutableRefObject<ArenaScene | null>;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ onMove, sceneRef }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameInstance = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: containerRef.current,
      backgroundColor: '#0f172a',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0, x: 0 },
          debug: false,
        },
      },
      scene: [ArenaScene],
    };

    gameInstance.current = new Phaser.Game(config);

    gameInstance.current.events.once('ready', () => {
      const scene = gameInstance.current?.scene.getScene('ArenaScene') as ArenaScene;
      if (scene) {
        scene.init({ onMove });
        sceneRef.current = scene;
      }
    });

    return () => {
      if (gameInstance.current) {
        gameInstance.current.destroy(true);
        gameInstance.current = null;
        sceneRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div
        ref={containerRef}
        className="rounded-2xl overflow-hidden shadow-2xl border border-slate-800 glow-cyan"
      />
      <p className="text-xs text-slate-400 font-mono">
        Use WASD or ARROW KEYS to move your sphere and collect power orbs!
      </p>
    </div>
  );
};
