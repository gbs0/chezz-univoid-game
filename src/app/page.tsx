'use client'

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { BoardManager } from '../services/BoardManager';
import type { Tile } from '../services/BoardManager';
import { PieceManager } from '../services/PieceManager';
import { RoundManager } from '../services/RoundManager';
import { PlayerMovementManager, ValidMove } from '../services/PlayerMovementManager';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [boardSize, setBoardSize] = useState<number>(6);
  const [board, setBoard] = useState<Tile[][]>([]);
  const [showBoard, setShowBoard] = useState<boolean>(false);
  const [pieceManager] = useState(() => new PieceManager());
  const [roundManager] = useState(() => new RoundManager());
  const [movementManager] = useState(() => new PlayerMovementManager());
  const [validMoves, setValidMoves] = useState<ValidMove[]>([]);
  const [boardManager, setBoardManager] = useState<BoardManager | null>(null);

  const handlePlay = () => {
    const newBoardManager = new BoardManager(boardSize);
    setBoardManager(newBoardManager);
    setBoard(newBoardManager.generateBoard());
    setShowBoard(true);
    setValidMoves([]);
  };

  const handleReset = () => {
    setBoardSize(6);
    setBoard([]);
    setShowBoard(false);
    setValidMoves([]);
    setBoardManager(null);
  };

  const movePiece = useCallback((fromX: number, fromY: number, toX: number, toY: number) => {
    if (!boardManager) return false;

    const success = boardManager.movePiece(fromX, fromY, toX, toY);
    if (success) {
      setBoard(boardManager.generateBoard());
      roundManager.endTurn();
      setValidMoves([]);
    }
    return success;
  }, [boardManager, roundManager]);

  const handleTileClick = (tile: Tile, x: number, y: number) => {
    if (!tile.piece) {
      // Se não tem peça e tem uma peça selecionada, tenta mover
      const selectedPiece = roundManager.getSelectedPiece();
      if (selectedPiece && movementManager.isValidMove(validMoves, { x, y })) {
        movePiece(
          selectedPiece.position.x,
          selectedPiece.position.y,
          x,
          y
        );
        roundManager.deselectPiece();
      }
      return;
    }

    // Se clicou em uma peça
    if (roundManager.selectPiece(tile.piece, x, y)) {
      // Calcula os movimentos válidos
      const moves = movementManager.getValidMoves(board, { x, y }, boardSize);
      setValidMoves(moves);
      // Força atualização do tabuleiro para mostrar a seleção
      setBoard([...board]);
    } else {
      setValidMoves([]);
    }
  };

  const isValidMovePosition = (x: number, y: number): boolean => {
    return validMoves.some(move => 
      move.position.x === x && move.position.y === y
    );
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
                          } ${isValidMovePosition(j, i) ? styles.validMove : ''}`}
                          onClick={() => handleTileClick(tile, j, i)}
                        >
                          {renderPiece(tile)}
                          {isValidMovePosition(j, i) && <div className={styles.moveIndicator} />}
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