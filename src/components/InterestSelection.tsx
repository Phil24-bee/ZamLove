import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ArrowLeft, Check, ChevronRight, Film, Music, Book, Utensils, Plane, Dumbbell, Palette, Code } from 'lucide-react';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

interface InterestSelectionProps {
  onComplete: (interests: any) => void;
  onBack: () => void;
  initialInterests?: any;
}

interface InterestCategory {
  id: string;
  name: string;
  icon: any;
  color: string;
  subcategories: {
    id: string;
    name: string;
    options: string[];
  }[];
}

const interestCategories: InterestCategory[] = [
  {
    id: 'movies',
    name: 'Movies & TV',
    icon: Film,
    color: 'from-purple-500 to-pink-500',
    subcategories: [
      {
        id: 'genres',
        name: 'Favorite Genres',
        options: ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Documentary', 'Animation', 'Fantasy']
      },
      {
        id: 'platforms',
        name: 'Streaming Platforms',
        options: ['Netflix', 'ShowMax', 'Amazon Prime', 'Disney+', 'YouTube']
      }
    ]
  },
  {
    id: 'music',
    name: 'Music',
    icon: Music,
    color: 'from-blue-500 to-cyan-500',
    subcategories: [
      {
        id: 'genres',
        name: 'Music Genres',
        options: ['Afrobeats', 'Hip Hop', 'R&B', 'Gospel', 'Reggae', 'Rock', 'Pop', 'Jazz', 'Classical', 'Electronic']
      },
      {
        id: 'zambian',
        name: 'Zambian Artists',
        options: ['Macky 2', 'Yo Maps', 'Chile One', 'Mampi', 'Slap Dee', 'Cleo Ice Queen']
      }
    ]
  },
  {
    id: 'books',
    name: 'Books & Reading',
    icon: Book,
    color: 'from-amber-500 to-orange-500',
    subcategories: [
      {
        id: 'genres',
        name: 'Reading Preferences',
        options: ['Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Self-Help', 'Biography', 'Poetry', 'Science', 'History']
      }
    ]
  },
  {
    id: 'food',
    name: 'Food & Dining',
    icon: Utensils,
    color: 'from-red-500 to-rose-500',
    subcategories: [
      {
        id: 'cuisine',
        name: 'Favorite Cuisines',
        options: ['Zambian', 'Italian', 'Chinese', 'Indian', 'Mexican', 'American', 'Japanese', 'African']
      },
      {
        id: 'zambian-foods',
        name: 'Zambian Favorites',
        options: ['Nshima', 'Ifisashi', 'Chikanda', 'Kapenta', 'T-Bone', 'Munkoyo']
      }
    ]
  },
  {
    id: 'travel',
    name: 'Travel',
    icon: Plane,
    color: 'from-emerald-500 to-green-500',
    subcategories: [
      {
        id: 'destinations',
        name: 'Zambian Destinations',
        options: ['Victoria Falls', 'South Luangwa', 'Lower Zambezi', 'Lake Tanganyika', 'Kafue National Park', 'Kasanka']
      },
      {
        id: 'style',
        name: 'Travel Style',
        options: ['Adventure', 'Relaxation', 'Cultural', 'Wildlife', 'Beach', 'City Breaks']
      }
    ]
  },
  {
    id: 'fitness',
    name: 'Fitness & Sports',
    icon: Dumbbell,
    color: 'from-green-500 to-emerald-500',
    subcategories: [
      {
        id: 'activities',
        name: 'Activities',
        options: ['Gym', 'Running', 'Yoga', 'Swimming', 'Cycling', 'Dancing', 'Hiking', 'Team Sports']
      },
      {
        id: 'sports',
        name: 'Favorite Sports',
        options: ['Football', 'Basketball', 'Rugby', 'Tennis', 'Cricket', 'Volleyball']
      }
    ]
  },
  {
    id: 'arts',
    name: 'Arts & Culture',
    icon: Palette,
    color: 'from-pink-500 to-rose-500',
    subcategories: [
      {
        id: 'activities',
        name: 'Creative Interests',
        options: ['Painting', 'Photography', 'Music Production', 'Dance', 'Theatre', 'Fashion', 'Crafts']
      }
    ]
  },
  {
    id: 'tech',
    name: 'Technology',
    icon: Code,
    color: 'from-indigo-500 to-purple-500',
    subcategories: [
      {
        id: 'interests',
        name: 'Tech Interests',
        options: ['Gaming', 'Programming', 'AI/ML', 'Gadgets', 'Social Media', 'Cryptocurrency', 'Photography']
      }
    ]
  }
];

