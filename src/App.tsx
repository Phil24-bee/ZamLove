import { useState, useEffect } from 'react';
import { ThemeProvider } from './utils/ThemeContext';
import { AuthWrapper } from './components/AuthWrapper';
import { ProfileCard } from './components/ProfileCard';
import { Navigation } from './components/Navigation';
import { MatchCard } from './components/MatchCard';
import { ProfileDetailDialog } from './components/ProfileDetailDialog';
import { ChatInterface } from './components/ChatInterface';
import { PersonalityTest } from './components/PersonalityTest';
import { VerificationProcess } from './components/VerificationProcess';
import { GamesHub } from './components/GamesHub';
import { Settings } from './components/Settings';
import { BlockedUsers } from './components/BlockedUsers';
import { ProfileEditor } from './components/ProfileEditor';
import { Premium } from './components/Premium';
import { TermsOfService } from './components/TermsOfService';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { VideoSelfieVerification } from './components/VideoSelfieVerification';
import { InterestSelection } from './components/InterestSelection';
import { Heart, Sparkles, Crown } from 'lucide-react';
import { Button } from './components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { signOut } from './utils/supabase/client';

interface User {
  id: string;
  email?: string;
  user_metadata?: any;
}

interface PersonalityTraits {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

interface Profile {
  id: string;
  name: string;
  age: number;
  location: string;
  city: string;
  bio: string;
  image: string;
  interests: string[];
  distance?: string;
  verified?: boolean;
  compatibility?: number;
  personalityTraits?: PersonalityTraits;
}

interface Conversation {
  contactId: string;
  name: string;
  image: string;
  age: number;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  newMessage: boolean;
}

const initialProfiles: Profile[] = [
  {
    id: '1',
    name: 'Sarah',
    age: 25,
    location: 'Lusaka',
    city: 'Lusaka',
    bio: 'Adventure seeker • Coffee enthusiast • Bookworm',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80',
    interests: ['Travel', 'Photography', 'Coffee', 'Reading'],
    distance: '2 km away',
    verified: true,
    compatibility: 87,
  },
  {
    id: '2',
    name: 'Michael',
    age: 28,
    location: 'Kitwe',
    city: 'Kitwe',
    bio: 'Engineer • Musician • Foodie',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80',
    interests: ['Music', 'Hiking', 'Cooking', 'Tech'],
    distance: '5 km away',
    verified: true,
    compatibility: 72,
  },
  {
    id: '3',
    name: 'Grace',
    age: 26,
    location: 'Ndola',
    city: 'Ndola',
    bio: 'Yoga instructor • Nature lover • Wellness coach',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80',
    interests: ['Yoga', 'Nature', 'Wellness', 'Art'],
    distance: '3 km away',
    compatibility: 91,
  },
  {
    id: '4',
    name: 'David',
    age: 30,
    location: 'Livingstone',
    city: 'Livingstone',
    bio: 'Tour guide • Adventure junkie • Photographer',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    interests: ['Adventure', 'Tourism', 'Photography', 'Nature'],
    distance: '8 km away',
    verified: false,
    compatibility: 65,
  },
];

const matches = [
  {
    id: '1',
    name: 'Emma',
    age: 24,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
    matchedAt: '2h ago',
    newMessage: true,
  },
  {
    id: '2',
    name: 'James',
    age: 27,
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80',
    matchedAt: 'Yesterday',
    newMessage: false,
  },
  {
    id: '3',
    name: 'Olivia',
    age: 25,
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
    matchedAt: '2 days ago',
    newMessage: true,
  },
];

function MainApp({ user }: { user: User }) {
  const [activeTab, setActiveTab] = useState('discover');
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [showProfileDetail, setShowProfileDetail] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  
  // New feature states
  const [showPersonalityTest, setShowPersonalityTest] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showBlockedUsers, setShowBlockedUsers] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [showInterestSelection, setShowInterestSelection] = useState(false);
  
