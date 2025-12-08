import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { ArrowLeft, Heart, Flame, Sparkles, RefreshCw } from 'lucide-react';

interface TruthOrDareProps {
  onBack: () => void;
  multiplayer?: boolean;
  currentUserId?: string;
}

const truths = [
  "What's the most romantic thing you've ever done for someone?",
  "What's your biggest relationship deal-breaker?",
  "Have you ever had a crush on a friend?",
  "What's your idea of a perfect date?",
  "What's the most embarrassing thing that's happened to you on a date?",
  "What quality do you find most attractive in a person?",
  "What's your love language?",
  "Have you ever been in love at first sight?",
  "What's your biggest fear in a relationship?",
  "What's the longest you've gone without a relationship?",
  "What's your favorite thing about being in a relationship?",
  "Have you ever dated two people at once?",
  "What's the craziest thing you've done for love?",
  "What's your dream honeymoon destination?",
  "What's one thing you've never told anyone about yourself?",
];

const dares = [
  "Send a flirty message to your match right now!",
  "Share your most embarrassing photo",
  "Do your best dance move",
  "Send a voice note singing your favorite song",
  "Tell three things you like about your match",
  "Share your most attractive feature",
  "Post a silly selfie on your profile",
  "Tell a funny pickup line",
  "Share your hidden talent",
  "Send a compliment to your match",
  "Do 10 jumping jacks right now",
  "Make up a short poem about love",
  "Share your best date idea",
  "Tell a joke that will make your match laugh",
  "Share what first attracted you to your match",
];

export function TruthOrDare({ onBack, multiplayer = false }: TruthOrDareProps) {
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [questionType, setQuestionType] = useState<'truth' | 'dare' | null>(null);
  const [score, setScore] = useState({ truth: 0, dare: 0 });
  const [showResult, setShowResult] = useState(false);

  const handleChoice = (type: 'truth' | 'dare') => {
    setQuestionType(type);
    const questions = type === 'truth' ? truths : dares;
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    setCurrentQuestion(randomQuestion);
    setShowResult(true);
  };

  const handleComplete = () => {
    if (questionType) {
      setScore(prev => ({
        ...prev,
        [questionType]: prev[questionType] + 1,
      }));
    }
    setShowResult(false);
    setQuestionType(null);
    setCurrentQuestion('');
  };

  const handleSkip = () => {
    setShowResult(false);
    setQuestionType(null);
    setCurrentQuestion('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-red-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 p-4">
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
            <h1 className="text-gray-900 dark:text-gray-100">Truth or Dare</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {multiplayer ? 'Playing with match' : 'Solo play'}
            </p>
          </div>
        </div>

        {/* Score Card */}
        <Card className="p-6 mb-6 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20 border-pink-200 dark:border-pink-700">
          <div className="flex items-center justify-around">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-2">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <p className="text-2xl text-blue-600 dark:text-blue-400">{score.truth}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Truths</p>
            </div>
            <div className="w-px h-20 bg-gray-300" />
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mb-2">
                <Flame className="w-8 h-8 text-white" />
              </div>
              <p className="text-2xl text-red-600 dark:text-red-400">{score.dare}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Dares</p>
            </div>
          </div>
        </Card>

        <AnimatePresence mode="wait">
          {!showResult ? (
            <motion.div
              key="choice"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <h2 className="text-center text-gray-900 dark:text-gray-100 mb-6">
                Choose Your Challenge
              </h2>

              {/* Truth Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  onClick={() => handleChoice('truth')}
                  className="p-8 cursor-pointer bg-gradient-to-br from-blue-500 to-blue-600 border-0 hover:shadow-2xl transition-shadow"
                >
                  <div className="text-center">
                    <Heart className="w-16 h-16 text-white mx-auto mb-4" />
                    <h3 className="text-white text-2xl mb-2">Truth</h3>
                    <p className="text-blue-100">Answer an honest question</p>
                  </div>
                </Card>
              </motion.div>

              {/* Dare Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  onClick={() => handleChoice('dare')}
                  className="p-8 cursor-pointer bg-gradient-to-br from-red-500 to-orange-500 border-0 hover:shadow-2xl transition-shadow"
                >
                  <div className="text-center">
                    <Flame className="w-16 h-16 text-white mx-auto mb-4" />
                    <h3 className="text-white text-2xl mb-2">Dare</h3>
                    <p className="text-orange-100">Complete a fun challenge</p>
                  </div>
                </Card>
              </motion.div>

              {/* Info Card */}
              <Card className="p-4 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700 mt-6">
                <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                  💡 Play together with your match to get to know each other better!
                </p>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="question"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card className={`p-8 ${
                questionType === 'truth'
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                  : 'bg-gradient-to-br from-red-500 to-orange-500'
              } border-0 mb-4`}>
                <div className="text-center">
                  {questionType === 'truth' ? (
                    <Heart className="w-16 h-16 text-white mx-auto mb-4" />
                  ) : (
                    <Flame className="w-16 h-16 text-white mx-auto mb-4" />
                  )}
                  <h3 className="text-white text-xl mb-4 capitalize">{questionType}</h3>
                  <p className="text-white text-lg leading-relaxed">
                    {currentQuestion}
                  </p>
                </div>
              </Card>

              <div className="space-y-3">
                <Button
                  onClick={handleComplete}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white h-14"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Completed!
                </Button>
                <Button
                  onClick={handleSkip}
                  variant="outline"
                  className="w-full h-14"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Skip & Choose Again
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
