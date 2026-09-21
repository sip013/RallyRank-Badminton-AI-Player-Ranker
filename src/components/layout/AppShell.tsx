import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  Home,
  Users,
  GitCompare,
  ClipboardList,
  Trophy,
  Settings,
  LogOut,
  Plus,
  MoreHorizontal,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useClub } from '@/context/ClubContext';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import BrandMark from '@/components/BrandMark';

const desktopNav = [
  { name: 'Home', path: '/app', icon: Home, end: true, iconMood: 'home' },
  { name: 'Session', path: '/app/session', icon: GitCompare, iconMood: 'session' },
  { name: 'Matches', path: '/app/matches', icon: ClipboardList, iconMood: 'matches' },
  { name: 'Roster', path: '/app/roster', icon: Users, iconMood: 'roster' },
  { name: 'Ladder', path: '/app/ladder', icon: Trophy, iconMood: 'ladder' },
  { name: 'Settings', path: '/app/settings', icon: Settings, iconMood: 'settings' },
];

const mobileNav = [
  { name: 'Home', path: '/app', icon: Home, end: true, iconMood: 'home' },
  { name: 'Session', path: '/app/session', icon: GitCompare, iconMood: 'session' },
  { name: 'Log', path: '/app/matches/new', icon: Plus, primary: true, iconMood: 'log' },
  { name: 'Ladder', path: '/app/ladder', icon: Trophy, iconMood: 'ladder' },
  { name: 'More', path: '/app/settings', icon: MoreHorizontal, iconMood: 'more' },
];

const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, signOut } = useAuth();
  const { club, role, clubs, setActiveClubId } = useClub();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
    navigate('/auth');
  };

  return (
    <div className="court-lines min-h-screen">
      {/* Desktop rail */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-sidebar text-sidebar-foreground md:flex">
        <div className="group flex items-center gap-2 px-5 py-6">
          <BrandMark mood="app" className="h-8 w-8" />
          <span className="font-display text-xl font-bold tracking-tight">RallyRank</span>
        </div>

        {club && (
          <div className="mx-4 mb-4 rounded-lg bg-sidebar-accent px-3 py-2">
            <p className="truncate text-sm font-semibold">{club.name}</p>
            <p className="text-xs capitalize opacity-75">{role}</p>
            {clubs.length > 1 && (
              <Select value={club.id} onValueChange={setActiveClubId}>
                <SelectTrigger
                  className={cn(
                    'mt-2 h-8 border-white/15 bg-sidebar/50 text-xs text-sidebar-foreground',
                    'hover:bg-sidebar/70 focus:ring-white/30 focus:ring-offset-0'
                  )}
                >
                  <SelectValue placeholder="Switch club" />
                </SelectTrigger>
                <SelectContent>
                  {clubs.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        <nav className="flex-1 space-y-1 px-3">
          {desktopNav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'nav-chip flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm',
                  isActive
                    ? 'bg-sidebar-accent font-semibold'
                    : 'opacity-85 hover:bg-sidebar-accent/70'
                )
              }
            >
              <item.icon className={cn('nav-chip__icon h-5 w-5', `nav-chip__icon--${item.iconMood}`)} />
              <span className="nav-chip__label">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <p className="mb-2 truncate text-xs opacity-70">{user?.email}</p>
          <div className="flex gap-2">
            <Button
              asChild
              variant="secondary"
              size="sm"
              className="flex-1 bg-white/10 text-white hover:bg-white/20"
            >
              <Link to="/app/account">Account</Link>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/10 text-white hover:bg-white/20"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-surface/90 px-4 py-3 backdrop-blur md:hidden">
        <div className="group flex items-center gap-2">
          <BrandMark mood="mobile" className="h-7 w-7" />
          <div>
            <p className="font-display text-sm font-bold leading-none">RallyRank</p>
            <p className="text-xs text-muted-foreground">{club?.name || 'No club'}</p>
          </div>
        </div>
        <Link to="/app/account" className="text-xs font-medium text-court">
          Account
        </Link>
      </header>

      <main className="md:pl-60">
        <div className="page-container pb-24 md:pb-8">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur md:hidden">
        <ul className="grid grid-cols-5 gap-1 px-2 py-2">
          {mobileNav.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'nav-chip flex flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium',
                    item.primary
                      ? 'text-primary'
                      : isActive
                        ? 'text-court'
                        : 'text-muted-foreground'
                  )
                }
              >
                <span
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full',
                    item.primary && 'bg-court text-white'
                  )}
                >
                  <item.icon
                    className={cn('nav-chip__icon h-5 w-5', `nav-chip__icon--${item.iconMood}`)}
                  />
                </span>
                <span className="nav-chip__label">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default AppShell;
