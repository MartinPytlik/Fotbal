import React, { useState, useEffect, useRef } from 'react';
import './App.css';

interface GameState {
  words: string[];
  error: string | null;
  isGameOver: boolean;
  currentPlayer: number; 
}

const ROUND_TIME = 10; 

function App() {
  const [gameState, setGameState] = useState<GameState>({
    words: [],
    error: null,
    isGameOver: false,
    currentPlayer: 0,
  });
  const [inputWord, setInputWord] = useState('');
  const [timer, setTimer] = useState(ROUND_TIME);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (gameState.isGameOver || gameState.words.length === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      setTimer(ROUND_TIME);
      return;
    }
    setTimer(ROUND_TIME);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setGameState(prevState => ({
            ...prevState,
            error: `⏱️ Hráč ${prevState.currentPlayer + 1} nestihl zadat slovo, prohrál!`,
            isGameOver: true
          }));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState.words, gameState.isGameOver, gameState.currentPlayer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameState.isGameOver) return;
    const word = inputWord.trim().toLowerCase();

    if (!word) {
      setGameState(prev => ({ ...prev, error: 'Zadejte slovo' }));
      return;
    }

    if (gameState.words.includes(word)) {
      setGameState(prev => ({ 
        ...prev, 
        error: `Toto slovo už bylo použito, Hráč ${gameState.currentPlayer + 1} prohrál!`,
        isGameOver: true
      }));
      return;
    }

    if (gameState.words.length > 0) {
      const lastWord = gameState.words[gameState.words.length - 1];
      const lastLetter = lastWord[lastWord.length - 1];
      
      if (word[0] !== lastLetter) {
        setGameState(prev => ({ 
          ...prev, 
          error: `Slovo musí začínat písmenem '${lastLetter}'` 
        }));
        return;
      }
    }

    setGameState(prev => ({
      words: [...prev.words, word],
      error: null,
      isGameOver: false,
      currentPlayer: prev.currentPlayer === 0 ? 1 : 0
    }));
    setInputWord('');
  };

  const handleRestart = () => {
    setGameState({
      words: [],
      error: null,
      isGameOver: false,
      currentPlayer: 0
    });
    setInputWord('');
    setTimer(ROUND_TIME);
  };

  return (
    <div className="App">
      <h1>Slovní Fotbal</h1>
      <div className="game-container">
        <div style={{marginBottom: '1rem'}}>
          <strong>Na tahu: Hráč {gameState.currentPlayer + 1}</strong>
        </div>
        <div style={{marginBottom: '1rem'}}>
          <span>⏱️ Čas: <strong>{timer}</strong> s</span>
        </div>
        <div className="word-chain">
          {gameState.words.length > 0 ? (
            gameState.words.map((word, index) => (
              <span key={index} className="word">
                {word}
                {index < gameState.words.length - 1 && ' → '}
              </span>
            ))
          ) : (
            <p className="no-words">Zatím žádná slova</p>
          )}
        </div>
        {gameState.error && (
          <div className="error-message">
            {gameState.error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="input-form">
          <input
            type="text"
            value={inputWord}
            onChange={(e) => setInputWord(e.target.value)}
            placeholder="Zadejte slovo"
            className="word-input"
            disabled={gameState.isGameOver}
            autoFocus
          />
          <button 
            type="submit" 
            className="submit-button"
            disabled={gameState.isGameOver}
          >
            Přidat slovo
          </button>
        </form>
        <button onClick={handleRestart} className="restart-button">
          {gameState.isGameOver ? 'Nová hra' : 'Restartovat hru'}
        </button>
      </div>
    </div>
  );
}

export default App;
