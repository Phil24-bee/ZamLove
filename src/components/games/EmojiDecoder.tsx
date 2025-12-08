import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { ArrowLeft, Trophy, Heart, Sparkles, Timer } from 'lucide-react';

interface EmojiDecoderProps {
  onBack: () => void;
}

const emojiPhrases = [
  { emojis: '❤️ + 👀 = ', answer: 'love at first sight', hint: 'A romantic moment' },
  { emojis: '☕ + 📅 = ', answer: 'coffee date', hint: 'First date idea' },
  { emojis: '💍 + 👫 = ', answer: 'engagement', hint: 'Big commitment' },
  { emojis: '🌹 + 💝 = ', answer: 'romantic gift', hint: 'Show of affection' },
  { emojis: '🌙 + ⭐ + 💑 = ', answer: 'stargazing together', hint: 'Romantic evening activity' },
  { emojis: '🎬 + 🍿 + 👫 = ', answer: 'movie date', hint: 'Classic date' },
  { emojis: '🏖️ + 🌅 + 💏 = ', answer: 'beach sunset kiss', hint: 'Romantic scenery' },
  { emojis: '🎵 + 💃 + 🕺 = ', answer: 'dancing together', hint: 'Fun activity' },
  { emojis: '🍝 + 🕯️ + 💑 = ', answer: 'candlelight dinner', hint: 'Romantic meal' },
  { emojis: '💐 + 😊 + 😍 = ', answer: 'flowers make you smile', hint: 'Sweet gesture' },
  { emojis: '📱 + 💬 + 😊 = ', answer: 'texting all night', hint: 'Getting to know each other' },
  { emojis: '🎁 + 🎂 + ❤️ = ', answer: 'birthday surprise', hint: 'Special celebration' },
  { emojis: '☔ + 💑 + 💕 = ', answer: 'kissing in the rain', hint: 'Romantic movie moment' },
  { emojis: '🏔️ + 🥾 + 👫 = ', answer: 'hiking together', hint: 'Adventure date' },
  { emojis: '🎨 + 🖼️ + 💑 = ', answer: 'art gallery date', hint: 'Cultural outing' },
];

