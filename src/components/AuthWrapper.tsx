import { useState, useEffect } from 'react';
import { supabase, getCurrentUser } from '../utils/supabase/client';
import { Login } from './Login';
import { Signup } from './Signup';

interface User {
  id: string;
  email?: string;
  user_metadata?: any;
}

interface AuthWrapperProps {
  children: (user: User) => React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    // Check for existing session
    getCurrentUser().then((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#EF7D00] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return showSignup ? (
      <Signup onSuccess={(newUser) => setUser(newUser)} onSwitchToLogin={() => setShowSignup(false)} />
    ) : (
      <Login onSuccess={(loggedInUser) => setUser(loggedInUser)} onSwitchToSignup={() => setShowSignup(true)} />
    );
  }

  return <>{children(user)}</>;
}