
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import LoadingScreen from '@/components/layout/LoadingScreen';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (loading) return; // Wait for auth to be determined
    
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [navigate, isAuthenticated, loading]);

  return <LoadingScreen />;
};

export default Index;