export function EmojiDecoder({ onBack }: EmojiDecoderProps) {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentPhrase = emojiPhrases[currentPhraseIndex];

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSkip();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, gameOver, currentPhraseIndex]);

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setCurrentPhraseIndex(0);
    setGameOver(false);
    setTimeLeft(30);
    setUserAnswer('');
    setFeedback(null);
    setShowHint(false);
  };

  const checkAnswer = () => {
    const correct = userAnswer.toLowerCase().trim() === currentPhrase.answer.toLowerCase();
    
    setFeedback(correct ? 'correct' : 'wrong');
    
    if (correct) {
      setScore((prev) => prev + (showHint ? 5 : 10));
    }

    setTimeout(() => {
      if (currentPhraseIndex < emojiPhrases.length - 1) {
        setCurrentPhraseIndex((prev) => prev + 1);
        setUserAnswer('');
        setFeedback(null);
        setShowHint(false);
        setTimeLeft(30);
      } else {
        setGameOver(true);
        setIsPlaying(false);
      }
    }, 1500);
  };

  const handleSkip = () => {
    if (currentPhraseIndex < emojiPhrases.length - 1) {
      setCurrentPhraseIndex((prev) => prev + 1);
      setUserAnswer('');
      setFeedback(null);
      setShowHint(false);
      setTimeLeft(30);
    } else {
      setGameOver(true);
      setIsPlaying(false);
    }
  };

  const getTimerColor = () => {
    if (timeLeft > 20) return 'text-green-600';
    if (timeLeft > 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 dark:from-gray-900 dark:via-orange-900/20 dark:to-gray-900 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            onClick={onBack}
            size="icon"
            variant="ghost"
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-gray-900 dark:text-gray-100">Emoji Decoder</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Decode the emoji messages
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!isPlaying && !gameOver ? (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-8 bg-white dark:bg-gray-800 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">😊💬</span>
                </div>
                <h2 className="text-gray-900 dark:text-gray-100 mb-4">
                  Ready to Decode?
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Figure out the romantic phrases from emoji combinations!
                </p>
                <ul className="text-left text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-6">
                  <li>✅ 10 points for each correct answer</li>
                  <li>💡 5 points if you use a hint</li>
                  <li>⏱️ 30 seconds per phrase</li>
                  <li>🎯 {emojiPhrases.length} phrases to decode</li>
                </ul>
                <Button
                  onClick={startGame}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white h-14"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Decoding
                </Button>
              </Card>
            </motion.div>
          ) : gameOver ? (
            <motion.div
              key="gameover"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card className="p-8 bg-gradient-to-br from-yellow-500 to-orange-500 border-0 text-center mb-4">
                <Trophy className="w-20 h-20 text-white mx-auto mb-4" />
                <h2 className="text-white mb-2">Game Complete!</h2>
                <p className="text-white/90 text-5xl mb-6">{score}</p>
                <p className="text-white mb-4">Total Points</p>
                <div className="bg-white/20 rounded-lg p-4 mb-6">
                  <p className="text-white">
                    You decoded {Math.floor(score / 10)} phrases correctly!
                  </p>
                </div>
              </Card>
              
              <div className="space-y-3">
                <Button
                  onClick={startGame}
                  className="w-full bg-white text-orange-600 hover:bg-gray-50 h-14"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Play Again
                </Button>
                <Button
                  onClick={onBack}
                  variant="outline"
                  className="w-full h-14"
                >
                  Back to Games
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="playing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Stats */}
              <div className="flex gap-3 mb-6">
                <Card className="flex-1 p-4 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Score</p>
                      <p className="text-2xl text-purple-600 dark:text-purple-400">{score}</p>
                    </div>
                    <Trophy className="w-8 h-8 text-purple-500" />
                  </div>
                </Card>
                <Card className="flex-1 p-4 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Time</p>
                      <p className={`text-2xl ${getTimerColor()}`}>{timeLeft}s</p>
                    </div>
                    <Timer className={`w-8 h-8 ${getTimerColor()}`} />
                  </div>
                </Card>
              </div>

              {/* Question Card */}
              <Card className="p-8 mb-6 bg-white dark:bg-gray-800">
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Phrase {currentPhraseIndex + 1} of {emojiPhrases.length}
                  </p>
                  <motion.div
                    key={currentPhraseIndex}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-6xl mb-6"
                  >
                    {currentPhrase.emojis}❓
                  </motion.div>

                  {showHint && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4"
                    >
                      <Card className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          💡 Hint: {currentPhrase.hint}
                        </p>
                      </Card>
                    </motion.div>
                  )}
                </div>

                <div className="space-y-4">
                  <Input
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && userAnswer.trim() && checkAnswer()}
                    placeholder="Type your answer..."
                    className="h-12 text-center"
                    disabled={feedback !== null}
                  />

                  {feedback && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <Card className={`p-4 ${
                        feedback === 'correct'
                          ? 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                          : 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                      }`}>
                        <p className={`text-center ${
                          feedback === 'correct' ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                        }`}>
                          {feedback === 'correct' ? '✅ Correct!' : `❌ Wrong! Answer: ${currentPhrase.answer}`}
                        </p>
                      </Card>
                    </motion.div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      onClick={checkAnswer}
                      disabled={!userAnswer.trim() || feedback !== null}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white h-12"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Submit
                    </Button>
                    <Button
                      onClick={() => setShowHint(true)}
                      disabled={showHint || feedback !== null}
                      variant="outline"
                      className="h-12"
                    >
                      💡 Hint
                    </Button>
                  </div>

                  <Button
                    onClick={handleSkip}
                    variant="ghost"
                    className="w-full"
                    disabled={feedback !== null}
                  >
                    Skip
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
