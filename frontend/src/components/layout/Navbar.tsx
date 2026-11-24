import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Moon, Sun, LogOut, Scissors, Tv, User as UserIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleBadgeVariant = (role?: string) => {
    switch (role) {
      case 'OWNER':
        return 'default';
      case 'RECEPTIONIST':
        return 'secondary';
      case 'BARBER':
        return 'success';
      default:
        return 'outline';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight hover:opacity-90 transition-opacity">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Scissors className="h-5 w-5" />
          </div>
          <span className="hidden sm:inline-block">Elite Cuts</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium ml-1">
            Queue SaaS
          </span>
        </Link>

        {/* Center / TV link */}
        <div className="flex items-center gap-2">
          <Link to="/tv" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
              <Tv className="h-4 w-4" />
              <span className="hidden md:inline">TV Screen</span>
            </Button>
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 rounded-lg"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-border/60">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-foreground leading-tight">{user.name}</span>
                <span className="text-[10px] text-muted-foreground leading-tight">{user.role}</span>
              </div>
              <Badge variant={roleBadgeVariant(user.role) as any} className="text-[10px] uppercase font-bold tracking-wider">
                {user.role}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-9 w-9 rounded-lg text-muted-foreground hover:text-destructive"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
