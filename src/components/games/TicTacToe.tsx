import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { ArrowLeft, X, Circle, Trophy, RotateCcw } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface TicTacToeProps {
  onBack: () => void;
  multiplayer?: boolean;
  currentUserId?: string;
}

type Player = 'X' | 'O' | null;

export function TicTacToe({ onBack, multiplayer = false }: TicTacToeProps) {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  const [winner, setWinner] = useState<Player>(null);
  const [winningLine, setWinningLine] = useState<number[]>([]);
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });

  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ];

  useEffect(() => {
    checkWinner();
  }, [board]);

  useEffect(() => {
    // AI move for single player
    if (!multiplayer && currentPlayer === 'O' && !winner && board.some(cell => cell === null)) {
      const timer = setTimeout(() => {
        makeAIMove();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, board, winner, multiplayer]);

  const checkWinner = () => {
    for (const combo of winningCombinations) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        setWinner(board[a]);
        setWinningLine(combo);
        setScores(prev => ({ ...prev, [board[a]!]: prev[board[a]!] + 1 }));
        toast.success(`${board[a]} wins! 🎉`);
        return;
      }
    }

    if (!board.includes(null) && !winner) {
      setWinner('draw' as Player);
      setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
      toast('It\'s a draw! 🤝');
    }
  };

  const makeMove = (index: number) => {
    if (board[index] || winner) return;
    
    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);
    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
  };

  const makeAIMove = () => {
    // Simple AI: random valid move
    const availableSpots = board.map((cell, idx) => cell === null ? idx : null).filter(idx => idx !== null) as number[];
    if (availableSpots.length > 0) {
      const randomIndex = availableSpots[Math.floor(Math.random() * availableSpots.length)];
      makeMove(randomIndex);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setWinningLine([]);
  };

  const resetScores = () => {
    setScores({ X: 0, O: 0, draws: 0 });
    resetGame();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
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
              <h1 className="text-gray-900 dark:text-gray-100">Tic Tac Toe</h1>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                {multiplayer ? 'Multiplayer' : 'vs AI'}
              </p>
            </div>
          </div>
          <Button
            onClick={resetScores}
            size="icon"
            variant="outline"
            className="rounded-full"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="p-4 text-center bg-blue-50 dark:bg-blue-900/20">
            <X className="w-6 h-6 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
            <p className="text-2xl text-blue-600 dark:text-blue-400">{scores.X}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Player X</p>
          </Card>
          <Card className="p-4 text-center">
            <Trophy className="w-6 h-6 mx-auto mb-1 text-gray-600 dark:text-gray-400" />
            <p className="text-2xl text-gray-600 dark:text-gray-400">{scores.draws}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Draws</p>
          </Card>
          <Card className="p-4 text-center bg-red-50 dark:bg-red-900/20">
            <Circle className="w-6 h-6 mx-auto mb-1 text-red-600 dark:text-red-400" />
            <p className="text-2xl text-red-600 dark:text-red-400">{scores.O}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">{multiplayer ? 'Player O' : 'AI'}</p>
          </Card>
        </div>

        {/* Current Turn */}
        {!winner && (
          <Card className="p-4 mb-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-center">
            <p className="flex items-center justify-center gap-2">
              Current Turn: 
              {currentPlayer === 'X' ? 
                <X className="w-5 h-5" /> : 
                <Circle className="w-5 h-5" />
              }
              {currentPlayer}
            </p>
          </Card>
        )}

        {/* Winner Banner */}
        <AnimatePresence>
          {winner && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-6 mb-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center">
                <Trophy className="w-12 h-12 mx-auto mb-2" />
                <h2 className="mb-2">
                  {winner === 'draw' ? 'Draw!' : `${winner} Wins!`}
                </h2>
                <Button
                  onClick={resetGame}
                  className="bg-white text-purple-600 hover:bg-gray-100 mt-2"
                >
                  Play Again
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Board */}
        <Card className="p-6 bg-white dark:bg-gray-800">
          <div className="grid grid-cols-3 gap-3">
            {board.map((cell, index) => (
              <motion.button
                key={index}
                onClick={() => makeMove(index)}
                disabled={!!cell || !!winner || (!multiplayer && currentPlayer === 'O')}
                whileHover={!cell && !winner ? { scale: 1.05 } : {}}
                whileTap={!cell && !winner ? { scale: 0.95 } : {}}
                className={`
                  aspect-square rounded-2xl border-2 flex items-center justify-center
                  transition-all duration-200
                  ${cell ? 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600' : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'}
                  ${winningLine.includes(index) ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-600'}
                  ${!cell && !winner ? 'cursor-pointer' : 'cursor-not-allowed'}
                `}
              >
                {cell === 'X' && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <X className="w-12 h-12 text-blue-600 dark:text-blue-400" strokeWidth={3} />
                  </motion.div>
                )}
                {cell === 'O' && (
                  <motion.div
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <Circle className="w-12 h-12 text-red-600 dark:text-red-400" strokeWidth={3} />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
