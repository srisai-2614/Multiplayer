import './Computer.css';
import { Board } from '../../Board';
import { useEffect, useState } from 'react';
import { findWinningLine, winningLines } from '../../utils/winningLines';
import { computeGameStatus } from '../../utils/Status';

const BOARD_SIZE = 3;
function Computer() {
    const [squares, setSquares] = useState(
        Array.from({ length: BOARD_SIZE * BOARD_SIZE }, () => null)
      );
    const [isNewGame, setIsNewGame] = useState(true);
    const [xIsNext, setXIsNext] = useState(Math.random() < 0.5);
    const [playerWins, setPlayerWins] = useState(
      parseInt(localStorage.getItem("playerWins"), 10) || 0
    );
    const [computerWins, setComputerWins] = useState(
      parseInt(localStorage.getItem("computerWins"), 10) || 0
    );
  
    const X_SYMBOL ="✗";
    const O_SYMBOL = "𝟶";
    const MIN_DELAY = 30;
    const MAX_DELAY = 170;

    const handleResetScore = () => {
      setPlayerWins(0);
      setComputerWins(0);
    };

    const updateWins = (isPlayerWinner) => {
      if (isPlayerWinner)
      {
       setPlayerWins(prev=>prev+1)
      }
       else{
        setComputerWins(prev=>prev+1)
      }
    };
    
    useEffect(()=>{
      const winnerInfo=findWinningLine(squares);
      if(winnerInfo){
        const isPlayerWinner=winnerInfo.winner===X_SYMBOL;
        updateWins(isPlayerWinner);
      }
      if (!isNewGame && !xIsNext && !winnerInfo) {
        const randomDelay = Math.floor(Math.random() * MAX_DELAY) + MIN_DELAY;
        setTimeout(() => {
          const computerMove = getComputerMove(squares, O_SYMBOL, X_SYMBOL);
          if (computerMove !== null) {
            const newSquares = [...squares];
            newSquares[computerMove] = O_SYMBOL;
            setSquares(newSquares);
            setXIsNext(true);
          }
        }, randomDelay);
      }
      setIsNewGame(false);
    },[squares,xIsNext,isNewGame]);
  const totalGames = playerWins + computerWins;
  const playerWinPercentage =
    totalGames === 0 ? 30 : ((playerWins / totalGames) * 100).toFixed(2);
  const computerWinPercentage = (100 - playerWinPercentage).toFixed(2);
  
    // Function to handle clicks on the squares of the board (player's turn)
    const handleClick = (i) => {
      if (findWinningLine(squares) || squares[i]) {
        return;
      }
      const newSquares = [...squares];
      newSquares[i] = X_SYMBOL;
      setSquares(newSquares);
      setXIsNext(false);
    };
  
    // Function to handle clicks on the new game button
    const handleNewGame = () => {
      const shouldPlayerGoFirst = Math.random() < 0.5;
      setSquares(Array(BOARD_SIZE * BOARD_SIZE).fill(null));
      setXIsNext(shouldPlayerGoFirst);
      setIsNewGame(true); 
      if (!shouldPlayerGoFirst) {
        const computerMove = getComputerMove(
          Array(BOARD_SIZE * BOARD_SIZE).fill(null),
          O_SYMBOL,
          X_SYMBOL
        );
        const newSquares = Array(BOARD_SIZE * BOARD_SIZE).fill(null);
        newSquares[computerMove] = O_SYMBOL;
        setSquares(newSquares);
        setXIsNext(true);
      }
    };
      const findWinningMove = (squares, symbol, lines) => {
      for (const [a, b, c] of lines) {
        if (squares[a] === squares[b] && squares[a] === symbol && squares[c] === null)
          return c;
        if (squares[a] === squares[c] && squares[a] === symbol && squares[b] === null)
          return b;
        if (squares[b] === squares[c] && squares[b] === symbol && squares[a] === null)
          return a;
      }
      return null;
    };
    const getComputerMove = (squares, mySymbol, opponentSymbol) => {
      let move = findWinningMove(squares, mySymbol, winningLines);
      if (move !== null) return move;
      move = findWinningMove(squares, opponentSymbol, winningLines);
      if (move !== null) return move;
      const emptySquares = squares
        .map((sq, i) => (sq === null ? i : null))
        .filter((i) => i !== null);
      if (emptySquares.length) {
        const randomMove = Math.floor(Math.random() * emptySquares.length);
        return emptySquares[randomMove];
      }
      return null;
    };
    const status = computeGameStatus(squares, xIsNext, X_SYMBOL, O_SYMBOL);
  return (
    <div className='Computer'>
       <div className='ScoreIndicator'>
            <ul className="win-count">
              <li className={`player-icon ${xIsNext ? "player-active" : ""}`}>
                User-{X_SYMBOL}
          
              </li>
              <li className="battle-score" onClick={handleResetScore}>
                {playerWins} : {computerWins}
              </li>
              <li className={`computer-icon ${!xIsNext ? "computer-active" : ""}`}>
                Comp-{O_SYMBOL}
                </li>
            </ul>
       </div>
      `<div className="progress-bar">
          <div
            className="player-progress"
            style={{ width: `${playerWinPercentage}%` }}
            ></div>
          <div
            className="computer-progress"
            style={{ width: `${computerWinPercentage}%` }}
          ></div>
        </div>
        <div className="game-wrapper">
          <button className="restart-button" onClick={handleNewGame}>
            <span className="material-symbols-outlined">refresh</span>
          </button>
          <Board
            squares={squares}
            handleClick={handleClick}
            xIsNext={xIsNext}
            findWinningLine={findWinningLine}
          />
            {status === "Draw Game! No one won this game." || findWinningLine(squares) ? (
              <button
                className="new-game-button"
                aria-label={`Start a new game`}
                onClick={handleNewGame}
              >
                New Game
              </button>
            ) : null}
        
        </div>
        <p className="status" aria-live="polite">
            {status}
        </p>
    </div>
  )
}

export default Computer
