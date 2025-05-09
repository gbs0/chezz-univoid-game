export type PieceType = 'horse' | 'priest' | 'tower';
export type PieceColor = 'white' | 'black';

export interface Piece {
  type: PieceType;
  color: PieceColor;
  position: {
    x: number;
    y: number;
  };
}

export class PieceManager {
  private pieces: Piece[] = [];

  constructor() {
    this.initializePieces();
  }

  private initializePieces() {
    // Posicionar peças brancas (linha 1)
    this.pieces.push(
      { type: 'horse', color: 'white', position: { x: 0, y: 0 } },  // A1
      { type: 'tower', color: 'white', position: { x: 1, y: 0 } },  // B1
      { type: 'priest', color: 'white', position: { x: 2, y: 0 } }  // C1
    );

    // Posicionar peças pretas (linha 6)
    this.pieces.push(
      { type: 'horse', color: 'black', position: { x: 3, y: 5 } },  // D6
      { type: 'tower', color: 'black', position: { x: 4, y: 5 } },  // E6
      { type: 'priest', color: 'black', position: { x: 5, y: 5 } }  // F6
    );
  }

  public getPieces(): Piece[] {
    return this.pieces;
  }

  public getPieceAt(x: number, y: number): Piece | undefined {
    return this.pieces.find(piece => 
      piece.position.x === x && piece.position.y === y
    );
  }

  public getImagePath(piece: Piece): string {
    return `/${piece.color}-${piece.type}.png`;
  }

  public movePiece(fromX: number, fromY: number, toX: number, toY: number): boolean {
    const piece = this.getPieceAt(fromX, fromY);
    if (!piece) return false;

    piece.position = { x: toX, y: toY };
    return true;
  }

  public removePiece(x: number, y: number): void {
    this.pieces = this.pieces.filter(piece => 
      piece.position.x !== x || piece.position.y !== y
    );
  }
} 