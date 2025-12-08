import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ArrowLeft, Gamepad2, Trophy, Users, Heart, Flame, Smile, Zap, Calculator } from 'lucide-react';
import { TicTacToe } from './games/TicTacToe';
import { MemoryMatch } from './games/MemoryMatch';
import { WordPuzzle } from './games/WordPuzzle';
import { TruthOrDare } from './games/TruthOrDare';
import { LoveCalculator } from './games/LoveCalculator';
import { EmojiDecoder } from './games/EmojiDecoder';
import { RapidFire } from './games/RapidFire';

interface GamesHubProps {
  onBack: () => void;
  currentUserId?: string;
  matchedUsers?: Array<{ id: string; name: string }>;
}

export function GamesHub({ onBack, currentUserId, matchedUsers = [] }: GamesHubProps) {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [multiplayerMode, setMultiplayerMode] = useState(false);

  if (selectedGame === 'tictactoe') {
    return (
      <TicTacToe 
        onBack={() => setSelectedGame(null)} 
        multiplayer={multiplayerMode}
        currentUserId={currentUserId}
      />
    );
  }

  if (selectedGame === 'memory') {
    return (
      <MemoryMatch 
        onBack={() => setSelectedGame(null)}
        multiplayer={multiplayerMode}
        currentUserId={currentUserId}
      />
    );
  }

  if (selectedGame === 'word') {
    return (
      <WordPuzzle 
        onBack={() => setSelectedGame(null)}
        multiplayer={multiplayerMode}
        currentUserId={currentUserId}
      />
    );
  }

  if (selectedGame === 'truthordare') {
    return (
      <TruthOrDare
        onBack={() => setSelectedGame(null)}
        multiplayer={multiplayerMode}
        currentUserId={currentUserId}
      />
    );
  }

  if (selectedGame === 'lovecalculator') {
    return (
      <LoveCalculator
        onBack={() => setSelectedGame(null)}
      />
    );
  }

  if (selectedGame === 'emojidecoder') {
    return (
      <EmojiDecoder
        onBack={() => setSelectedGame(null)}
      />
    );
  }

  if (selectedGame === 'rapidfire') {
    return (
      <RapidFire
        onBack={() => setSelectedGame(null)}
        multiplayer={multiplayerMode}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
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
            <h1 className="text-gray-900 dark:text-gray-100">Games</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Play solo or challenge a match</p>
          </div>
        </div>

        {/* Stats */}
        <Card className="p-6 mb-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-900 dark:text-gray-100">Your Score</p>
                <p className="text-2xl text-purple-600 dark:text-purple-400">1,250 pts</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">Games Played</p>
              <p className="text-xl text-gray-900 dark:text-gray-100">42</p>
            </div>
          </div>
        </Card>

        {/* Games Grid */}
        <div className="space-y-4">
          <h2 className="text-gray-900 dark:text-gray-100">Choose a Game</h2>

          {/* Tic Tac Toe */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-700"
              onClick={() => setSelectedGame('tictactoe')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                    <div className="grid grid-cols-3 gap-0.5 w-8 h-8">
                      {[...Array(9)].map((_, i) => (
                        <div key={i} className="bg-white/50 rounded-sm" />
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-gray-900 dark:text-gray-100">Tic Tac Toe</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Classic strategy game</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Gamepad2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      <p className="text-xs text-blue-600 dark:text-blue-400">Single & Multiplayer</p>
                    </div>
                  </div>
                </div>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Play
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Memory Match */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-700"
              onClick={() => setSelectedGame('memory')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-1 w-8 h-8">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white/50 rounded" />
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-gray-900 dark:text-gray-100">Memory Match</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Test your memory</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Gamepad2 className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      <p className="text-xs text-amber-600 dark:text-amber-400">Single & Multiplayer</p>
                    </div>
                  </div>
                </div>
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                  Play
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Word Puzzle */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-700"
              onClick={() => setSelectedGame('word')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center">
                    <div className="text-white text-2xl">A</div>
                  </div>
                  <div>
                    <h3 className="text-gray-900 dark:text-gray-100">Word Puzzle</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Guess the word</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Gamepad2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">Single & Multiplayer</p>
                    </div>
                  </div>
                </div>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Play
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Truth or Dare */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-pink-200 dark:border-pink-700"
              onClick={() => setSelectedGame('truthordare')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 dark:text-gray-100">Truth or Dare</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Fun challenges</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Flame className="w-3 h-3 text-pink-600 dark:text-pink-400" />
                      <p className="text-xs text-pink-600 dark:text-pink-400">Perfect for couples</p>
                    </div>
                  </div>
                </div>
                <Button size="sm" className="bg-pink-600 hover:bg-pink-700 text-white">
                  Play
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Love Calculator */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-700"
              onClick={() => setSelectedGame('lovecalculator')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center">
                    <Calculator className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 dark:text-gray-100">Love Calculator</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Test compatibility</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Heart className="w-3 h-3 text-red-600 dark:text-red-400" />
                      <p className="text-xs text-red-600 dark:text-red-400">Just for fun!</p>
                    </div>
                  </div>
                </div>
                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                  Play
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Emoji Decoder */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-700"
              onClick={() => setSelectedGame('emojidecoder')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center">
                    <Smile className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 dark:text-gray-100">Emoji Decoder</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Decode messages</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Gamepad2 className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
                      <p className="text-xs text-yellow-600 dark:text-yellow-400">Brain teaser</p>
                    </div>
                  </div>
                </div>
                <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white">
                  Play
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Rapid Fire */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-700"
              onClick={() => setSelectedGame('rapidfire')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 dark:text-gray-100">Rapid Fire</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Quick questions</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Zap className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                      <p className="text-xs text-purple-600 dark:text-purple-400">Fast-paced</p>
                    </div>
                  </div>
                </div>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                  Play
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Multiplayer Section */}
        {matchedUsers.length > 0 && (
          <Card className="p-6 mt-6 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-pink-200 dark:border-pink-700">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-5 h-5 text-pink-600 dark:text-pink-400" />
              <h3 className="text-gray-900 dark:text-gray-100">Challenge a Match</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Select a game above, then choose someone to play with!
            </p>
            <div className="flex flex-wrap gap-2">
              {matchedUsers.slice(0, 5).map((user) => (
                <Button
                  key={user.id}
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  {user.name}
                </Button>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
