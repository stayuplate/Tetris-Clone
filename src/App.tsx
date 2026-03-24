import React, { useEffect, useRef } from 'react';
import { useTetris } from './hooks/useTetris';
import { TETROMINOES } from './lib/tetrominoes';
import { STAGE_WIDTH, STAGE_HEIGHT, checkCollision } from './lib/gameHelpers';
import { Play, Pause, RotateCcw, Trophy, Layers, Zap, ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';

export default function App() {
  const {
    stage,
    player,
    nextPiece,
    gameOver,
    score,
    level,
    lines,
    isPaused,
    startGame,
    movePlayer,
    dropPlayer,
    hardDrop,
    playerRotate,
    togglePause,
    setDropTime,
  } = useTetris();

  const gameAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gameAreaRef.current) {
      gameAreaRef.current.focus();
    }
  }, [gameOver, isPaused]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver || isPaused) return;
      
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case 'ArrowLeft':
          movePlayer(-1);
          break;
        case 'ArrowRight':
          movePlayer(1);
          break;
        case 'ArrowDown':
          dropPlayer();
          break;
        case 'ArrowUp':
        case 'x':
        case 'X':
          playerRotate(1);
          break;
        case 'z':
        case 'Z':
          playerRotate(-1);
          break;
        case ' ':
          hardDrop();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (gameOver || isPaused) return;
      if (e.key === 'ArrowDown') {
        setDropTime(1000 / (level + 1) + 200);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameOver, isPaused, movePlayer, dropPlayer, hardDrop, playerRotate, setDropTime, level]);

  const renderBoard = () => {
    const displayStage = stage.map(row => [...row]);
    
    let tmpY = 0;
    while (!checkCollision(player.tetromino, player.pos, stage, 0, tmpY + 1)) {
      tmpY += 1;
    }
    const ghostY = player.pos.y + tmpY;

    if (!gameOver && !isPaused) {
      player.tetromino.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            const targetY = y + ghostY;
            const targetX = x + player.pos.x;
            if (targetY >= 0 && targetY < STAGE_HEIGHT && targetX >= 0 && targetX < STAGE_WIDTH) {
              if (displayStage[targetY][targetX] === 0) {
                displayStage[targetY][targetX] = 'GHOST';
              }
            }
          }
        });
      });

      player.tetromino.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            const targetY = y + player.pos.y;
            const targetX = x + player.pos.x;
            if (targetY >= 0 && targetY < STAGE_HEIGHT && targetX >= 0 && targetX < STAGE_WIDTH) {
              displayStage[targetY][targetX] = value;
            }
          }
        });
      });
    }

    return displayStage;
  };

  const renderNextPiece = () => {
    const grid = Array.from({ length: 4 }, () => Array(4).fill(0));
    const offset = nextPiece.type === 'I' ? 0 : nextPiece.type === 'O' ? 1 : 0;
    
    nextPiece.shape.forEach((row, y) => {
      row.forEach((val, x) => {
        if (val !== 0) {
          if (grid[y + offset] && grid[y + offset][x + offset] !== undefined) {
            grid[y + offset][x + offset] = val;
          }
        }
      });
    });

    return (
      <div className="grid grid-cols-4 gap-[2px] w-20 h-20 sm:w-24 sm:h-24">
        {grid.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${y}-${x}`}
              className={`w-full h-full rounded-sm border ${
                cell === 0 
                  ? 'bg-transparent border-transparent' 
                  : TETROMINOES[cell as keyof typeof TETROMINOES].color
              }`}
            />
          ))
        )}
      </div>
    );
  };

  return (
    <div 
      className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-sans selection:bg-cyan-500/30 outline-none"
      tabIndex={0}
      ref={gameAreaRef}
    >
      <div className="max-w-4xl w-full p-4 sm:p-8 flex flex-col md:flex-row items-center md:items-start justify-center gap-8">
        
        {/* Left Panel - Stats */}
        <div className="flex flex-row md:flex-col gap-4 w-full md:w-48 order-2 md:order-1">
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 shadow-xl flex-1">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Trophy size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Score</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">{score}</div>
          </div>
          
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 shadow-xl flex-1">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Zap size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Level</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-purple-400 font-mono">{level}</div>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 shadow-xl flex-1">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Layers size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Lines</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-green-400 font-mono">{lines}</div>
          </div>
        </div>

        {/* Center Panel - Game Board */}
        <div className="relative order-1 md:order-2">
          <div className="bg-slate-900 p-2 sm:p-3 rounded-xl border-2 border-slate-800 shadow-2xl relative">
            <div className="grid grid-cols-10 gap-[1px] bg-slate-950 p-[2px] rounded border border-slate-800">
              {renderBoard().map((row, y) =>
                row.map((cell, x) => (
                  <div
                    key={`${y}-${x}`}
                    className={`w-6 h-6 sm:w-8 sm:h-8 rounded-[2px] border ${
                      cell === 0 
                        ? 'bg-slate-900/50 border-slate-800/50' 
                        : cell === 'GHOST'
                        ? 'bg-slate-700/20 border-slate-600/30'
                        : TETROMINOES[cell as keyof typeof TETROMINOES].color
                    }`}
                  />
                ))
              )}
            </div>

            {/* Overlays */}
            {gameOver && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl z-10">
                <h2 className="text-4xl font-black text-white mb-2 tracking-widest drop-shadow-lg">TETRIS</h2>
                {score > 0 && <p className="text-slate-300 mb-6 font-mono">Final Score: {score}</p>}
                <button 
                  onClick={startGame}
                  className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-6 py-3 rounded-full font-bold transition-all transform hover:scale-105 active:scale-95"
                >
                  <Play size={20} />
                  {score > 0 ? 'Play Again' : 'Start Game'}
                </button>
              </div>
            )}

            {isPaused && !gameOver && (
              <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl z-10">
                <h2 className="text-3xl font-black text-white mb-6 tracking-widest drop-shadow-lg">PAUSED</h2>
                <button 
                  onClick={togglePause}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-slate-950 px-6 py-3 rounded-full font-bold transition-all transform hover:scale-105 active:scale-95"
                >
                  <Play size={20} />
                  Resume
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Next Piece & Controls */}
        <div className="flex flex-col gap-6 w-full md:w-48 order-3">
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 shadow-xl flex flex-col items-center">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 w-full text-left">Next Piece</div>
            {renderNextPiece()}
          </div>

          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 shadow-xl">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex justify-between items-center">
              Controls
              {!gameOver && (
                <button onClick={togglePause} className="text-slate-400 hover:text-white transition-colors">
                  {isPaused ? <Play size={16} /> : <Pause size={16} />}
                </button>
              )}
            </div>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-center justify-between">
                <span className="flex gap-1">
                  <kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700"><ArrowLeft size={14} /></kbd>
                  <kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700"><ArrowRight size={14} /></kbd>
                </span>
                <span>Move</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex gap-1">
                  <kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700"><ArrowUp size={14} /></kbd>
                </span>
                <span>Rotate</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex gap-1">
                  <kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700"><ArrowDown size={14} /></kbd>
                </span>
                <span>Soft Drop</span>
              </div>
              <div className="flex items-center justify-between">
                <kbd className="bg-slate-800 px-3 py-0.5 rounded border border-slate-700 text-xs">Space</kbd>
                <span>Hard Drop</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
