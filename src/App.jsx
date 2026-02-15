import { useState, useEffect, useCallback, useRef } from 'react';
import Game from './components/Game';
import './App.css';

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;

function App() {
  const [gameState, setGameState] = useState('start'); // start, playing, paused, gameover
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('snake-highscore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [speed, setSpeed] = useState(INITIAL_SPEED);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('snake-highscore', score.toString());
    }
  }, [score, highScore]);

  const handleGameOver = useCallback((finalScore) => {
    setGameState('gameover');
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('snake-highscore', finalScore.toString());
    }
  }, [highScore]);

  const handleScoreIncrease = useCallback((newScore) => {
    setScore(newScore);
    // Increase speed every 5 points, min 50ms
    const newSpeed = Math.max(50, INITIAL_SPEED - Math.floor(newScore / 5) * 10);
    setSpeed(newSpeed);
  }, []);

  const startGame = () => {
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setGameState('playing');
  };

  const handlePause = () => {
    if (gameState === 'playing') {
      setGameState('paused');
    } else if (gameState === 'paused') {
      setGameState('playing');
    }
  };

  return (
    <div className="app">
      <div className="game-container">
        <header className="game-header">
          <h1 className="game-title">SNAKE</h1>
          <div className="scores">
            <div className="score">
              <span className="score-label">SCORE</span>
              <span className="current-score">{score}</span>
            </div>
            <div className="score">
              <span className="score-label">HIGH</span>
              <span className="high-score">{highScore}</span>
            </div>
          </div>
        </header>
        
        <Game
          gameState={gameState}
          speed={speed}
          onScoreIncrease={handleScoreIncrease}
          onGameOver={handleGameOver}
          onPause={handlePause}
        />
        
        <div className="controls-hint">
          <span>Arrow Keys / Swipe to move</span>
          <span>Space to pause</span>
        </div>
      </div>
      
      {gameState === 'start' && (
        <div className="overlay">
          <div className="overlay-content">
            <h2>READY TO PLAY?</h2>
            <button className="cyber-button" onClick={startGame}>
              <span>START GAME</span>
            </button>
          </div>
        </div>
      )}
      
      {gameState === 'paused' && (
        <div className="overlay">
          <div className="overlay-content">
            <h2>PAUSED</h2>
            <button className="cyber-button" onClick={handlePause}>
              <span>RESUME</span>
            </button>
          </div>
        </div>
      )}
      
      {gameState === 'gameover' && (
        <div className="overlay">
          <div className="overlay-content">
            <h2>GAME OVER</h2>
            <p className="final-score">SCORE: {score}</p>
            {score >= highScore && score > 0 && <p className="new-high">NEW HIGH SCORE!</p>}
            <button className="cyber-button" onClick={startGame}>
              <span>PLAY AGAIN</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
