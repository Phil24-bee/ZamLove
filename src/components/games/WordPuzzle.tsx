import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { ArrowLeft, Trophy, HelpCircle, RotateCcw, Lightbulb } from 'lucide-react';
import { Input } from '../ui/input';
import { toast } from 'sonner@2.0.3';

interface WordPuzzleProps {
  onBack: () => void;
  multiplayer?: boolean;
  currentUserId?: string;
}

const wordList = [
  { word: 'LOVE', hint: 'The reason you\'re on ZamLove! ❤️' },
  { word: 'HEART', hint: 'Symbol of affection' },
  { word: 'MATCH', hint: 'When two people connect perfectly' },
  { word: 'DATE', hint: 'A romantic meeting' },
  { word: 'KISS', hint: 'An intimate gesture' },
  { word: 'SMILE', hint: 'What you do when happy' },
  { word: 'HAPPY', hint: 'Feeling of joy' },
  { word: 'SWEET', hint: 'Kind and pleasant' },
  { word: 'CHARM', hint: 'Attractive quality' },
  { word: 'DREAM', hint: 'What you wish for' },
  { word: 'ROMANCE', hint: 'Love and affection' },
  { word: 'PASSION', hint: 'Strong emotion' },
  { word: 'TOGETHER', hint: 'With someone' },
  { word: 'ZAMBIA', hint: 'Beautiful country in Africa' },
  { word: 'LUSAKA', hint: 'Capital of Zambia' },
];

