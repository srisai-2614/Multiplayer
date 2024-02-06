/* eslint-disable eqeqeq */
import React, { useState, useEffect } from 'react';
import { Board } from '../../Board';
import io from 'socket.io-client';
import { findWinningLine } from '../../utils/winningLines';
import { computeGameStatus } from '../../utils/Status';
import { useParams } from 'react-router-dom';

const socket = io('http://localhost:5000', {
  transports: ['websocket'],
});

const BOARD_SIZE = 3;

const TicTacToe = () => {
  const { roomCode } = useParams();
  const [isNewGame, setIsNewGame] = useState(true);
  const [isXNext, setIsXNext] = useState(Math.random() < 0.5);
  const [squares, setSquares] = useState(Array.from({ length: BOARD_SIZE * BOARD_SIZE }, () => null));
  const [playerWins, setPlayerWins] = useState(0);
  const [Player2Wins, setPlayer2Wins] = useState(0);
  const X_SYMBOL = '✗';
  const O_SYMBOL = '𝟶';

  // Generate a unique user ID
  const userId = generateUserId();

  const handleResetScore = () => {
    setPlayerWins(0);
    setPlayer2Wins(0);
  };

  const updateWins = (isPlayerWinner) => {
    if (isPlayerWinner) {
      setPlayerWins((prev) => prev + 1);
    } else {
      setPlayer2Wins((prev) => prev + 1);
    }
  };

  const totalGames = playerWins + Player2Wins;
  const playerWinPercentage = totalGames === 0 ? 10 : ((playerWins / totalGames) * 100).toFixed(2);
  const computerWinPercentage = (100 - playerWinPercentage).toFixed(2);

  const handleNewGame = () => {
    const shouldPlayerGoFirst = Math.random() < 0.5;
    const newSquares = Array(BOARD_SIZE * BOARD_SIZE).fill(null);
    setSquares(newSquares);
    setIsXNext(shouldPlayerGoFirst);
    setIsNewGame(true);
    socket.emit('updateBoard', newSquares, roomCode);
  };

  useEffect(() => {
    socket.on('updateBoard', (updatedBoard,Code) => {
      if(Code==roomCode){
      if (!areArraysEqual(updatedBoard, squares)) {
        setSquares(updatedBoard);
      }
   }});
  }, [squares]);

  useEffect(() => {

    socket.on('next', (data,Code) => {
      if (Code==roomCode){
      setIsXNext(!data);
  }});
  }, [socket]);

  useEffect(() => {
    const winnerInfo = findWinningLine(squares);
    if (winnerInfo) {
      const isPlayerWinner = winnerInfo.winner === X_SYMBOL;
      updateWins(isPlayerWinner);
    }
  }, [isXNext, squares]);

  const handleClick = (i) => {
    if (findWinningLine(squares) || squares[i]) {
      return;
    }
    const newSquares = [...squares];
    newSquares[i] = isXNext ? X_SYMBOL : O_SYMBOL;
    setSquares(newSquares);
    setIsXNext((prev) => !prev);
    socket.emit('updateBoard', newSquares, roomCode);
    socket.emit('next', isXNext, roomCode);
  };

  const status = computeGameStatus(squares, isXNext, X_SYMBOL, O_SYMBOL);

  return (
    <div className='Computer'>
    <h3 style={{color:'#fff'}}>Room Id: {roomCode}</h3>
      <div className='ScoreIndicator'>
        <ul className='win-count'>
          <li className={`player-icon ${isXNext ? 'player-active' : ''}`}>HOST-{X_SYMBOL}</li>
          <li className='battle-score' onClick={handleResetScore}>
            {playerWins} : {Player2Wins}
          </li>
          <li className={`computer-icon ${!isXNext ? 'computer-active' : ''}`}>GUEST-{O_SYMBOL}</li>
        </ul>
      </div>
      <div className='progress-bar'>
        <div className='player-progress' style={{ width: `${playerWinPercentage}%` }}></div>
        <div className='computer-progress' style={{ width: `${computerWinPercentage}%` }}></div>
      </div>
      <div className='game-wrapper'>
        <button className='restart-button' onClick={handleNewGame}>
          <span className='material-symbols-outlined'>refresh</span>
        </button>
        <Board squares={squares} handleClick={handleClick} xIsNext={isXNext} findWinningLine={findWinningLine} />
        {status === 'Draw Game! No one won this game.' || findWinningLine(squares) ? (
          <button className='new-game-button' aria-label={`Start a new game`} onClick={handleNewGame}>
            New Game
          </button>
        ) : null}
      </div>
      <p className='status' aria-live='polite'>
        {status}
      </p>
    </div>
  );
};

export default TicTacToe;

function areArraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
}

function generateUserId() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
