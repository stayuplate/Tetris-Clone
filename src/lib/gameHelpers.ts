import { TetrominoType } from './tetrominoes';

export const STAGE_WIDTH = 10;
export const STAGE_HEIGHT = 20;

export type Cell = 0 | TetrominoType | 'GHOST';
export type Stage = Cell[][];

export const createStage = (): Stage =>
  Array.from(Array(STAGE_HEIGHT), () => Array(STAGE_WIDTH).fill(0));

export const checkCollision = (
  piece: Cell[][],
  pos: { x: number, y: number },
  stage: Stage,
  moveX: number,
  moveY: number
) => {
  for (let y = 0; y < piece.length; y++) {
    for (let x = 0; x < piece[y].length; x++) {
      if (piece[y][x] !== 0) {
        const targetY = y + pos.y + moveY;
        const targetX = x + pos.x + moveX;

        // Check bounds
        if (targetY >= STAGE_HEIGHT || targetX < 0 || targetX >= STAGE_WIDTH) {
          return true;
        }
        // Check collision with placed pieces
        if (targetY >= 0 && stage[targetY][targetX] !== 0) {
          return true;
        }
      }
    }
  }
  return false;
};
