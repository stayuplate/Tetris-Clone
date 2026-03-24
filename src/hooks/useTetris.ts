import { useState, useCallback } from 'react';
import { createStage, checkCollision, Stage, Cell, STAGE_WIDTH } from '../lib/gameHelpers';
import { randomTetromino, TETROMINOES } from '../lib/tetrominoes';
import { useInterval } from './useInterval';

export const useTetris = () => {
  const [stage, setStage] = useState<Stage>(createStage());
  const [dropTime, setDropTime] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState<boolean>(true);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const [player, setPlayer] = useState({
    pos: { x: 0, y: 0 },
    tetromino: TETROMINOES.I.shape as Cell[][],
    type: 'I' as Cell,
  });
  const [nextPiece, setNextPiece] = useState(() => randomTetromino());

  const updatePlayerPos = ({ x, y, collided }: { x: number, y: number, collided: boolean }) => {
    setPlayer(prev => ({
      ...prev,
      pos: { x: (prev.pos.x + x), y: (prev.pos.y + y) }
    }));
  };

  const resetPlayer = useCallback(() => {
    setPlayer({
      pos: { x: STAGE_WIDTH / 2 - 2, y: 0 },
      tetromino: nextPiece.shape as Cell[][],
      type: nextPiece.type as Cell,
    });
    setNextPiece(randomTetromino());
  }, [nextPiece]);

  const sweepRows = useCallback((newStage: Stage) => {
    let linesCleared = 0;
    const sweptStage = newStage.reduce((ack, row) => {
      if (row.findIndex(cell => cell === 0) === -1) {
        linesCleared += 1;
        ack.unshift(new Array(STAGE_WIDTH).fill(0));
        return ack;
      }
      ack.push(row);
      return ack;
    }, [] as Stage);

    if (linesCleared > 0) {
      setLines(prev => {
        const newLines = prev + linesCleared;
        setLevel(Math.floor(newLines / 10) + 1);
        return newLines;
      });
      setScore(prev => prev + [0, 100, 300, 500, 800][linesCleared] * level);
    }
    return sweptStage;
  }, [level]);

  const drop = () => {
    if (level > 0) {
      setDropTime(1000 / (level + 1) + 200);
    }

    if (!checkCollision(player.tetromino, player.pos, stage, 0, 1)) {
      updatePlayerPos({ x: 0, y: 1, collided: false });
    } else {
      if (player.pos.y < 1) {
        setGameOver(true);
        setDropTime(null);
      } else {
        const newStage = stage.map(row => [...row]);
        player.tetromino.forEach((row, y) => {
          row.forEach((value, x) => {
            if (value !== 0) {
              newStage[y + player.pos.y][x + player.pos.x] = value;
            }
          });
        });
        setStage(sweepRows(newStage));
        resetPlayer();
      }
    }
  };

  const dropPlayer = () => {
    setDropTime(null);
    drop();
  };

  const hardDrop = () => {
    let tmpY = 0;
    while (!checkCollision(player.tetromino, player.pos, stage, 0, tmpY + 1)) {
      tmpY += 1;
    }
    
    const newStage = stage.map(row => [...row]);
    player.tetromino.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          newStage[y + player.pos.y + tmpY][x + player.pos.x] = value;
        }
      });
    });
    setStage(sweepRows(newStage));
    resetPlayer();
    setDropTime(1000 / (level + 1) + 200);
  };

  const movePlayer = (dir: number) => {
    if (!checkCollision(player.tetromino, player.pos, stage, dir, 0)) {
      updatePlayerPos({ x: dir, y: 0, collided: false });
    }
  };

  const rotate = (matrix: Cell[][], dir: number) => {
    const rotatedTetro = matrix.map((_, index) =>
      matrix.map(col => col[index])
    );
    if (dir > 0) return rotatedTetro.map(row => row.reverse());
    return rotatedTetro.reverse();
  };

  const playerRotate = (dir: number) => {
    const clonedPlayer = JSON.parse(JSON.stringify(player));
    clonedPlayer.tetromino = rotate(clonedPlayer.tetromino, dir);

    const pos = clonedPlayer.pos.x;
    let offset = 1;
    while (checkCollision(clonedPlayer.tetromino, clonedPlayer.pos, stage, 0, 0)) {
      clonedPlayer.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > clonedPlayer.tetromino[0].length) {
        clonedPlayer.tetromino = rotate(clonedPlayer.tetromino, -dir);
        clonedPlayer.pos.x = pos;
        return;
      }
    }
    setPlayer(clonedPlayer);
  };

  const startGame = () => {
    setStage(createStage());
    setDropTime(1000);
    resetPlayer();
    setGameOver(false);
    setScore(0);
    setLines(0);
    setLevel(1);
    setIsPaused(false);
  };

  const togglePause = () => {
    if (gameOver) return;
    if (isPaused) {
      setIsPaused(false);
      setDropTime(1000 / (level + 1) + 200);
    } else {
      setIsPaused(true);
      setDropTime(null);
    }
  };

  useInterval(() => {
    drop();
  }, dropTime);

  return {
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
  };
};
