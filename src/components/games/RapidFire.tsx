import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { ArrowLeft, Zap, Trophy, Timer, Heart } from 'lucide-react';

interface RapidFireProps {
  onBack: () => void;
  multiplayer?: boolean;
}

const questions = [
  { question: "What's your ideal first date?", category: "Dating" },
  { question: "Morning person or night owl?", category: "Lifestyle" },
  { question: "Cats or dogs?", category: "Preferences" },
  { question: "Mountains or beach?", category: "Travel" },
  { question: "Coffee or tea?", category: "Food" },
  { question: "Netflix binge or going out?", category: "Entertainment" },
  { question: "Texting or calling?", category: "Communication" },
  { question: "Sweet or savory?", category: "Food" },
  { question: "Adventure or relaxation?", category: "Lifestyle" },
  { question: "Cooking together or eating out?", category: "Dating" },
  { question: "Sunrise or sunset?", category: "Romance" },
  { question: "Dance or karaoke?", category: "Fun" },
  { question: "Summer or winter?", category: "Seasons" },
  { question: "Books or movies?", category: "Entertainment" },
  { question: "City life or countryside?", category: "Lifestyle" },
  { question: "Spontaneous or planned dates?", category: "Dating" },
  { question: "Big party or intimate gathering?", category: "Social" },
  { question: "Active date or chill date?", category: "Dating" },
  { question: "Road trip or flying?", category: "Travel" },
  { question: "Early riser or sleep in?", category: "Lifestyle" },
];

export function RapidFire({ onBack, multiplayer = false }: RapidFireProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [totalTime, setTotalTime] = useState(0);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
      setTotalTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameOver]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setCurrentQuestion(0);
    setAnswers([]);
    setTimeLeft(45);
    setTotalTime(0);
  };

  const handleAnswer = (answer: string) => {
    setAnswers([...answers, answer]);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      endGame();
    }
  };

  const endGame = () => {
    setGameOver(true);
    setGameStarted(false);
  };

  const getTimeColor = () => {
    if (timeLeft > 30) return 'text-green-600';
    if (timeLeft > 15) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 p-4">
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
            <h1 className="text-gray-900 dark:text-gray-100">Rapid Fire</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Quick questions to know each other
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!gameStarted && !gameOver ? (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-8 bg-white dark:bg-gray-800 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-gray-900 dark:text-gray-100 mb-4">
                  Ready for Rapid Fire?
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Answer as many questions as you can in 45 seconds!
                </p>
                <ul className="text-left text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-6">
                  <li>⚡ Quick yes/no or A/B choices</li>
                  <li>⏱️ 45 seconds on the clock</li>
                  <li>💬 {questions.length} fun questions</li>
                  <li>💑 Perfect icebreaker game</li>
                </ul>
                <Button
                  onClick={startGame}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white h-14"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Start Game
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
              <Card className="p-8 bg-gradient-to-br from-purple-500 to-blue-500 border-0 text-center mb-6">
                <Trophy className="w-20 h-20 text-white mx-auto mb-4" />
                <h2 className="text-white mb-2">Time's Up!</h2>
                <p className="text-white/90 text-5xl mb-2">{answers.length}</p>
                <p className="text-white mb-6">Questions Answered</p>
                <div className="bg-white/20 rounded-lg p-4">
                  <p className="text-white mb-1">Time Taken</p>
                  <p className="text-white text-2xl">{formatTime(totalTime)}</p>
                </div>
              </Card>

              {/* Answers Review */}
              <Card className="p-6 bg-white dark:bg-gray-800 mb-4">
                <h3 className="text-gray-900 dark:text-gray-100 mb-4">Your Answers</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {answers.map((answer, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          {questions[index].question}
                        </p>
                        <p className="text-gray-900 dark:text-gray-100">{answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              
              <div className="space-y-3">
                <Button
                  onClick={startGame}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white h-14"
                >
                  <Zap className="w-5 h-5 mr-2" />
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
              {/* Timer */}
              <Card className={`p-6 mb-6 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-700`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Timer className={`w-8 h-8 ${getTimeColor()}`} />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Time Left</p>
                      <p className={`text-3xl ${getTimeColor()}`}>{timeLeft}s</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Answered</p>
                    <p className="text-3xl text-purple-600 dark:text-purple-400">{answers.length}</p>
                  </div>
                </div>
              </Card>

              {/* Question Card */}
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
              >
                <Card className="p-8 mb-6 bg-white dark:bg-gray-800">
                  <div className="text-center mb-6">
                    <div className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full text-xs mb-4">
                      {questions[currentQuestion].category}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Question {currentQuestion + 1} of {questions.length}
                    </p>
                    <h2 className="text-gray-900 dark:text-gray-100 text-2xl mb-6">
                      {questions[currentQuestion].question}
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => handleAnswer('Option A')}
                      className="h-20 bg-gradient-to-br from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
                    >
                      <div>
                        <div className="text-2xl mb-1">A</div>
                        <div className="text-xs">First Choice</div>
                      </div>
                    </Button>
                    <Button
                      onClick={() => handleAnswer('Option B')}
                      className="h-20 bg-gradient-to-br from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                    >
                      <div>
                        <div className="text-2xl mb-1">B</div>
                        <div className="text-xs">Second Choice</div>
                      </div>
                    </Button>
                  </div>

                  <Button
                    onClick={() => handleAnswer('Skip')}
                    variant="ghost"
                    className="w-full mt-3"
                  >
                    Skip Question
                  </Button>
                </Card>
              </motion.div>

              {/* Progress */}
              <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Progress</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    {Math.round((currentQuestion / questions.length) * 100)}%
                  </p>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentQuestion / questions.length) * 100}%` }}
                  />
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
