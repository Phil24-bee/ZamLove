import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Brain, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { Card } from './ui/card';

interface PersonalityTestProps {
  onComplete: (traits: PersonalityTraits) => void;
  onBack: () => void;
}

interface PersonalityTraits {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

interface Question {
  id: number;
  text: string;
  trait: keyof PersonalityTraits;
  reversed?: boolean;
}

const questions: Question[] = [
  { id: 1, text: "I enjoy trying new things and exploring new ideas", trait: "openness" },
  { id: 2, text: "I am organized and always plan ahead", trait: "conscientiousness" },
  { id: 3, text: "I feel energized when I'm around people", trait: "extraversion" },
  { id: 4, text: "I am considerate and kind to almost everyone", trait: "agreeableness" },
  { id: 5, text: "I often feel anxious or worried", trait: "neuroticism" },
  { id: 6, text: "I appreciate art, music, and creative expression", trait: "openness" },
  { id: 7, text: "I pay attention to details and complete tasks", trait: "conscientiousness" },
  { id: 8, text: "I prefer to be in the center of attention", trait: "extraversion" },
  { id: 9, text: "I am warm and empathetic towards others", trait: "agreeableness" },
  { id: 10, text: "I get stressed easily", trait: "neuroticism" },
  { id: 11, text: "I am curious and love learning", trait: "openness" },
  { id: 12, text: "I am reliable and can always be counted on", trait: "conscientiousness" },
  { id: 13, text: "I enjoy socializing and making new friends", trait: "extraversion" },
  { id: 14, text: "I am cooperative and avoid conflicts", trait: "agreeableness" },
  { id: 15, text: "I remain calm in stressful situations", trait: "neuroticism", reversed: true },
];

export function PersonalityTest({ onComplete, onBack }: PersonalityTestProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(questions.length).fill(0));
  const [isComplete, setIsComplete] = useState(false);

  const handleAnswer = (score: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = score;
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResults(newAnswers);
    }
  };

  const calculateResults = (finalAnswers: number[]) => {
    const traits: PersonalityTraits = {
      openness: 0,
      conscientiousness: 0,
      extraversion: 0,
      agreeableness: 0,
      neuroticism: 0,
    };

    const counts = {
      openness: 0,
      conscientiousness: 0,
      extraversion: 0,
      agreeableness: 0,
      neuroticism: 0,
    };

    questions.forEach((q, index) => {
      let score = finalAnswers[index];
      if (q.reversed) {
        score = 6 - score; // Reverse the score
      }
      traits[q.trait] += score;
      counts[q.trait]++;
    });

    // Calculate averages and convert to 0-100 scale
    Object.keys(traits).forEach((trait) => {
      const key = trait as keyof PersonalityTraits;
      traits[key] = Math.round((traits[key] / counts[key]) * 20);
    });

    setIsComplete(true);
    setTimeout(() => {
      onComplete(traits);
    }, 2000);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[70vh] p-6"
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 2,
            repeat: 0,
          }}
          className="w-24 h-24 bg-gradient-to-br from-[#EF7D00] to-[#198A00] rounded-full flex items-center justify-center mb-6"
        >
          <Sparkles className="w-12 h-12 text-white" />
        </motion.div>
        <h2 className="text-gray-900 mb-2">Test Complete!</h2>
        <p className="text-gray-600 text-center">
          Your personality profile has been created
        </p>
      </motion.div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          onClick={onBack}
          size="icon"
          variant="ghost"
          className="rounded-full"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-6 h-6 text-[#EF7D00]" />
            <h2 className="text-gray-900">Personality Test</h2>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-gray-500 mt-2">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>
      </div>

      {/* Question Card */}
      <motion.div
        key={currentQuestion}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
      >
        <Card className="p-8 bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 dark:from-gray-800 dark:via-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-700 shadow-2xl">
          {/* Question Number Badge */}
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full px-4 py-2 text-sm">
              Question {currentQuestion + 1}/{questions.length}
            </div>
          </div>

          {/* Question with icon */}
          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <p className="text-xl text-gray-800 dark:text-gray-100">
              {question.text}
            </p>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Strongly Disagree', score: 1, color: 'from-red-500 to-red-600', emoji: '😔' },
              { label: 'Disagree', score: 2, color: 'from-orange-400 to-orange-500', emoji: '😐' },
              { label: 'Neutral', score: 3, color: 'from-gray-400 to-gray-500', emoji: '😶' },
              { label: 'Agree', score: 4, color: 'from-green-400 to-green-500', emoji: '🙂' },
              { label: 'Strongly Agree', score: 5, color: 'from-[#198A00] to-emerald-700', emoji: '😄' },
            ].map((option) => (
              <motion.div
                key={option.score}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => handleAnswer(option.score)}
                  className={`w-full h-16 bg-gradient-to-r ${option.color} hover:opacity-90 text-white justify-between group shadow-lg`}
                  variant="default"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-2xl">{option.emoji}</span>
                    <span className="text-left">{option.label}</span>
                  </span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Navigation */}
      {currentQuestion > 0 && (
        <Button
          onClick={() => setCurrentQuestion(currentQuestion - 1)}
          variant="outline"
          className="w-full"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous Question
        </Button>
      )}
    </div>
  );
}
