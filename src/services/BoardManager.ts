import { PieceManager, Piece } from './PieceManager';

export interface Tile {
  type: 'light' | 'dark';
  piece?: Piece;
}

export class BoardManager {
  private size: number;
  private pieceManager: PieceManager;
  private board: Tile[][];

  constructor(size: number = 6) {
    this.size = Math.min(Math.max(size, 6), 12); // Limita o tamanho entre 6 e 12
    this.pieceManager = new PieceManager();
    this.board = this.generateInitialBoard();
  }

  private generateInitialBoard(): Tile[][] {
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

  public generateBoard(): Tile[][] {
    return this.board;
  }

  public getSize(): number {
    return this.size;
  }

  public setSize(newSize: number) {
    this.size = Math.min(Math.max(newSize, 6), 12);
  }

  public getPieceManager(): PieceManager {
    return this.pieceManager;
  }

  public movePiece(fromX: number, fromY: number, toX: number, toY: number): boolean {
    // Verifica se as coordenadas são válidas
    if (
      fromX < 0 || fromX >= this.size ||
      fromY < 0 || fromY >= this.size ||
      toX < 0 || toX >= this.size ||
      toY < 0 || toY >= this.size
    ) {
      return false;
    }

    const sourceTile = this.board[fromY][fromX];
    const targetTile = this.board[toY][toX];

    // Verifica se há uma peça na posição de origem
    if (!sourceTile.piece) {
      return false;
    }

    // Verifica se a posição de destino está vazia
    if (targetTile.piece) {
      return false;
    }

    // Move a peça
    targetTile.piece = sourceTile.piece;
    sourceTile.piece = undefined;

    // Atualiza a posição da peça no PieceManager
    this.pieceManager.movePiece(fromX, fromY, toX, toY);

    return true;
  }
} 