'use client'

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { BoardManager } from '../services/BoardManager';
import type { Tile, GameResult } from '../services/BoardManager';
import { PieceManager } from '../services/PieceManager';
import { RoundManager } from '../services/RoundManager';
import { PlayerMovementManager, ValidMove } from '../services/PlayerMovementManager';
import styles from '../styles/Home.module.css';
import { Typography } from '@mui/material';

export default function Home() {
  const [boardSize, setBoardSize] = useState<number>(6);
  const [board, setBoard] = useState<Tile[][]>([]);
  const [showBoard, setShowBoard] = useState<boolean>(false);
  const [pieceManager] = useState(() => new PieceManager());
  const [roundManager] = useState(() => new RoundManager());
  const [movementManager] = useState(() => new PlayerMovementManager());
  const [validMoves, setValidMoves] = useState<ValidMove[]>([]);
  const [boardManager, setBoardManager] = useState<BoardManager | null>(null);
  const [gameResult, setGameResult] = useState<GameResult>({ isGameOver: false });

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
    setGameResult({ isGameOver: false });
  };

  const movePiece = useCallback((fromX: number, fromY: number, toX: number, toY: number) => {
    if (!boardManager) return false;

    const result = boardManager.movePiece(fromX, fromY, toX, toY);
    
    // Atualiza o tabuleiro após o movimento
    setBoard(boardManager.generateBoard());
    
    if (result.isGameOver) {
      setGameResult(result);
    } else {
      roundManager.endTurn();
      setValidMoves([]);
    }
    return !result.isGameOver;
  }, [boardManager, roundManager]);

  const handleTileClick = (tile: Tile, x: number, y: number) => {
    const selectedPiece = roundManager.getSelectedPiece();
    const validMove = isValidMovePosition(x, y);

    // Se não tem peça selecionada e clicou em uma peça própria
    if (!selectedPiece && tile.piece && tile.piece.color === roundManager.getCurrentTurn()) {
      if (roundManager.selectPiece(tile.piece, x, y)) {
        const moves = movementManager.getValidMoves(board, { x, y }, boardSize);
        setValidMoves(moves);
        setBoard([...board]); // Força atualização para mostrar seleção
      }
      return;
    }

    // Se tem peça selecionada e o movimento é válido
    if (selectedPiece && validMove) {
      movePiece(
        selectedPiece.position.x,
        selectedPiece.position.y,
        x,
        y
      );
      roundManager.deselectPiece();
      return;
    }

    // Se clicou em qualquer outro lugar, deseleciona
    roundManager.deselectPiece();
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

  const isValidMovePosition = (x: number, y: number): ValidMove | undefined => {
    return validMoves.find(move => 
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
        {gameResult.isGameOver ? (
          <div className={styles.victoryScreen}>
            <h1>{gameResult.winner?.toUpperCase()} WINS!</h1>
            <p>The priest has been captured!</p>
            <button onClick={handleReset} className={styles.playButton}>
              Play again
            </button>
          </div>
        ) : (
          <>
            <div>
              <Typography variant="h2">Welcome to Chezz Game</Typography>
            </div>
            <div className={styles.controls}>
              <div className={styles.scaleControl} style={{display: 'flex'}}>
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
            {!showBoard && (
              <div className={styles.controls}>
                <img src="/white-horse.png" alt="white-horse" width={100}/>
                <img src="/black-horse.png" alt="black-horse" width={100}/>
                <img src="/white-priest.png" alt="white-priest" width={100}/>
                <img src="/black-priest.png" alt="black-priest" width={100}/>
                <img src="/white-tower.png" alt="white-tower" width={100}/>
                <img src="/black-tower.png" alt="black-tower" width={100}/>
              </div>
            )}

            
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
                          {row.map((tile, j) => {
                            const validMove = isValidMovePosition(j, i);
                            return (
                              <div
                                key={`${i}-${j}`}
                                className={`${styles.tile} ${styles[tile.type]} ${
                                  roundManager.isSelectedPosition(j, i) ? styles.selected : ''
                                } ${validMove ? styles.validMove : ''}`}
                                onClick={() => handleTileClick(tile, j, i)}
                              >
                                {renderPiece(tile)}
                                {validMove && (
                                  <div className={validMove.isCapture ? styles.captureIndicator : styles.moveIndicator} />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
} 