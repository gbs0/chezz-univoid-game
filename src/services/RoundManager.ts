import { PieceColor, Piece } from './PieceManager';

export interface SelectedPiece {
  piece: Piece;
  position: {
    x: number;
    y: number;
  };
}

export class RoundManager {
  private currentTurn: PieceColor = 'white';
  private selectedPiece: SelectedPiece | null = null;

  constructor() {}

  public getCurrentTurn(): PieceColor {
    return this.currentTurn;
  }

  public getSelectedPiece(): SelectedPiece | null {
    return this.selectedPiece;
  }

  public selectPiece(piece: Piece, x: number, y: number): boolean {
    // Só pode selecionar peça da cor do turno atual
    if (piece.color !== this.currentTurn) {
      return false;
    }

    this.selectedPiece = {
      piece,
      position: { x, y }
    };

    return true;
  }

  public deselectPiece(): void {
    this.selectedPiece = null;
  }

  public endTurn(): void {
    // Alterna entre white e black
    this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
    this.selectedPiece = null;
  }

  public isSelectedPosition(x: number, y: number): boolean {
    if (!this.selectedPiece) return false;
    return this.selectedPiece.position.x === x && this.selectedPiece.position.y === y;
  }
} 