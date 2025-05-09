'use client'

import { useState } from 'react';
import Image from 'next/image';
import { BoardManager } from '../services/BoardManager';
import type { Tile } from '../services/BoardManager';
import { PieceManager } from '../services/PieceManager';
import { RoundManager } from '../services/RoundManager';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [boardSize, setBoardSize] = useState<number>(6);
  const [board, setBoard] = useState<Tile[][]>([]);
  const [showBoard, setShowBoard] = useState<boolean>(false);
  const [pieceManager] = useState(() => new PieceManager());
  const [roundManager] = useState(() => new RoundManager());

  const handlePlay = () => {
    const boardManager = new BoardManager(boardSize);
    setBoard(boardManager.generateBoard());
    setShowBoard(true);
  };

  const handleReset = () => {
    setBoardSize(6);
    setBoard([]);
    setShowBoard(false);
  };

  const handleTileClick = (tile: Tile, x: number, y: number) => {
    if (!tile.piece) {
      // Se não tem peça e tem uma peça selecionada, tenta mover
      const selectedPiece = roundManager.getSelectedPiece();
      if (selectedPiece) {
        // Aqui você implementará a lógica de movimento posteriormente
        roundManager.deselectPiece();
      }
      return;
    }

    // Se clicou em uma peça
    if (roundManager.selectPiece(tile.piece, x, y)) {
      // Força atualização do tabuleiro para mostrar a seleção
      setBoard([...board]);
    }
  };

  const renderCoordinate = (coord: string, isColumn: boolean) => (
    <div key={coord} className={`${styles.coordinate} ${isColumn ? styles.columnCoord : styles.rowCoord}`}>
      {coord}
    </div>
  );

  const renderPiece = (tile: Tile) => {
    if (!tile.piece) return null;
    
    const imagePath = `/${tile.piece.color}-${tile.piece.type}.png`;
    
    return (
      <Image
        src={imagePath}
        alt={`${tile.piece.color} ${tile.piece.type}`}
        width={60}
        height={60}
        className={styles.piece}
      />
    );
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.controls}>
          <div className={styles.scaleControl}>
            <span>Scale</span>
            <span>X</span>
            <input
              type="number"
              min="6"
              max="12"
              value={boardSize}
              onChange={(e) => setBoardSize(Number(e.target.value))}
              className={styles.input}
            />
            <span>Y</span>
            <input
              type="number"
              min="6"
              max="12"
              value={boardSize}
              onChange={(e) => setBoardSize(Number(e.target.value))}
              className={styles.input}
            />
            <span>✓</span>
          </div>
          <div className={styles.buttonGroup}>
            <button onClick={handlePlay} className={styles.playButton}>
              Play
            </button>
            <button onClick={handleReset} className={`${styles.playButton} ${styles.resetButton}`}>
              Reset
            </button>
          </div>
        </div>

        {showBoard && (
          <>
            <div className={styles.turnIndicator}>
              Current Turn: {roundManager.getCurrentTurn()} Player
              <br/>
              <small style={{opacity: 0.6}}>Please select only {roundManager.getCurrentTurn()} pieces</small>
            </div>
            <div className={styles.boardContainer}>
              <div className={styles.columnCoordinates}>
                {Array.from('ABCDEF').map((letter) => renderCoordinate(letter, true))}
              </div>
              <div className={styles.boardWithRows}>
                <div className={styles.rowCoordinates}>
                  {Array.from('654321').map((number) => renderCoordinate(number, false))}
                </div>
                <div className={styles.board}>
                  {board.map((row, i) => (
                    <div key={i} className={styles.row}>
                      {row.map((tile, j) => (
                        <div
                          key={`${i}-${j}`}
                          className={`${styles.tile} ${styles[tile.type]} ${
                            roundManager.isSelectedPosition(j, i) ? styles.selected : ''
                          }`}
                          onClick={() => handleTileClick(tile, j, i)}
                        >
                          {renderPiece(tile)}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
} 