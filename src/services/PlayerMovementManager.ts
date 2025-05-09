import { Piece } from './PieceManager';
import { Tile } from './BoardManager';

export interface Position {
  x: number;
  y: number;
}

export interface ValidMove {
  position: Position;
  distance: number;
}

export class PlayerMovementManager {
  private readonly MAX_DISTANCE = 3;
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

  constructor() {}

  public getValidMoves(
    board: Tile[][],
    currentPosition: Position,
    boardSize: number
  ): ValidMove[] {
    const validMoves: ValidMove[] = [];

    // Para cada direção possível
    this.DIRECTIONS.forEach(direction => {
      // Para cada distância até o máximo permitido
      for (let distance = 1; distance <= this.MAX_DISTANCE; distance++) {
        const newX = currentPosition.x + (direction.x * distance);
        const newY = currentPosition.y + (direction.y * distance);

        // Verifica se a posição está dentro do tabuleiro
        if (
          newX >= 0 && newX < boardSize &&
          newY >= 0 && newY < boardSize
        ) {
          // Verifica se o caminho está livre
          const isPathClear = this.isPathClear(
            board,
            currentPosition,
            { x: newX, y: newY },
            direction
          );

          // Se o caminho estiver livre e não houver peça no destino
          if (isPathClear && !board[newY][newX].piece) {
            validMoves.push({
              position: { x: newX, y: newY },
              distance
            });
          }
        }
      }
    });

    return validMoves;
  }

  private isPathClear(
    board: Tile[][],
    start: Position,
    end: Position,
    direction: Position
  ): boolean {
    let currentX = start.x + direction.x;
    let currentY = start.y + direction.y;

    // Verifica cada posição no caminho até o destino (exclusive)
    while (currentX !== end.x || currentY !== end.y) {
      if (board[currentY][currentX].piece) {
        return false; // Há uma peça bloqueando o caminho
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