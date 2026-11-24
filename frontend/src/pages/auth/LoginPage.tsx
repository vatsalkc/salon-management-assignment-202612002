import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Scissors, AlertCircle, Sparkles, User, Shield, Briefcase, UserCheck } from 'lucide-react';
import { Role } from '../../types';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const user = await login({ email, password });
      redirectByRole(user.role);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const redirectByRole = (role: Role) => {
    switch (role) {
      case 'OWNER':
        navigate('/owner');
        break;
      case 'RECEPTIONIST':
        navigate('/reception');
        break;
      case 'BARBER':
        navigate('/barber');
        break;
      default:
        navigate('/');
        break;
    }
  };

  const handleQuickLogin = async (demoEmail: string) => {
    setError(null);
    setIsSubmitting(true);
    setEmail(demoEmail);
    setPassword('password123');

    try {
      const user = await login({ email: demoEmail, password: 'password123' });
      redirectByRole(user.role);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Quick login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <Scissors className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Elite Cuts Salon</h1>
          <p className="text-sm text-muted-foreground">Sign in to access your queue and dashboard</p>
        </div>

        {/* Login Card */}
        <Card className="border-border/60 shadow-xl backdrop-blur-sm bg-card/95">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Sign in</CardTitle>
            <CardDescription>Enter your email and password below</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or demo accounts</span>
              </div>
            </div>

            {/* Quick Demo Login Grid */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="justify-start text-xs h-9"
                onClick={() => handleQuickLogin('owner@salon.com')}
                disabled={isSubmitting}
              >
                <Shield className="h-3.5 w-3.5 mr-1.5 text-primary" />
                Owner
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="justify-start text-xs h-9"
                onClick={() => handleQuickLogin('reception@salon.com')}
                disabled={isSubmitting}
              >
                <UserCheck className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                Receptionist
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="justify-start text-xs h-9"
                onClick={() => handleQuickLogin('james@salon.com')}
                disabled={isSubmitting}
              >
                <Briefcase className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
                Barber (James)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="justify-start text-xs h-9"
                onClick={() => handleQuickLogin('john@example.com')}
                disabled={isSubmitting}
              >
                <User className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                Customer
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-2 border-t border-border/50 pt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-primary hover:underline">
                Create an account
              </Link>
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-1">
              <Link to="/tv" className="hover:text-foreground underline">
                Open TV Display
              </Link>
              <span>•</span>
              <Link to="/" className="hover:text-foreground underline">
                Customer Queue
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
