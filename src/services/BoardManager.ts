import { PieceManager, Piece } from './PieceManager';

export interface Tile {
  type: 'light' | 'dark';
  piece?: Piece;
}

export class BoardManager {
  private size: number;
  private pieceManager: PieceManager;

  constructor(size: number = 6) {
    this.size = Math.min(Math.max(size, 6), 12); // Limita o tamanho entre 6 e 12
    this.pieceManager = new PieceManager();
  }

  generateBoard(): Tile[][] {
    const board: Tile[][] = [];
    const pieces = this.pieceManager.getPieces();
    
    for (let i = 0; i < this.size; i++) {
      board[i] = [];
      for (let j = 0; j < this.size; j++) {
        // Alterna entre tiles claras e escuras
        const isLight = (i + j) % 2 === 0;
        const piece = pieces.find(p => p.position.x === j && p.position.y === i);
        
        board[i][j] = {
          type: isLight ? 'light' : 'dark',
          piece: piece
        };
      }
    }

    return board;
  }

  getSize(): number {
    return this.size;
  }

  setSize(newSize: number) {
    this.size = Math.min(Math.max(newSize, 6), 12);
  }

  getPieceManager(): PieceManager {
    return this.pieceManager;
  }
} 