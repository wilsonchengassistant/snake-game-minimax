import { useState, useEffect, useRef } from 'react';
import './Game.css';

const GRID_SIZE = 20;

const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

function Game({ gameState, speed, onScoreIncrease, onGameOver, onPause }) {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [direction, setDirection] = useState(DIRECTIONS.RIGHT);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [touchStart, setTouchStart] = useState(null);
  
  const directionRef = useRef(DIRECTIONS.RIGHT);
  const scoreRef = useRef(0);
  
  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  const generateFood = (currentSnake) => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (
      currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y)
    );
    return newFood;
  };

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection(DIRECTIONS.RIGHT);
    directionRef.current = DIRECTIONS.RIGHT;
    setFood(generateFood([{ x: 10, y: 10 }]));
    scoreRef.current = 0;
  };

  useEffect(() => {
    if (gameState === 'playing') {
      resetGame();
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const newHead = {
          x: head.x + directionRef.current.x,
          y: head.y + directionRef.current.y,
        };

        if (
          newHead.x < 0 || newHead.x >= GRID_SIZE ||
          newHead.y < 0 || newHead.y >= GRID_SIZE
        ) {
          onGameOver(scoreRef.current);
          return prevSnake;
        }

        if (prevSnake.some(s => s.x === newHead.x && s.y === newHead.y)) {
          onGameOver(scoreRef.current);
          return prevSnake;
        }

        let newSnake = [newHead, ...prevSnake];
        
        if (newHead.x === food.x && newHead.y === food.y) {
          scoreRef.current += 1;
          onScoreIncrease(scoreRef.current);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [gameState, speed, food, onScoreIncrease, onGameOver]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        onPause();
        return;
      }
      if (gameState !== 'playing') return;

      const map = {
        ArrowUp: DIRECTIONS.UP, ArrowDown: DIRECTIONS.DOWN,
        ArrowLeft: DIRECTIONS.LEFT, ArrowRight: DIRECTIONS.RIGHT,
        KeyW: DIRECTIONS.UP, KeyS: DIRECTIONS.DOWN,
        KeyA: DIRECTIONS.LEFT, KeyD: DIRECTIONS.RIGHT,
      };
      const d = map[e.code];
      if (d) {
        e.preventDefault();
        const c = directionRef.current;
        if ((d.x && c.x !== -d.x) || (d.y && c.y !== -d.y)) {
          setDirection(d);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, onPause]);

  const handleTouchStart = (e) => setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  
  const handleTouchEnd = (e) => {
    if (!touchStart || gameState !== 'playing') return;
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    const c = directionRef.current;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > 30) setDirection(dx > 0 ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT);
    } else {
      if (Math.abs(dy) > 30) setDirection(dy > 0 ? DIRECTIONS.DOWN : DIRECTIONS.UP);
    }
    setTouchStart(null);
  };

  return (
    <div className="game-board" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="grid">
        {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => {
          const x = i % GRID_SIZE, y = Math.floor(i / GRID_SIZE);
          return (
            <div key={i} className={`cell ${snake.some(s => s.x === x && s.y === y) ? 'snake' : ''} ${snake[0].x === x && snake[0].y === y ? 'head' : ''} ${food.x === x && food.y === y ? 'food' : ''}`}>
              {food.x === x && food.y === y && <div className="food-inner" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Game;
