
import React, { useEffect } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import LoadingScreen from '@/components/layout/LoadingScreen';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Check if user is already authenticated and redirect if necessary
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-cafe-100 to-cafe-50 p-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-cafe-800 mb-2">Good Inventory</h1>
        <p className="text-cafe-600">Manage your inventory with ease</p>
      </div>
      <LoginForm />
    </div>
  );
};

export default Login;
