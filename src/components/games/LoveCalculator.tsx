import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { ArrowLeft, Heart, Sparkles, Users } from 'lucide-react';
import { Progress } from '../ui/progress';

interface LoveCalculatorProps {
  onBack: () => void;
}

const compatibilityMessages = [
  { range: [0, 20], message: "Just friends... for now? 🤔", color: "text-gray-600" },
  { range: [21, 40], message: "There's potential here! 💭", color: "text-blue-600" },
  { range: [41, 60], message: "Sparks are flying! ✨", color: "text-purple-600" },
  { range: [61, 80], message: "Strong connection! 💕", color: "text-pink-600" },
  { range: [81, 95], message: "True love vibes! 💖", color: "text-red-600" },
  { range: [96, 100], message: "Perfect match! 🔥❤️", color: "text-rose-600" },
];

const funFacts = [
  "You both love late-night conversations",
  "Adventure is calling your names together",
  "Your vibes are perfectly aligned",
  "Chemistry is off the charts",
  "You complete each other's sentences",
  "Your energy levels match perfectly",
  "You share the same sense of humor",
  "Your values align wonderfully",
];

export function LoveCalculator({ onBack }: LoveCalculatorProps) {
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [funFact, setFunFact] = useState('');

  const calculateLove = () => {
    if (!name1.trim() || !name2.trim()) return;

    setCalculating(true);
    
    // Fun calculation based on names (deterministic but appears random)
    const combined = (name1 + name2).toLowerCase();
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      hash = combined.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Ensure score is between 30-100 (we want to be positive!)
    const calculatedScore = 30 + (Math.abs(hash) % 71);
    
    // Select random fun fact
    const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)];
    
    setTimeout(() => {
      setScore(calculatedScore);
      setFunFact(randomFact);
      setCalculating(false);
    }, 2000);
  };

  const getMessage = () => {
    if (score === null) return null;
    return compatibilityMessages.find(
      msg => score >= msg.range[0] && score <= msg.range[1]
    );
  };

  const reset = () => {
    setName1('');
    setName2('');
    setScore(null);
    setFunFact('');
  };

  const getHeartColor = () => {
    if (score === null) return "text-gray-400";
    if (score < 40) return "text-blue-500";
    if (score < 60) return "text-purple-500";
    if (score < 80) return "text-pink-500";
    return "text-red-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 dark:from-gray-900 dark:via-pink-900/20 dark:to-gray-900 p-4">
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
            <h1 className="text-gray-900 dark:text-gray-100">Love Calculator</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Calculate your compatibility
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {score === null ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Input Card */}
              <Card className="p-8 mb-6 bg-white dark:bg-gray-800">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-gray-900 dark:text-gray-100 mb-2">
                    Find Your Love Score
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Enter both names to calculate compatibility
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
                      Your Name
                    </label>
                    <Input
                      value={name1}
                      onChange={(e) => setName1(e.target.value)}
                      placeholder="Enter your name"
                      className="h-12"
                    />
                  </div>

                  <div className="flex items-center justify-center">
                    <Heart className="w-6 h-6 text-pink-500" />
                  </div>

                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
                      Their Name
                    </label>
                    <Input
                      value={name2}
                      onChange={(e) => setName2(e.target.value)}
                      placeholder="Enter their name"
                      className="h-12"
                    />
                  </div>

                  <Button
                    onClick={calculateLove}
                    disabled={!name1.trim() || !name2.trim() || calculating}
                    className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white h-14 mt-6"
                  >
                    {calculating ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="mr-2"
                        >
                          <Sparkles className="w-5 h-5" />
                        </motion.div>
                        Calculating Love...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Calculate Compatibility
                      </>
                    )}
                  </Button>
                </div>
              </Card>

              {/* Info Card */}
              <Card className="p-4 bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-700">
                <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                  💕 Just for fun! Real compatibility comes from getting to know each other.
                </p>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              {/* Result Card */}
              <Card className="p-8 mb-6 bg-gradient-to-br from-pink-500 to-red-500 border-0">
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.8 }}
                  >
                    <Heart className="w-20 h-20 text-white mx-auto mb-4" />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <p className="text-white text-xl">{name1}</p>
                      <Heart className="w-5 h-5 text-white" />
                      <p className="text-white text-xl">{name2}</p>
                    </div>

                    <div className="mb-6">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.5 }}
                        className="text-7xl text-white mb-2"
                      >
                        {score}%
                      </motion.div>
                      <p className={`text-2xl ${getMessage()?.color || ''} bg-white/20 px-4 py-2 rounded-full inline-block`}>
                        {getMessage()?.message}
                      </p>
                    </div>

                    <Progress value={score} className="h-3 mb-6 bg-white/20" />

                    {funFact && (
                      <Card className="p-4 bg-white/10 backdrop-blur border-white/20 mb-6">
                        <div className="flex items-start gap-3">
                          <Sparkles className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                          <p className="text-white text-sm">{funFact}</p>
                        </div>
                      </Card>
                    )}
                  </motion.div>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={reset}
                  className="w-full bg-white text-pink-600 hover:bg-gray-50 h-14"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Try Different Names
                </Button>

                <Button
                  onClick={onBack}
                  variant="outline"
                  className="w-full h-14 border-pink-300 dark:border-pink-700"
                >
                  Back to Games
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
