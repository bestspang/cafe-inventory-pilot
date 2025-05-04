
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/sonner';
import { User, Key } from 'lucide-react';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [autoSubmitting, setAutoSubmitting] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const formRef = React.useRef<HTMLFormElement>(null);

  // Handle auto-submit when demo credentials are filled
  useEffect(() => {
    if (autoSubmitting && formRef.current) {
      const timer = setTimeout(() => {
        formRef.current?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        setAutoSubmitting(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [autoSubmitting]);

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

  const fillDemoCredentials = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setAutoSubmitting(true); // Trigger auto-submit
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
        <form ref={formRef} onSubmit={handleSubmit}>
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
              <p className="text-center font-medium mb-2">
                Demo Accounts
              </p>
              <div className="grid gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => fillDemoCredentials('owner@cafeapp.com')}
                >
                  <User className="mr-2" size={14} />
                  <span className="font-medium">Owner</span>
                  <span className="ml-auto text-xs text-muted-foreground">owner@cafeapp.com</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => fillDemoCredentials('manager@cafeapp.com')}
                >
                  <User className="mr-2" size={14} />
                  <span className="font-medium">Manager</span>
                  <span className="ml-auto text-xs text-muted-foreground">manager@cafeapp.com</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => fillDemoCredentials('staff@cafeapp.com')}
                >
                  <User className="mr-2" size={14} />
                  <span className="font-medium">Staff</span>
                  <span className="ml-auto text-xs text-muted-foreground">staff@cafeapp.com</span>
                </Button>
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
