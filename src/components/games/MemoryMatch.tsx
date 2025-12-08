import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { ArrowLeft, Heart, Star, Trophy, Sparkles, Crown, Zap, RotateCcw } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface MemoryMatchProps {
  onBack: () => void;
  multiplayer?: boolean;
  currentUserId?: string;
}

interface CardType {
  id: number;
  icon: string;
  matched: boolean;
}

const icons = [Heart, Star, Trophy, Sparkles, Crown, Zap];

export function MemoryMatch({ onBack, multiplayer = false }: MemoryMatchProps) {
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [bestScore, setBestScore] = useState<number | null>(null);

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (flippedCards.length === 2) {
      checkMatch();
    }
  }, [flippedCards]);

  useEffect(() => {
    if (matchedPairs === 6) {
      const timeTaken = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
      setGameComplete(true);
      
      if (!bestScore || moves < bestScore) {
        setBestScore(moves);
        toast.success(`New best score: ${moves} moves! 🎉`);
      } else {
        toast.success(`Completed in ${moves} moves and ${timeTaken}s!`);
      }
    }
  }, [matchedPairs]);

  const initializeGame = () => {
    // Create pairs of cards
    const cardPairs: CardType[] = [];
    icons.forEach((icon, idx) => {
      cardPairs.push(
        { id: idx * 2, icon: icon.name, matched: false },
        { id: idx * 2 + 1, icon: icon.name, matched: false }
      );
    });

    // Shuffle cards
    const shuffled = cardPairs.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setStartTime(Date.now());
    setGameComplete(false);
  };

  const handleCardClick = (index: number) => {
    if (flippedCards.length === 2 || flippedCards.includes(index) || cards[index].matched) {
      return;
    }

    setFlippedCards([...flippedCards, index]);
  };

  const checkMatch = () => {
    const [first, second] = flippedCards;
    setMoves(prev => prev + 1);

    if (cards[first].icon === cards[second].icon) {
      // Match found!
      const updatedCards = [...cards];
      updatedCards[first].matched = true;
      updatedCards[second].matched = true;
      setCards(updatedCards);
      setMatchedPairs(prev => prev + 1);
      setFlippedCards([]);
      toast.success('Match! 🎊');
    } else {
      // No match
      setTimeout(() => {
        setFlippedCards([]);
      }, 1000);
    }
  };

  const getIconComponent = (iconName: string) => {
    const Icon = icons.find(i => i.name === iconName);
    return Icon || Heart;
  };

  const timePlayed = startTime && !gameComplete ? Math.floor((Date.now() - startTime) / 1000) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
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
              <h1 className="text-gray-900 dark:text-gray-100">Memory Match</h1>
              <p className="text-sm text-amber-600 dark:text-amber-400">Find all pairs</p>
            </div>
          </div>
          <Button
            onClick={initializeGame}
            size="icon"
            variant="outline"
            className="rounded-full"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="p-4 text-center bg-amber-50 dark:bg-amber-900/20">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Moves</p>
            <p className="text-2xl text-amber-600 dark:text-amber-400">{moves}</p>
          </Card>
          <Card className="p-4 text-center bg-orange-50 dark:bg-orange-900/20">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Time</p>
            <p className="text-2xl text-orange-600 dark:text-orange-400">{timePlayed}s</p>
          </Card>
          <Card className="p-4 text-center bg-purple-50 dark:bg-purple-900/20">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Best</p>
            <p className="text-2xl text-purple-600 dark:text-purple-400">{bestScore || '-'}</p>
          </Card>
        </div>

        {/* Winner Banner */}
        <AnimatePresence>
          {gameComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card className="p-6 mb-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center">
                <Trophy className="w-12 h-12 mx-auto mb-2" />
                <h2 className="mb-1">Congratulations!</h2>
                <p className="mb-3">Completed in {moves} moves!</p>
                <Button
                  onClick={initializeGame}
                  className="bg-white text-amber-600 hover:bg-gray-100"
                >
                  Play Again
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Board */}
        <Card className="p-4 bg-white dark:bg-gray-800">
          <div className="grid grid-cols-4 gap-3">
            {cards.map((card, index) => {
              const Icon = getIconComponent(card.icon);
              const isFlipped = flippedCards.includes(index) || card.matched;

              return (
                <motion.button
                  key={card.id}
                  onClick={() => handleCardClick(index)}
                  disabled={gameComplete}
                  whileHover={!isFlipped ? { scale: 1.05 } : {}}
                  whileTap={!isFlipped ? { scale: 0.95 } : {}}
                  className="aspect-square relative"
                  style={{ perspective: '1000px' }}
                >
                  <motion.div
                    className="w-full h-full relative"
                    initial={false}
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* Back of card */}
                    <div 
                      className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>

                    {/* Front of card */}
                    <div 
                      className={`absolute inset-0 rounded-xl flex items-center justify-center ${
                        card.matched 
                          ? 'bg-gradient-to-br from-green-400 to-emerald-500' 
                          : 'bg-gradient-to-br from-white to-gray-100 dark:from-gray-700 dark:to-gray-600'
                      }`}
                      style={{ 
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)'
                      }}
                    >
                      <Icon className={`w-10 h-10 ${card.matched ? 'text-white' : 'text-amber-600 dark:text-amber-400'}`} />
                    </div>
                  </motion.div>
                </motion.button>
              );
            })}
          </div>
        </Card>

        {/* Progress */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Progress</p>
            <p className="text-sm text-gray-900 dark:text-gray-100">{matchedPairs}/6 pairs</p>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
              initial={{ width: 0 }}
              animate={{ width: `${(matchedPairs / 6) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