export function InterestSelection({ onComplete, onBack, initialInterests = {} }: InterestSelectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [interests, setInterests] = useState<any>(initialInterests);

  const toggleInterest = (categoryId: string, subcategoryId: string, option: string) => {
    setInterests((prev: any) => {
      const category = prev[categoryId] || {};
      const subcategory = category[subcategoryId] || [];
      
      const newSubcategory = subcategory.includes(option)
        ? subcategory.filter((item: string) => item !== option)
        : [...subcategory, option];
      
      return {
        ...prev,
        [categoryId]: {
          ...category,
          [subcategoryId]: newSubcategory
        }
      };
    });
  };

  const isSelected = (categoryId: string, subcategoryId: string, option: string) => {
    return interests[categoryId]?.[subcategoryId]?.includes(option) || false;
  };

  const getCategorySelectionCount = (categoryId: string) => {
    const category = interests[categoryId];
    if (!category) return 0;
    return Object.values(category).flat().length;
  };

  const totalSelections = Object.values(interests).reduce((total: number, category: any) => {
    return total + Object.values(category).flat().length;
  }, 0);

  const handleComplete = () => {
    if (totalSelections < 5) {
      return;
    }
    onComplete(interests);
  };

  if (selectedCategory) {
    const category = interestCategories.find(c => c.id === selectedCategory);
    if (!category) return null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Button
              onClick={() => setSelectedCategory(null)}
              size="icon"
              variant="ghost"
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-full flex items-center justify-center`}>
                <category.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-gray-900 dark:text-gray-100">{category.name}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Select your preferences</p>
              </div>
            </div>
          </div>

          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-6 pr-4">
              {category.subcategories.map((subcategory) => (
                <Card key={subcategory.id} className="p-6">
                  <h3 className="text-gray-900 dark:text-gray-100 mb-4">{subcategory.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {subcategory.options.map((option) => {
                      const selected = isSelected(category.id, subcategory.id, option);
                      return (
                        <motion.button
                          key={option}
                          onClick={() => toggleInterest(category.id, subcategory.id, option)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-4 py-2 rounded-full text-sm transition-all ${
                            selected
                              ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {selected && <Check className="w-4 h-4 inline mr-1" />}
                          {option}
                        </motion.button>
                      );
                    })}
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
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
            <h1 className="text-gray-900 dark:text-gray-100">Select Your Interests</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {totalSelections}/5 selections minimum
            </p>
          </div>
        </div>

        {/* Progress */}
        {totalSelections > 0 && (
          <Card className="p-4 mb-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-700 dark:text-gray-300">Your Selections</p>
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">{totalSelections}</Badge>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((totalSelections / 5) * 100, 100)}%` }}
              />
            </div>
          </Card>
        )}

        {/* Categories */}
        <div className="space-y-3">
          {interestCategories.map((category) => {
            const count = getCategorySelectionCount(category.id);
            return (
              <motion.div
                key={category.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center`}>
                        <category.icon className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-gray-900 dark:text-gray-100">{category.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {count > 0 ? `${count} selected` : 'Tap to explore'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Complete Button */}
        <Button
          onClick={handleComplete}
          disabled={totalSelections < 5}
          className="w-full mt-6 h-14 bg-gradient-to-r from-[#EF7D00] to-[#198A00] hover:from-[#EF7D00]/90 hover:to-[#198A00]/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {totalSelections < 5
            ? `Select at least ${5 - totalSelections} more`
            : 'Complete'
          }
        </Button>
      </div>
    </div>
  );
}
