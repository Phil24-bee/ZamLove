import { useState } from 'react';
import { Heart, Mail, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';
import { motion } from 'motion/react';

interface ForgotPasswordProps {
  onBack: () => void;
}

export function ForgotPassword({ onBack }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });

      if (error) throw error;

      toast.success('Password reset email sent!');
      setSent(true);
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700">
          {/* Back Button */}
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="mb-4 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="relative">
              <Heart className="w-12 h-12 text-[#EF7D00] fill-[#EF7D00]" />
              <Sparkles className="w-5 h-5 text-[#198A00] absolute -top-1 -right-1" />
            </div>
            <div>
              <h1 className="text-gray-900 dark:text-gray-100 leading-none">ZamLove</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Find your match</p>
            </div>
          </div>

          {!sent ? (
            <>
              <h2 className="text-center text-gray-700 dark:text-gray-300 mb-2">Forgot Password?</h2>
              <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-6">
                No worries! Enter your email and we'll send you reset instructions.
              </p>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#EF7D00] to-[#198A00] hover:from-[#EF7D00]/90 hover:to-[#198A00]/90 text-white"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#EF7D00] to-[#198A00] rounded-full mx-auto flex items-center justify-center">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-gray-900 dark:text-gray-100">Check your email</h2>
              <p className="text-gray-600 dark:text-gray-400">
                We've sent password reset instructions to <span className="font-medium text-[#EF7D00]">{email}</span>
              </p>
              <Button
                onClick={onBack}
                variant="outline"
                className="w-full mt-4"
              >
                Back to Login
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