export function WordPuzzle({ onBack, multiplayer = false }: WordPuzzleProps) {
  const [currentWordData, setCurrentWordData] = useState(wordList[0]);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [score, setScore] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const maxWrongGuesses = 6;
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  useEffect(() => {
    checkGameStatus();
  }, [guessedLetters, wrongGuesses]);

  const checkGameStatus = () => {
    const allLettersGuessed = currentWordData.word.split('').every(letter => 
      guessedLetters.includes(letter)
    );

    if (allLettersGuessed && !gameWon) {
      setGameWon(true);
      const points = Math.max(100 - (wrongGuesses * 10) - (hintsUsed * 20), 10);
      setScore(prev => prev + points);
      toast.success(`Correct! +${points} points 🎉`);
    }

    if (wrongGuesses >= maxWrongGuesses && !gameLost) {
      setGameLost(true);
      toast.error(`Game Over! The word was: ${currentWordData.word}`);
    }
  };

  const handleLetterGuess = (letter: string) => {
    if (guessedLetters.includes(letter) || gameWon || gameLost) return;

    setGuessedLetters([...guessedLetters, letter]);

    if (!currentWordData.word.includes(letter)) {
      setWrongGuesses(prev => prev + 1);
    }
  };

  const nextWord = () => {
    const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
    setCurrentWordData(randomWord);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameWon(false);
    setGameLost(false);
    setShowHint(false);
  };

  const resetGame = () => {
    nextWord();
    setScore(0);
    setHintsUsed(0);
  };

  const useHint = () => {
    setShowHint(true);
    setHintsUsed(prev => prev + 1);
    toast.info('Hint revealed! -20 points');
  };

  const revealLetter = () => {
    const unguessedLetters = currentWordData.word.split('').filter(letter => 
      !guessedLetters.includes(letter)
    );
    
    if (unguessedLetters.length > 0) {
      const randomLetter = unguessedLetters[Math.floor(Math.random() * unguessedLetters.length)];
      setGuessedLetters([...guessedLetters, randomLetter]);
      setHintsUsed(prev => prev + 1);
      toast.info(`Letter revealed: ${randomLetter} (-20 points)`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              onClick={onBack}
              size="icon"
              variant="ghost"
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-gray-900 dark:text-gray-100">Word Puzzle</h1>
              <p className="text-sm text-emerald-600 dark:text-emerald-400">Guess the word!</p>
            </div>
          </div>
          <Button
            onClick={resetGame}
            size="icon"
            variant="outline"
            className="rounded-full"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="p-4 text-center bg-emerald-50 dark:bg-emerald-900/20">
            <Trophy className="w-6 h-6 mx-auto mb-1 text-emerald-600 dark:text-emerald-400" />
            <p className="text-2xl text-emerald-600 dark:text-emerald-400">{score}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Score</p>
          </Card>
          <Card className="p-4 text-center bg-red-50 dark:bg-red-900/20">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Wrong Guesses</p>
            <p className="text-2xl text-red-600 dark:text-red-400">{wrongGuesses}/{maxWrongGuesses}</p>
          </Card>
        </div>

        {/* Winner/Loser Banner */}
        <AnimatePresence>
          {(gameWon || gameLost) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card className={`p-6 mb-6 text-white text-center ${
                gameWon ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 'bg-gradient-to-r from-red-500 to-rose-500'
              }`}>
                <Trophy className="w-12 h-12 mx-auto mb-2" />
                <h2 className="mb-2">{gameWon ? 'Congratulations!' : 'Game Over!'}</h2>
                {gameLost && <p className="mb-3">The word was: {currentWordData.word}</p>}
                <Button
                  onClick={nextWord}
                  className="bg-white text-emerald-600 hover:bg-gray-100"
                >
                  Next Word
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Word Display */}
        <Card className="p-8 mb-6 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20">
          <div className="flex items-center justify-center gap-2 mb-4">
            {currentWordData.word.split('').map((letter, idx) => (
              <motion.div
                key={idx}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="w-10 h-12 sm:w-12 sm:h-14 bg-white dark:bg-gray-700 rounded-lg border-2 border-emerald-300 dark:border-emerald-600 flex items-center justify-center"
              >
                <span className="text-2xl text-gray-900 dark:text-gray-100">
                  {guessedLetters.includes(letter) ? letter : ''}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Hint */}
          {showHint && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-sm text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg p-3"
            >
              💡 {currentWordData.hint}
            </motion.div>
          )}
        </Card>

        {/* Hint Buttons */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={useHint}
            disabled={showHint || gameWon || gameLost}
            variant="outline"
            className="flex-1"
            size="sm"
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            Show Hint
          </Button>
          <Button
            onClick={revealLetter}
            disabled={gameWon || gameLost}
            variant="outline"
            className="flex-1"
            size="sm"
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            Reveal Letter
          </Button>
        </div>

        {/* Keyboard */}
        <Card className="p-4 bg-white dark:bg-gray-800">
          <div className="grid grid-cols-7 gap-2">
            {alphabet.map((letter) => {
              const isGuessed = guessedLetters.includes(letter);
              const isCorrect = isGuessed && currentWordData.word.includes(letter);
              const isWrong = isGuessed && !currentWordData.word.includes(letter);

              return (
                <motion.button
                  key={letter}
                  onClick={() => handleLetterGuess(letter)}
                  disabled={isGuessed || gameWon || gameLost}
                  whileHover={!isGuessed ? { scale: 1.1 } : {}}
                  whileTap={!isGuessed ? { scale: 0.9 } : {}}
                  className={`
                    aspect-square rounded-lg text-sm transition-all
                    ${isCorrect ? 'bg-emerald-500 text-white' : ''}
                    ${isWrong ? 'bg-red-500 text-white' : ''}
                    ${!isGuessed ? 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100' : ''}
                    ${isGuessed ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                  `}
                >
                  {letter}
                </motion.button>
              );
            })}
          </div>
        </Card>

        {/* Hangman Display */}
        <Card className="p-6 mt-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
          <div className="flex items-center justify-center">
            <svg width="200" height="200" viewBox="0 0 200 200" className="text-gray-700 dark:text-gray-300">
              {/* Gallows */}
              <line x1="10" y1="190" x2="90" y2="190" stroke="currentColor" strokeWidth="3" />
              <line x1="30" y1="190" x2="30" y2="20" stroke="currentColor" strokeWidth="3" />
              <line x1="30" y1="20" x2="100" y2="20" stroke="currentColor" strokeWidth="3" />
              <line x1="100" y1="20" x2="100" y2="40" stroke="currentColor" strokeWidth="3" />
              
              {/* Head */}
              {wrongGuesses >= 1 && (
                <motion.circle 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  cx="100" cy="55" r="15" stroke="currentColor" strokeWidth="3" fill="none" 
                />
              )}
              
              {/* Body */}
              {wrongGuesses >= 2 && (
                <motion.line 
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  x1="100" y1="70" x2="100" y2="120" stroke="currentColor" strokeWidth="3" 
                />
              )}
              
              {/* Left Arm */}
              {wrongGuesses >= 3 && (
                <motion.line 
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  x1="100" y1="85" x2="75" y2="100" stroke="currentColor" strokeWidth="3" 
                />
              )}
              
              {/* Right Arm */}
              {wrongGuesses >= 4 && (
                <motion.line 
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  x1="100" y1="85" x2="125" y2="100" stroke="currentColor" strokeWidth="3" 
                />
              )}
              
              {/* Left Leg */}
              {wrongGuesses >= 5 && (
                <motion.line 
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  x1="100" y1="120" x2="80" y2="150" stroke="currentColor" strokeWidth="3" 
                />
              )}
              
              {/* Right Leg */}
              {wrongGuesses >= 6 && (
                <motion.line 
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  x1="100" y1="120" x2="120" y2="150" stroke="currentColor" strokeWidth="3" 
                />
              )}
            </svg>
          </div>
        </Card>
      </div>
    </div>
  );
}
