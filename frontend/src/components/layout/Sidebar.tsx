import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import {
  Users,
  LayoutDashboard,
  Scissors,
  UserCheck,
  Settings,
  BarChart3,
  Clock,
  Tv,
  ListOrdered,
} from 'lucide-react';

interface SidebarItem {
  title: string;
  path: string;
  icon: React.ElementType;
}

export function Sidebar() {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  let navItems: SidebarItem[] = [];

  if (role === 'OWNER') {
    navItems = [
      { title: 'Overview', path: '/owner', icon: LayoutDashboard },
      { title: 'Services', path: '/owner/services', icon: Scissors },
      { title: 'Barbers', path: '/owner/barbers', icon: Users },
      { title: 'Live Queue', path: '/reception', icon: ListOrdered },
      { title: 'Analytics', path: '/owner/analytics', icon: BarChart3 },
      { title: 'Settings', path: '/owner/settings', icon: Settings },
    ];
  } else if (role === 'RECEPTIONIST') {
    navItems = [
      { title: 'Queue Management', path: '/reception', icon: ListOrdered },
      { title: 'Barber Status', path: '/reception/barbers', icon: UserCheck },
    ];
  } else if (role === 'BARBER') {
    navItems = [
      { title: 'My Workstation', path: '/barber', icon: Scissors },
      { title: 'Queue Overview', path: '/reception', icon: ListOrdered },
    ];
  } else {
    // Customer
    navItems = [
      { title: 'Join Queue', path: '/', icon: Scissors },
      { title: 'My History', path: '/history', icon: Clock },
    ];
  }

  return (
    <aside className="w-64 border-r border-border/70 bg-sidebar/50 backdrop-blur-sm min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4">
      <div className="space-y-6">
        <div className="px-3 py-2">
          <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            {role} Portal
          </p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/owner' || item.path === '/reception' || item.path === '/barber' || item.path === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group select-none',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
                <span>{item.title}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom utility */}
      <div className="pt-4 border-t border-border/60">
        <NavLink
          to="/tv"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors"
        >
          <Tv className="h-4 w-4 text-primary" />
          <span>Launch TV Display</span>
        </NavLink>
      </div>
    </aside>
  );
}
