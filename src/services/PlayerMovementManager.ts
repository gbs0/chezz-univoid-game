import { Piece, PieceType } from './PieceManager';
import { Tile } from './BoardManager';

export interface Position {
  x: number;
  y: number;
}

export interface ValidMove {
  position: Position;
  distance: number;
  isCapture: boolean;
}

export class PlayerMovementManager {
  private readonly MAX_TOWER_DISTANCE = 3;
  private readonly MAX_PRIEST_DISTANCE = 1;

  private readonly DIRECTIONS = [
    { x: 1, y: 0 },   // direita
    { x: -1, y: 0 },  // esquerda
    { x: 0, y: 1 },   // baixo
    { x: 0, y: -1 },  // cima
    { x: 1, y: 1 },   // diagonal direita baixo
    { x: -1, y: 1 },  // diagonal esquerda baixo
    { x: 1, y: -1 },  // diagonal direita cima
    { x: -1, y: -1 }, // diagonal esquerda cima
  ];

  private readonly HORSE_MOVES = [
    { x: 2, y: 1 },   // direita 2, baixo 1
    { x: 2, y: -1 },  // direita 2, cima 1
    { x: -2, y: 1 },  // esquerda 2, baixo 1
    { x: -2, y: -1 }, // esquerda 2, cima 1
    { x: 1, y: 2 },   // direita 1, baixo 2
    { x: 1, y: -2 },  // direita 1, cima 2
    { x: -1, y: 2 },  // esquerda 1, baixo 2
    { x: -1, y: -2 }, // esquerda 1, cima 2
  ];

  constructor() {}

  public getValidMoves(
    board: Tile[][],
    currentPosition: Position,
    boardSize: number
  ): ValidMove[] {
    const piece = board[currentPosition.y][currentPosition.x].piece;
    if (!piece) return [];

    switch (piece.type) {
      case 'tower':
        return this.getTowerMoves(board, currentPosition, boardSize);
      case 'priest':
        return this.getPriestMoves(board, currentPosition, boardSize);
      case 'horse':
        return this.getHorseMoves(board, currentPosition, boardSize);
      default:
        return [];
    }
  }

  private getTowerMoves(
    board: Tile[][],
    currentPosition: Position,
    boardSize: number
  ): ValidMove[] {
    const validMoves: ValidMove[] = [];
    const currentPiece = board[currentPosition.y][currentPosition.x].piece;

    this.DIRECTIONS.forEach(direction => {
      for (let distance = 1; distance <= this.MAX_TOWER_DISTANCE; distance++) {
        const newX = currentPosition.x + (direction.x * distance);
        const newY = currentPosition.y + (direction.y * distance);

        if (this.isValidPosition(newX, newY, boardSize)) {
          const targetTile = board[newY][newX];
          const isPathClear = this.isPathClear(board, currentPosition, { x: newX, y: newY }, direction);
          
          if (isPathClear) {
            if (!targetTile.piece) {
              validMoves.push({ position: { x: newX, y: newY }, distance, isCapture: false });
            } else if (targetTile.piece.color !== currentPiece?.color) {
              validMoves.push({ position: { x: newX, y: newY }, distance, isCapture: true });
              break; // Para após encontrar uma peça para capturar
            } else {
              break; // Para ao encontrar peça da mesma cor
            }
          } else {
            break;
          }
        }
      }
    });

    return validMoves;
  }

  private getPriestMoves(
    board: Tile[][],
    currentPosition: Position,
    boardSize: number
  ): ValidMove[] {
    const validMoves: ValidMove[] = [];
    const currentPiece = board[currentPosition.y][currentPosition.x].piece;

    this.DIRECTIONS.forEach(direction => {
      const newX = currentPosition.x + direction.x;
      const newY = currentPosition.y + direction.y;

      if (this.isValidPosition(newX, newY, boardSize)) {
        const targetTile = board[newY][newX];
        if (!targetTile.piece) {
          validMoves.push({ position: { x: newX, y: newY }, distance: 1, isCapture: false });
        } else if (targetTile.piece.color !== currentPiece?.color) {
          validMoves.push({ position: { x: newX, y: newY }, distance: 1, isCapture: true });
        }
      }
    });

    return validMoves;
  }

  private getHorseMoves(
    board: Tile[][],
    currentPosition: Position,
    boardSize: number
  ): ValidMove[] {
    const validMoves: ValidMove[] = [];
    const currentPiece = board[currentPosition.y][currentPosition.x].piece;

    this.HORSE_MOVES.forEach(move => {
      const newX = currentPosition.x + move.x;
      const newY = currentPosition.y + move.y;

      if (this.isValidPosition(newX, newY, boardSize)) {
        const targetTile = board[newY][newX];
        if (!targetTile.piece) {
          validMoves.push({ 
            position: { x: newX, y: newY }, 
            distance: Math.max(Math.abs(move.x), Math.abs(move.y)),
            isCapture: false
          });
        } else if (targetTile.piece.color !== currentPiece?.color) {
          validMoves.push({ 
            position: { x: newX, y: newY }, 
            distance: Math.max(Math.abs(move.x), Math.abs(move.y)),
            isCapture: true
          });
        }
      }
    });

    return validMoves;
  }

  private isValidPosition(x: number, y: number, boardSize: number): boolean {
    return x >= 0 && x < boardSize && y >= 0 && y < boardSize;
  }

  private isPathClear(
    board: Tile[][],
    start: Position,
    end: Position,
    direction: Position
  ): boolean {
    let currentX = start.x + direction.x;
    let currentY = start.y + direction.y;

    while (currentX !== end.x || currentY !== end.y) {
      if (board[currentY][currentX].piece) {
        return false;
      }
      currentX += direction.x;
      currentY += direction.y;
    }

    return true;
  }

  public isValidMove(validMoves: ValidMove[], targetPosition: Position): boolean {
    return validMoves.some(move => 
      move.position.x === targetPosition.x && 
      move.position.y === targetPosition.y
    );
  }
} 