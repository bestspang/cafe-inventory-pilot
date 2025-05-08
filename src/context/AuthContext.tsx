
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from '@/types';
import { Profile } from '@/types/supabase-types';
import { toast } from '@/components/ui/sonner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  session: Session | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state change:', event, currentSession?.user?.email);
        setSession(currentSession);
        if (currentSession?.user) {
          // Only update user state here, fetch profile in a separate effect
          setUser(prevUser => currentSession?.user ? {
            ...prevUser,
            id: currentSession.user.id,
            email: currentSession.user.email || '',
          } : null);
        } else {
          setUser(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log('Initial session check:', currentSession?.user?.email);
      setSession(currentSession);
      if (currentSession?.user) {
        setUser(prevUser => currentSession?.user ? {
          ...prevUser,
          id: currentSession.user.id,
          email: currentSession.user.email || '',
        } : null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user profile when session/user changes
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) throw error;
        
        if (data) {
          setUser(prevUser => prevUser ? {
            ...prevUser,
            name: data.name || '',
            role: data.role as UserRole,
            branchId: data.branch_id || '',
          } : null);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    if (user?.id && (!user.name || !user.role)) {
      fetchUserProfile();
    }
  }, [user?.id]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Auth state listener will handle updating the user
    } catch (error: any) {
      toast.error('Login failed', {
        description: error.message || 'Invalid credentials',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      // Auth state listener will handle clearing the user
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!session,
    session,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
