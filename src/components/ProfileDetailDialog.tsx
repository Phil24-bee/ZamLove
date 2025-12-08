import { X, MapPin, Briefcase, GraduationCap, Heart, MessageCircle, Star } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';

interface ProfileDetailDialogProps {
  open: boolean;
  onClose: () => void;
  profile: {
    name: string;
    age: number;
    location: string;
    bio: string;
    image: string;
    interests: string[];
    distance: string;
  };
  onLike: () => void;
  onPass: () => void;
}

export function ProfileDetailDialog({ open, onClose, profile, onLike, onPass }: ProfileDetailDialogProps) {
  const additionalInfo = {
    job: "Product Designer",
    company: "Creative Studio",
    education: "University of Zambia",
    height: "5'7\"",
    aboutMe: "I love exploring new places and trying different cuisines. On weekends you'll find me hiking in the mountains or relaxing at a cozy café with a good book. Looking for someone who shares my passion for adventure and meaningful conversations.",
    lookingFor: "Someone genuine, adventurous, and loves good food!",
    languages: ["English", "Bemba", "Nyanja"],
    moreInterests: ["Photography", "Cooking", "Traveling", "Art", "Music", "Fitness"],
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-0 gap-0 bg-white">
        <VisuallyHidden.Root>
          <DialogTitle>{profile.name}'s Profile</DialogTitle>
          <DialogDescription>
            View detailed profile information for {profile.name}, {profile.age} from {profile.location}
          </DialogDescription>
        </VisuallyHidden.Root>
        
        {/* Header Image */}
        <div className="relative h-96 w-full">
          <img 
            src={profile.image} 
            alt={profile.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          <Button
            onClick={onClose}
            size="icon"
            className="absolute top-4 right-4 bg-white/90 hover:bg-white rounded-full w-10 h-10"
          >
            <X className="w-5 h-5 text-gray-700" />
          </Button>

          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-white text-3xl">{profile.name}, {profile.age}</h2>
              <div className="bg-[#198A00] rounded-full p-1">
                <Star className="w-4 h-4 text-white fill-white" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <MapPin className="w-4 h-4" />
              <span>{profile.location} • {profile.distance}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Bio */}
          <div>
            <h3 className="text-gray-900 mb-2">About</h3>
            <p className="text-gray-600">{additionalInfo.aboutMe}</p>
          </div>

          {/* Job & Education */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-5 h-5 text-[#EF7D00]" />
              </div>
              <div>
                <p className="text-gray-900">{additionalInfo.job}</p>
                <p className="text-gray-500 text-sm">{additionalInfo.company}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-5 h-5 text-[#198A00]" />
              </div>
              <div>
                <p className="text-gray-900">{additionalInfo.education}</p>
              </div>
            </div>
          </div>

          {/* Interests */}
          <div>
            <h3 className="text-gray-900 mb-3">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {additionalInfo.moreInterests.map((interest, index) => (
                <Badge 
                  key={index}
                  className="bg-gradient-to-r from-orange-50 to-emerald-50 text-gray-700 border border-gray-200 hover:border-[#EF7D00]"
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div>
            <h3 className="text-gray-900 mb-3">Languages</h3>
            <div className="flex flex-wrap gap-2">
              {additionalInfo.languages.map((language, index) => (
                <Badge 
                  key={index}
                  className="bg-white text-gray-700 border-2 border-gray-200"
                >
                  {language}
                </Badge>
              ))}
            </div>
          </div>

          {/* Looking For */}
          <div>
            <h3 className="text-gray-900 mb-2">Looking For</h3>
            <p className="text-gray-600">{additionalInfo.lookingFor}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => {
                onPass();
                onClose();
              }}
              className="flex-1 h-14 rounded-full bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-700"
            >
              <X className="w-6 h-6 mr-2 text-[#DE2010]" />
              Pass
            </Button>
            
            <Button
              onClick={() => {
                onLike();
                onClose();
              }}
              className="flex-1 h-14 rounded-full bg-gradient-to-r from-[#EF7D00] to-[#198A00] hover:opacity-90 text-white"
            >
              <Heart className="w-6 h-6 mr-2 fill-white" />
              Like
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
