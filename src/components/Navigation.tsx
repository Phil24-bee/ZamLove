import { Heart, User, MessageCircle, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'motion/react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const tabs = [
    { id: 'discover', icon: Sparkles, label: 'Discover' },
    { id: 'matches', icon: Heart, label: 'Matches' },
    { id: 'messages', icon: MessageCircle, label: 'Messages' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-100 shadow-2xl z-50">
      <div className="max-w-md mx-auto flex items-center justify-around py-2 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center gap-1 h-auto py-3 px-6 rounded-2xl hover:bg-orange-50/50 transition-all"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-br from-[#EF7D00]/10 to-[#198A00]/10 rounded-2xl"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className="relative">
                {isActive ? (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#EF7D00] to-[#198A00] flex items-center justify-center shadow-lg">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full flex items-center justify-center">
                    <Icon className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>
              <span className={`text-xs relative z-10 ${
                isActive ? 'text-[#198A00]' : 'text-gray-400'
              }`}>
                {tab.label}
              </span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
