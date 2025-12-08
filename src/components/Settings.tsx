import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useTheme } from '../utils/ThemeContext';
import { 
  Brain, 
  ShieldCheck, 
  MapPin, 
  Ban, 
  Gamepad2, 
  ChevronRight,
  Award,
  Heart,
  FileText,
  Shield,
  Edit,
  LogOut,
  Moon,
  Sun,
  Palette,
  Crown,
  Mail,
  Phone
} from 'lucide-react';
import { Switch } from './ui/switch';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';

interface SettingsProps {
  onTakePersonalityTest: () => void;
  onGetVerified: () => void;
  onPlayGame: () => void;
  onViewBlocked: () => void;
  onEditProfile?: () => void;
  onViewTerms?: () => void;
  onViewPrivacy?: () => void;
  onViewPremium?: () => void;
  onLogout?: () => void;
  userProfile?: {
    verified?: boolean;
    personalityComplete?: boolean;
    city?: string;
    name?: string;
    image?: string;
    premium?: boolean;
  };
}

export function Settings({ 
  onTakePersonalityTest, 
  onGetVerified, 
  onPlayGame,
  onViewBlocked,
  onEditProfile,
  onViewTerms,
  onViewPrivacy,
  onViewPremium,
  onLogout,
  userProfile = {}
}: SettingsProps) {
  const { theme, colors, setTheme, setColors } = useTheme();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [tempColors, setTempColors] = useState(colors);

  const handleThemeToggle = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  const handleColorSave = () => {
    setColors(tempColors);
    setShowColorPicker(false);
  };

  const handleColorReset = () => {
    const defaultColors = {
      primary: '#EF7D00',
      secondary: '#198A00',
      accent: '#DE2010',
    };
    setTempColors(defaultColors);
    setColors(defaultColors);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-md mx-auto p-4 sm:p-6"
    >
      <div className="text-center mb-8">
        <div className="w-24 h-24 bg-gradient-to-br from-[#EF7D00] via-[#198A00] to-[#DE2010] rounded-full mx-auto mb-4 flex items-center justify-center relative">
          {userProfile.image ? (
            <img src={userProfile.image} alt="Profile" className="w-full h-full rounded-full object-cover" />
          ) : (
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <span className="text-4xl">👤</span>
            </div>
          )}
          {onEditProfile && (
            <button
              onClick={onEditProfile}
              className="absolute bottom-0 right-0 bg-[#EF7D00] rounded-full p-2 shadow-lg hover:bg-[#EF7D00]/90"
            >
              <Edit className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
        <h2 className="text-gray-900 mb-1">{userProfile.name || 'Profile & Settings'}</h2>
        <p className="text-gray-500">Manage your ZamLove experience</p>
      </div>

      {/* Appearance */}
      <div>
        <h3 className="text-gray-700 dark:text-gray-300 mb-3">Appearance</h3>
        
        <Card className="p-4 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                {theme === 'dark' ? <Moon className="w-6 h-6 text-white" /> : <Sun className="w-6 h-6 text-white" />}
              </div>
              <div className="flex-1">
                <p className="text-gray-900 dark:text-gray-100">Dark Mode</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {theme === 'dark' ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={handleThemeToggle}
            />
          </div>
        </Card>

        <Card 
          className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setShowColorPicker(true)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-gray-900 dark:text-gray-100">Color Theme</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Customize your colors</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </Card>
      </div>

      {/* Profile Enhancement */}
      <div>
        <h3 className="text-gray-700 mb-3">Enhance Your Profile</h3>
        
        <Card 
          className="p-4 mb-3 cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-r from-purple-50 to-pink-50 border-purple-100"
          onClick={onTakePersonalityTest}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-gray-900">Personality Test</p>
                <p className="text-sm text-gray-600">
                  {userProfile.personalityComplete ? 'Completed ✓' : 'Get better matches'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </Card>

        <Card 
          className="p-4 cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-100"
          onClick={onGetVerified}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-gray-900">Get Verified</p>
                <p className="text-sm text-gray-600">
                  {userProfile.verified ? 'Verified ✓' : '3x more matches'}
                </p>
              </div>
            </div>
            {!userProfile.verified && <ChevronRight className="w-5 h-5 text-gray-400" />}
            {userProfile.verified && <Award className="w-5 h-5 text-blue-600" />}
          </div>
        </Card>

        {onViewPremium && (
          <Card 
            className="p-4 cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-r from-amber-50 to-orange-50 border-amber-100"
            onClick={onViewPremium}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900">Premium Features</p>
                  <p className="text-sm text-gray-600">Unlock exclusive benefits</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Card>
        )}
      </div>

      {/* Location & Preferences */}
      <div>
        <h3 className="text-gray-700 mb-3">Preferences</h3>
        
        <Card className="p-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#EF7D00] to-[#198A00] rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-gray-900">Location</p>
              <p className="text-sm text-gray-600">
                {userProfile.city || 'Set your city'}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </Card>
      </div>

      {/* Fun & Games */}
      <div>
        <h3 className="text-gray-700 mb-3">Fun & Games</h3>
        
        <Card 
          className="p-4 cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-r from-amber-50 to-orange-50 border-amber-100"
          onClick={onPlayGame}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-gray-900">Play Games</p>
                <p className="text-sm text-gray-600">Challenge yourself</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </Card>
      </div>

      {/* Privacy & Safety */}
      <div>
        <h3 className="text-gray-700 mb-3">Privacy & Safety</h3>
        
        <Card 
          className="p-4 mb-3 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={onViewBlocked}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                <Ban className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-gray-900">Blocked Users</p>
                <p className="text-sm text-gray-600">Manage blocked accounts</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </Card>

        {onViewTerms && (
          <Card 
            className="p-4 mb-3 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={onViewTerms}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900">Terms of Service</p>
                  <p className="text-sm text-gray-600">Read our terms</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Card>
        )}

        {onViewPrivacy && (
          <Card 
            className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={onViewPrivacy}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900">Privacy Policy</p>
                  <p className="text-sm text-gray-600">How we protect your data</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Card>
        )}
      </div>

      {/* Logout Button */}
      {onLogout && (
        <Button
          variant="outline"
          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      )}

      {/* Profile Stats */}
      <Card className="p-6 bg-gradient-to-br from-orange-50 via-white to-emerald-50 dark:from-orange-900/20 dark:via-gray-800 dark:to-emerald-900/20">
        <div className="text-center mb-4">
          <h3 className="text-gray-900 dark:text-gray-100 mb-2">Your Stats</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl text-[#EF7D00] mb-1">45%</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Profile Complete</p>
          </div>
          <div className="text-center">
            <div className="text-2xl text-[#198A00] mb-1">12</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Matches</p>
          </div>
          <div className="text-center">
            <div className="text-2xl text-[#DE2010] mb-1">
              <Heart className="w-6 h-6 mx-auto fill-[#DE2010]" />
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Likes Sent</p>
          </div>
        </div>
      </Card>

      {/* Contact Information */}
      <Card className="p-6 mt-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-700">
        <h3 className="text-gray-900 dark:text-gray-100 mb-4">Need Help?</h3>
        <div className="space-y-3">
          <a 
            href="mailto:contactzamlove@gmail.com"
            className="flex items-center gap-3 text-blue-600 dark:text-blue-400 hover:underline"
          >
            <Mail className="w-5 h-5" />
            <span>contactzamlove@gmail.com</span>
          </a>
          <a 
            href="tel:+260769486809"
            className="flex items-center gap-3 text-blue-600 dark:text-blue-400 hover:underline"
          >
            <Phone className="w-5 h-5" />
            <span>+260 769 486 809</span>
          </a>
        </div>
      </Card>

      {/* Color Picker Dialog */}
      <Dialog open={showColorPicker} onOpenChange={setShowColorPicker}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Customize Colors</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Label className="text-sm">Primary Color</Label>
              <input
                type="color"
                value={tempColors.primary}
                onChange={(e) => setTempColors({ ...tempColors, primary: e.target.value })}
                className="w-8 h-8"
              />
            </div>
            <div className="flex items-center gap-4">
              <Label className="text-sm">Secondary Color</Label>
              <input
                type="color"
                value={tempColors.secondary}
                onChange={(e) => setTempColors({ ...tempColors, secondary: e.target.value })}
                className="w-8 h-8"
              />
            </div>
            <div className="flex items-center gap-4">
              <Label className="text-sm">Accent Color</Label>
              <input
                type="color"
                value={tempColors.accent}
                onChange={(e) => setTempColors({ ...tempColors, accent: e.target.value })}
                className="w-8 h-8"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-between">
            <Button
              variant="outline"
              className="text-sm"
              onClick={handleColorReset}
            >
              Reset
            </Button>
            <Button
              variant="default"
              className="text-sm"
              onClick={handleColorSave}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}