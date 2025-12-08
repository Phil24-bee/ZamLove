import { motion } from 'motion/react';
import { Heart, Sparkles } from 'lucide-react';

interface CompatibilityScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function CompatibilityScore({ score, size = 'md', showLabel = true }: CompatibilityScoreProps) {
  const sizeClasses = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-16 h-16 text-base',
    lg: 'w-24 h-24 text-xl',
  };

  const getColor = (score: number) => {
    if (score >= 80) return 'from-[#198A00] to-emerald-600';
    if (score >= 60) return 'from-[#EF7D00] to-amber-500';
    return 'from-gray-400 to-gray-500';
  };

  const getLabel = (score: number) => {
    if (score >= 90) return 'Perfect Match';
    if (score >= 80) return 'Excellent Match';
    if (score >= 70) return 'Great Match';
    if (score >= 60) return 'Good Match';
    return 'Moderate Match';
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 15,
        }}
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${getColor(score)} flex items-center justify-center relative shadow-lg`}
      >
        <span className="text-white">{score}%</span>
        {score >= 80 && (
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            className="absolute -top-1 -right-1"
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
          </motion.div>
        )}
      </motion.div>
      {showLabel && (
        <p className="text-xs text-gray-600">{getLabel(score)}</p>
      )}
    </div>
  );
}
