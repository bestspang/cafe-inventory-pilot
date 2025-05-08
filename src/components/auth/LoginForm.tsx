
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
import { Separator } from "@/components/ui/separator";
import { supabase } from '@/integrations/supabase/client';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [autoSubmitting, setAutoSubmitting] = useState(false);
  const {
    login,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const formRef = React.useRef<HTMLFormElement>(null);

  // Handle auto-submit when demo credentials are filled
  useEffect(() => {
    if (autoSubmitting && formRef.current) {
      const timer = setTimeout(() => {
        formRef.current?.dispatchEvent(new Event('submit', {
          cancelable: true,
          bubbles: true
        }));
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
        description: 'Welcome back to Café Inventory!'
      });
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      console.error('Login error:', err);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) {
        setError(error.message);
        console.error('Google sign-in error:', error);
      }
    } catch (err: any) {
      setError(err.message || 'Google authentication failed');
      console.error('Google sign-in error:', err);
    }
  };

  const fillDemoCredentials = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setAutoSubmitting(true); // Trigger auto-submit
  };

  return <Card className="w-full max-w-md mx-auto animate-scale-in">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {isSignUp ? 'Create Account' : 'Welcome Back!'}
        </CardTitle>
        <CardDescription>
          {isSignUp ? 'Sign up to access your cafe inventory system' : 'Login to access your inventory system'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>}
        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" disabled={loading} className="mt-2">
              {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
            
            <div className="relative my-3">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-muted-foreground">
                OR
              </span>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              disabled={loading} 
              onClick={handleGoogleSignIn}
              className="flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 186.69 190.5">
                <g transform="translate(1184.583 765.171)">
                  <path d="M-1089.333-687.239v36.888h51.262c-2.251 11.863-9.006 21.908-19.137 28.662l30.913 23.986c18.011-16.625 28.402-41.044 28.402-70.052 0-6.754-.606-13.249-1.732-19.483z" fill="#4285f4"/>
                  <path d="M-1142.714-651.791l-6.972 5.337-24.679 19.223h0c15.673 31.086 47.796 52.561 85.03 52.561 25.717 0 47.278-8.486 63.038-23.033l-30.913-23.986c-8.486 5.715-19.31 9.179-32.125 9.179-24.765 0-45.806-16.712-53.34-39.226z" fill="#34a853"/>
                  <path d="M-1174.365-712.61c-6.494 12.815-10.217 27.276-10.217 42.689s3.723 29.874 10.217 42.689c0 .086 31.693-24.592 31.693-24.592-1.905-5.715-3.031-11.776-3.031-18.098s1.126-12.383 3.031-18.098z" fill="#fbbc05"/>
                  <path d="M-1089.333-727.244c14.028 0 26.497 4.849 36.455 14.201l27.276-27.276c-16.539-15.413-38.013-24.852-63.731-24.852-37.234 0-69.359 21.388-85.032 52.561l31.692 24.592c7.533-22.514 28.575-39.226 53.34-39.226z" fill="#ea4335"/>
                </g>
              </svg>
              Sign in with Google
            </Button>
            
            <div className="text-sm text-muted-foreground mt-2">
              <p className="text-center font-medium mb-2">
                Demo Accounts
              </p>
              <div className="grid gap-2">
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => fillDemoCredentials('owner@cafeapp.com')}>
                  <User className="mr-2" size={14} />
                  <span className="font-medium">Owner</span>
                  <span className="ml-auto text-xs text-muted-foreground">owner@cafeapp.com</span>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => fillDemoCredentials('manager@cafeapp.com')}>
                  <User className="mr-2" size={14} />
                  <span className="font-medium">Manager</span>
                  <span className="ml-auto text-xs text-muted-foreground">manager@cafeapp.com</span>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => fillDemoCredentials('staff@cafeapp.com')}>
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
        <Button variant="link" onClick={() => setIsSignUp(!isSignUp)} className="mb-2">
          {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
        </Button>
        <p className="text-sm text-muted-foreground">Cafe Inventory System v0.0.1</p>
      </CardFooter>
    </Card>;
};

export default LoginForm;
