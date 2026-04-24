import React from 'react';
import { Home, Search, Library, Languages, BarChart2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';

const MobileBottomNav = () => {
  const location = useLocation();
  
  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Search', path: '/search', icon: Search },
    { name: 'Your Library', path: '/library', icon: Library },
    { name: 'Discover', path: '/discover', icon: Languages },
    { name: 'Stats', path: '/stats', icon: BarChart2 },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-[64px] bg-black/95 backdrop-blur-xl border-t border-transparent flex items-center justify-around px-2 z-[900]">
      {navLinks.map((link) => {
        const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
        return (
          <Link 
            key={link.name} 
            to={link.path} 
            className={clsx(
              "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
              isActive ? "text-white" : "text-white/60 hover:text-white"
            )}
          >
            <link.icon size={22} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "fill-white" : "fill-none"} />
            <span className="text-[9px] font-medium tracking-wide truncate max-w-full px-1">{link.name}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
