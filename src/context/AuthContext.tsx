
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data for demo purposes
const mockUsers: User[] = [
  {
    id: '1',
    email: 'owner@cafeapp.com',
    name: 'John Owner',
    role: 'owner' as UserRole,
    branchId: '1'
  },
  {
    id: '2',
    email: 'manager@cafeapp.com',
    name: 'Sarah Manager',
    role: 'manager' as UserRole,
    branchId: '1'
  },
  {
    id: '3',
    email: 'staff@cafeapp.com',
    name: 'Mike Staff',
    role: 'staff' as UserRole,
    branchId: '1'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved user in local storage
    const savedUser = localStorage.getItem('cafe-app-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Mock authentication process
      const user = mockUsers.find(u => u.email === email);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // In a real app, this would verify the password with a backend
      // For demo purposes, we'll just accept any password

      // Save user to local storage
      localStorage.setItem('cafe-app-user', JSON.stringify(user));
      setUser(user);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('cafe-app-user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
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
