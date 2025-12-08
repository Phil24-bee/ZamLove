import { MessageCircle, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'motion/react';

interface MatchCardProps {
  name: string;
  age: number;
  image: string;
  matchedAt: string;
  newMessage?: boolean;
}

export function MatchCard({ name, age, image, matchedAt, newMessage }: MatchCardProps) {
  return (
    <motion.div 
      className="flex items-center gap-4 p-5 bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all cursor-pointer border border-gray-100 hover:border-[#EF7D00]/30"
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative">
        <div className="relative w-20 h-20 rounded-full overflow-hidden ring-2 ring-[#EF7D00]/20">
          <img 
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-[#EF7D00] to-[#198A00] rounded-full p-2 shadow-lg">
          <Heart className="w-3 h-3 text-white fill-white" />
        </div>
        {newMessage && (
          <div className="absolute -top-1 -left-1 w-5 h-5 bg-[#DE2010] rounded-full border-2 border-white shadow-lg" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="text-gray-900 truncate">{name}, {age}</h3>
        <p className="text-gray-500 text-sm">{matchedAt}</p>
        {newMessage && (
          <p className="text-[#198A00] text-sm mt-1">New message!</p>
        )}
      </div>
      
      <Button
        size="icon"
        className="bg-gradient-to-br from-[#EF7D00] to-[#198A00] hover:opacity-90 text-white rounded-full shadow-lg w-12 h-12 flex-shrink-0"
      >
        <MessageCircle className="w-5 h-5" />
      </Button>
    </motion.div>
  );
}
