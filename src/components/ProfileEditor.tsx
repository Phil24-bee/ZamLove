import { useState } from 'react';
import { Camera, Loader2, Save } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { getSession } from '../utils/supabase/client';

interface ProfileEditorProps {
  userId: string;
  profile: any;
  onSave: (updatedProfile: any) => void;
  onBack: () => void;
}

const COMMON_INTERESTS = [
  'Travel', 'Photography', 'Coffee', 'Reading', 'Music', 'Hiking', 
  'Cooking', 'Tech', 'Yoga', 'Nature', 'Wellness', 'Art', 'Adventure', 
  'Tourism', 'Movies', 'Gaming', 'Fitness', 'Dancing', 'Writing', 'Sports'
];

export function ProfileEditor({ userId, profile, onSave, onBack }: ProfileEditorProps) {
  const [name, setName] = useState(profile.name || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [interests, setInterests] = useState<string[]>(profile.interests || []);
  const [imageUrl, setImageUrl] = useState(profile.image || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > 5242880) {
      toast.error('Image must be less than 5MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, and WebP images are allowed');
      return;
    }

    setUploading(true);

    try {
      const session = await getSession();
      if (!session) {
        toast.error('You must be logged in to upload images');
        return;
      }

      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8234dc9e/upload-image/${userId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      setImageUrl(data.imageUrl);
      toast.success('Image uploaded successfully!');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      if (interests.length >= 6) {
        toast.error('You can select up to 6 interests');
        return;
      }
      setInterests([...interests, interest]);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (bio.length > 200) {
      toast.error('Bio must be 200 characters or less');
      return;
    }

    setSaving(true);

    try {
      const updatedProfile = {
        ...profile,
        name: name.trim(),
        bio: bio.trim(),
        interests,
        image: imageUrl,
      };

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8234dc9e/profile`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(updatedProfile),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save profile');
      }

      toast.success('Profile updated successfully!');
      onSave(updatedProfile);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error(error.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-emerald-50">
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-gray-100">
          <h2 className="text-gray-900 mb-6">Edit Profile</h2>

          <div className="space-y-6">
            {/* Profile Image */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-[#EF7D00]"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#EF7D00] to-[#198A00] flex items-center justify-center">
                    <Camera className="w-12 h-12 text-white" />
                  </div>
                )}
                <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50 border border-gray-200">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  {uploading ? (
                    <Loader2 className="w-5 h-5 text-[#EF7D00] animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5 text-[#EF7D00]" />
                  )}
                </label>
              </div>
              <p className="text-sm text-gray-500">Click the camera icon to upload a photo</p>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                maxLength={50}
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell others about yourself..."
                maxLength={200}
                rows={3}
              />
              <p className="text-xs text-gray-500 text-right">{bio.length}/200</p>
            </div>

            {/* Interests */}
            <div className="space-y-2">
              <Label>Interests (select up to 6)</Label>
              <div className="flex flex-wrap gap-2">
                {COMMON_INTERESTS.map((interest) => (
                  <Badge
                    key={interest}
                    variant={interests.includes(interest) ? 'default' : 'outline'}
                    className={`cursor-pointer ${
                      interests.includes(interest)
                        ? 'bg-gradient-to-r from-[#EF7D00] to-[#198A00] text-white'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-gray-500">{interests.length}/6 selected</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={onBack}
                className="flex-1"
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-[#EF7D00] to-[#198A00] hover:from-[#EF7D00]/90 hover:to-[#198A00]/90 text-white"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Profile
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
