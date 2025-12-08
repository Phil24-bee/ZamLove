import { Heart, X, MapPin, Info, Star, ShieldCheck } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { CompatibilityScore } from './CompatibilityScore';

interface ProfileCardProps {
  name: string;
  age: number;
  location: string;
  bio: string;
  image: string;
  interests: string[];
  distance: string;
  verified?: boolean;
  compatibility?: number;
  onLike: () => void;
  onPass: () => void;
  onShowDetails: () => void;
}

export function ProfileCard({ name, age, location, bio, image, interests, distance, verified, compatibility, onLike, onPass, onShowDetails }: ProfileCardProps) {
  const [showInfo, setShowInfo] = useState(false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x > 100) {
      // Swiped right - like
      onLike();
    } else if (info.offset.x < -100) {
      // Swiped left - pass
      onPass();
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Swipe Indicators */}
      <motion.div 
        className="absolute top-12 left-12 z-20 pointer-events-none"
        style={{
          opacity: useTransform(x, [0, 100], [0, 1]),
        }}
      >
        <div className="bg-[#198A00] text-white px-6 py-3 rounded-2xl border-4 border-white shadow-xl rotate-12">
          <span className="text-2xl">LIKE</span>
        </div>
      </motion.div>
      
      <motion.div 
        className="absolute top-12 right-12 z-20 pointer-events-none"
        style={{
          opacity: useTransform(x, [-100, 0], [1, 0]),
        }}
      >
        <div className="bg-[#DE2010] text-white px-6 py-3 rounded-2xl border-4 border-white shadow-xl -rotate-12">
          <span className="text-2xl">NOPE</span>
        </div>
      </motion.div>

      {/* Main Card */}
      <motion.div 
        className="relative w-full h-[640px] rounded-[32px] overflow-hidden shadow-2xl bg-white cursor-grab active:cursor-grabbing"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        style={{ x, rotate, opacity }}
        onDragEnd={handleDragEnd}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Profile Image */}
        <div className="relative h-full">
          <img 
            src={image} 
            alt={name}
            className="w-full h-full object-cover"
          />
          
          {/* Top Gradient */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/40 to-transparent" />
          
          {/* Bottom Gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-80 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
          
          {/* Distance Badge */}
          <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#198A00]" />
            <span className="text-sm text-gray-700">{distance}</span>
          </div>

          {/* Compatibility Badge */}
          {compatibility && (
            <div className="absolute top-20 right-6">
              <CompatibilityScore score={compatibility} size="sm" showLabel={false} />
            </div>
          )}

          {/* Info Button */}
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onShowDetails();
            }}
            size="icon"
            className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm hover:bg-white rounded-full shadow-lg w-12 h-12"
          >
            <Info className="w-5 h-5 text-[#EF7D00]" />
          </Button>
          
          {/* Profile Info */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-white text-4xl">{name}, {age}</h2>
                {verified && (
                  <div className="bg-blue-500 rounded-full p-1.5" title="Verified user">
                    <ShieldCheck className="w-5 h-5 text-white fill-white" />
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-white/80" />
                <p className="text-white/90">{location}</p>
              </div>
              
              <p className="text-white/90 mb-4">{bio}</p>
              
              {/* Interests */}
              <div className="flex flex-wrap gap-2 mb-8">
                {interests.slice(0, 3).map((interest, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="px-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full"
                  >
                    <span className="text-white text-sm">{interest}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-6 mt-8">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            onClick={onPass}
            size="lg"
            className="w-16 h-16 rounded-full bg-white hover:bg-gray-50 shadow-xl border-2 border-gray-100"
          >
            <X className="w-7 h-7 text-[#DE2010]" strokeWidth={3} />
          </Button>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            onClick={onLike}
            size="lg"
            className="w-20 h-20 rounded-full bg-gradient-to-br from-[#EF7D00] to-[#DE2010] hover:opacity-90 shadow-2xl shadow-orange-500/50"
          >
            <Heart className="w-9 h-9 text-white fill-white" />
          </Button>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            onClick={onShowDetails}
            size="lg"
            className="w-16 h-16 rounded-full bg-gradient-to-br from-[#198A00] to-[#0d5c00] hover:opacity-90 shadow-xl shadow-green-500/30"
          >
            <Star className="w-7 h-7 text-white fill-white" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
