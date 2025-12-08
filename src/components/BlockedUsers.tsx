import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ArrowLeft, Ban, UserX } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface BlockedUser {
  id: string;
  name: string;
  age: number;
  image: string;
}

interface BlockedUsersProps {
  currentUserId: string;
  onBack: () => void;
}

export function BlockedUsers({ currentUserId, onBack }: BlockedUsersProps) {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [userToUnblock, setUserToUnblock] = useState<BlockedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const fetchBlockedUsers = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8234dc9e/blocked-profiles/${currentUserId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBlockedUsers(data.blockedUsers || []);
      } else {
        toast.error('Failed to load blocked users');
      }
    } catch (error) {
      console.error('Error fetching blocked users:', error);
      toast.error('Failed to load blocked users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnblock = async (user: BlockedUser) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8234dc9e/block/${currentUserId}/${user.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        setBlockedUsers(blockedUsers.filter(u => u.id !== user.id));
        toast.success(`${user.name} has been unblocked`);
        setUserToUnblock(null);
      } else {
        toast.error('Failed to unblock user');
      }
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast.error('Failed to unblock user');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
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
        <div className="flex-1">
          <h2 className="text-gray-900">Blocked Users</h2>
          <p className="text-sm text-gray-500">
            {blockedUsers.length} {blockedUsers.length === 1 ? 'user' : 'users'} blocked
          </p>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-[#EF7D00] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      ) : blockedUsers.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserX className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-gray-900 mb-2">No Blocked Users</h3>
          <p className="text-gray-600">
            You haven't blocked anyone yet
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {blockedUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <img
                    src={user.image}
                    alt={user.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-gray-900">{user.name}, {user.age}</p>
                    <p className="text-sm text-gray-500">Blocked</p>
                  </div>
                  <Button
                    onClick={() => setUserToUnblock(user)}
                    variant="outline"
                    size="sm"
                    className="text-[#198A00] border-[#198A00] hover:bg-[#198A00] hover:text-white"
                  >
                    Unblock
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Unblock Confirmation Dialog */}
      <AlertDialog open={!!userToUnblock} onOpenChange={() => setUserToUnblock(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unblock {userToUnblock?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              They will be able to see your profile and message you again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToUnblock && handleUnblock(userToUnblock)}
              className="bg-[#198A00] hover:bg-[#198A00]/90"
            >
              Unblock
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}