  const [userProfile, setUserProfile] = useState<any>({
    id: user.id,
    name: user.user_metadata?.name || '',
    verified: false,
    personalityComplete: false,
    city: user.user_metadata?.city || 'Lusaka',
    image: '',
    bio: '',
    interests: [],
    age: user.user_metadata?.age || 18,
    personalityTraits: undefined as PersonalityTraits | undefined,
  });

  // Load user profile from backend
  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-8234dc9e/profile/${user.id}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (response.ok) {
          const profile = await response.json();
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    }

    loadProfile();
  }, [user.id]);

  const currentProfile = profiles[currentProfileIndex];

  // Filter profiles by location (same city as user)
  useEffect(() => {
    const filteredProfiles = initialProfiles.filter(
      profile => profile.city === userProfile.city
    );
    setProfiles(filteredProfiles);
  }, [userProfile.city]);

  const handleLike = () => {
    setDirection('right');
    toast.success(`You liked ${currentProfile.name}!`, {
      description: currentProfile.compatibility && currentProfile.compatibility > 80 
        ? "It's a great match!" 
        : "Good luck!",
    });
    setTimeout(() => {
      setCurrentProfileIndex((prev) => (prev + 1) % profiles.length);
      setDirection(null);
    }, 400);
  };

  const handlePass = () => {
    setDirection('left');
    setTimeout(() => {
      setCurrentProfileIndex((prev) => (prev + 1) % profiles.length);
      setDirection(null);
    }, 400);
  };

  const handlePersonalityTestComplete = async (traits: PersonalityTraits) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8234dc9e/personality/${user.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(traits),
        }
      );

      if (response.ok) {
        setUserProfile({
          ...userProfile,
          personalityComplete: true,
          personalityTraits: traits,
        });
        toast.success('Personality test completed!', {
          description: 'Your matches will now be more accurate',
        });
        setShowPersonalityTest(false);
        setActiveTab('profile');
      }
    } catch (error) {
      console.error('Error saving personality traits:', error);
      toast.error('Failed to save personality test results');
    }
  };

  const handleVerificationComplete = () => {
    setUserProfile({
      ...userProfile,
      verified: true,
    });
    toast.success('You are now verified!', {
      description: 'Your profile stands out more',
    });
    setShowVerification(false);
    setActiveTab('profile');
  };

  const handleBlockUser = (contactId: string | number) => {
    toast.success('User blocked successfully');
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const handleProfileSave = (updatedProfile: any) => {
    setUserProfile(updatedProfile);
    setShowEditProfile(false);
    toast.success('Profile updated!');
  };

  // Show different screens based on state
  if (showPersonalityTest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <PersonalityTest
          onComplete={handlePersonalityTestComplete}
          onBack={() => setShowPersonalityTest(false)}
        />
        <Toaster />
      </div>
    );
  }

  if (showVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <VerificationProcess
          userId={user.id}
          onComplete={handleVerificationComplete}
          onBack={() => setShowVerification(false)}
        />
        <Toaster />
      </div>
    );
  }

  if (showGame) {
    return (
      <>
        <GamesHub 
          onBack={() => setShowGame(false)} 
          currentUserId={user.id}
          matchedUsers={matches.map(m => ({ id: m.id.toString(), name: m.name }))}
        />
        <Toaster />
      </>
    );
  }

  if (showEditProfile) {
    return (
      <>
        <ProfileEditor
          userId={user.id}
          profile={userProfile}
          onSave={handleProfileSave}
          onBack={() => setShowEditProfile(false)}
        />
        <Toaster />
      </>
    );
  }

  if (showTerms) {
    return (
      <>
        <TermsOfService onBack={() => setShowTerms(false)} />
        <Toaster />
      </>
    );
  }

  if (showPrivacy) {
    return (
      <>
        <PrivacyPolicy onBack={() => setShowPrivacy(false)} />
        <Toaster />
      </>
    );
  }

  if (showBlockedUsers) {
    return (
      <>
        <BlockedUsers currentUserId={user.id} onBack={() => setShowBlockedUsers(false)} />
        <Toaster />
      </>
    );
  }

  if (showPremium) {
    return (
      <>
        <Premium userId={user.id} onBack={() => setShowPremium(false)} />
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-700 sticky top-0 z-40 shadow-sm">
        <div className="max-w-md mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <Heart className="w-7 h-7 sm:w-9 sm:h-9 text-[#EF7D00] fill-[#EF7D00]" />
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-[#198A00] absolute -top-1 -right-1" />
            </div>
            <div>
              <h1 className="text-gray-900 dark:text-gray-100 leading-none">ZamLove</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Find your match</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-[#EF7D00] hover:text-[#EF7D00]/80 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-xs sm:text-sm"
          >
            <Crown className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
            Premium
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-4 sm:py-6 pb-24 sm:pb-28">
        {activeTab === 'discover' && (
          <div className="flex items-center justify-center min-h-[calc(100vh-240px)]">
            <AnimatePresence mode="wait">
              {currentProfile && (
                <motion.div
                  key={currentProfile.id}
                  initial={{ 
                    scale: 0.8, 
                    opacity: 0,
                    rotateZ: direction === 'left' ? -10 : direction === 'right' ? 10 : 0,
                  }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1,
                    rotateZ: 0,
                  }}
                  exit={{ 
                    scale: 0.8, 
                    opacity: 0,
                    x: direction === 'left' ? -400 : direction === 'right' ? 400 : 0,
                    rotateZ: direction === 'left' ? -20 : direction === 'right' ? 20 : 0,
                  }}
                  transition={{ 
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                  className="w-full"
                >
                  <ProfileCard
                    name={currentProfile.name}
                    age={currentProfile.age}
                    location={currentProfile.location}
                    bio={currentProfile.bio}
                    image={currentProfile.image}
                    interests={currentProfile.interests}
                    distance={currentProfile.distance}
                    verified={currentProfile.verified}
                    compatibility={currentProfile.compatibility}
                    onLike={handleLike}
                    onPass={handlePass}
                    onShowDetails={() => setShowProfileDetail(true)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {activeTab === 'matches' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#EF7D00] to-[#198A00] flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white fill-white" />
                </div>
                <div>
                  <h2 className="text-gray-900">Matches</h2>
                  <p className="text-sm text-gray-500">{matches.length} new connections</p>
                </div>
              </div>
            </div>
            
            {matches.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <MatchCard
                  name={match.name}
                  age={match.age}
                  image={match.image}
                  matchedAt={match.matchedAt}
                  newMessage={match.newMessage}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'messages' && (
          <>
            {selectedChat ? (
              <ChatInterface
                contact={selectedChat}
                currentUserId={user.id}
                onBack={() => setSelectedChat(null)}
                onBlock={handleBlockUser}
              />
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="mb-6">
                  <h2 className="text-gray-900">Messages</h2>
                  <p className="text-gray-500">Chat with your matches</p>
                </div>
                
                {matches.map((match, index) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedChat(match)}
                  >
                    <MatchCard
                      name={match.name}
                      age={match.age}
                      image={match.image}
                      matchedAt={match.matchedAt}
                      newMessage={match.newMessage}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        )}

        {activeTab === 'profile' && (
          <Settings
            onTakePersonalityTest={() => setShowPersonalityTest(true)}
            onGetVerified={() => setShowVerification(true)}
            onPlayGame={() => setShowGame(true)}
            onViewBlocked={() => setShowBlockedUsers(true)}
            onEditProfile={() => setShowEditProfile(true)}
            onViewTerms={() => setShowTerms(true)}
            onViewPrivacy={() => setShowPrivacy(true)}
            onViewPremium={() => setShowPremium(true)}
            onLogout={handleLogout}
            userProfile={userProfile}
          />
        )}
      </main>

      {/* Navigation */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Profile Detail Dialog */}
      {currentProfile && (
        <ProfileDetailDialog
          open={showProfileDetail}
          onClose={() => setShowProfileDetail(false)}
          profile={currentProfile}
          onLike={handleLike}
          onPass={handlePass}
        />
      )}

      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthWrapper>
        {(user) => <MainApp user={user} />}
      </AuthWrapper>
    </ThemeProvider>
  );
}