import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Users, GitCompare, ClipboardList, BarChart3, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Sidebar: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Home className="h-5 w-5" /> },
    { name: 'Players', path: '/players', icon: <Users className="h-5 w-5" /> },
    { name: 'Team Balancer', path: '/team-balancer', icon: <GitCompare className="h-5 w-5" /> },
    { name: 'Match Logger', path: '/match-logger', icon: <ClipboardList className="h-5 w-5" /> },
    { name: 'Statistics', path: '/statistics', icon: <BarChart3 className="h-5 w-5" /> },
  ];

  const handleSignOut = async () => {
    await signOut();
    toast.success('Logged out successfully');
    navigate('/auth');
  };

  const handleSignIn = () => {
    navigate('/auth');
  };

  return (
    <aside className="bg-sidebar text-sidebar-foreground w-64 flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold flex items-center">
          <img 
            src="/favicon.svg" 
            alt="RallyRank Logo" 
            className="h-8 w-8 mr-2"
          />
          RallyRank
        </h1>
      </div>
      <nav className="flex-1 px-4 pb-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-md hover:bg-sidebar-accent transition-colors ${
                    isActive ? 'bg-sidebar-accent font-medium' : ''
                  }`
                }
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="px-4 py-6 border-t border-sidebar-border mt-auto">
        {user ? (
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
              <div className="ml-3 flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{user.email}</p>
                <p className="text-xs opacity-75 truncate">Logged in</p>
              </div>
            </div>
            <Button 
              variant="destructive" 
              className="w-full flex items-center justify-center" 
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        ) : (
          <Button 
            variant="default" 
            className="w-full flex items-center justify-center" 
            onClick={handleSignIn}
          >
            <LogIn className="mr-2 h-4 w-4" />
            Sign In
          </Button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
