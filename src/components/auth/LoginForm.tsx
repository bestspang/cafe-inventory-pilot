
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/sonner';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      if (isSignUp) {
        // In a real implementation, we would handle signup here
        toast.error('Sign up is not implemented yet');
        return;
      }
      
      await login(email, password);
      navigate('/dashboard');
      toast.success('Login successful', {
        description: 'Welcome back to Café Inventory!',
      });
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      console.error('Login error:', err);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto animate-scale-in">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {isSignUp ? 'Create Account' : 'Welcome Back!'}
        </CardTitle>
        <CardDescription>
          {isSignUp 
            ? 'Sign up to access your cafe inventory system'
            : 'Login to access your cafe inventory system'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="mt-2">
              {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
            
            <div className="text-sm text-muted-foreground mt-2">
              <p className="text-center">
                Demo Accounts:
              </p>
              <div className="flex flex-col gap-1 mt-2 text-xs">
                <div className="flex justify-between">
                  <span>Email: owner@cafeapp.com</span>
                  <span>Password: password123</span>
                </div>
                <div className="flex justify-between">
                  <span>Email: manager@cafeapp.com</span>
                  <span>Password: password123</span>
                </div>
                <div className="flex justify-between">
                  <span>Email: staff@cafeapp.com</span>
                  <span>Password: password123</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col border-t pt-4">
        <Button 
          variant="link" 
          onClick={() => setIsSignUp(!isSignUp)} 
          className="mb-2"
        >
          {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
        </Button>
        <p className="text-sm text-muted-foreground">Cafe Inventory System v1.0</p>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
