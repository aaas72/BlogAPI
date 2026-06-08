import { useState } from 'react';
import { Menu, Sun, Moon, User, Search, ChevronDown, X } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Navbar({ onOpenAuthModal, onOpenAuthorPanel }) {
  const { user, logout, searchPosts } = useApp();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchPosts(searchQuery.trim());
      navigate('/');
    }
  };

  const navLinks = [
    'HOME',
    'CULTURE',
    'ECONOMY',
    'POLITICS',
    'SCIENCE',
    'TECHNOLOGY',
    'TRAVEL',
    'WORLD',
    'ABOUT',
    'CONTACT'
  ];

  return (
    <header className="w-full bg-black text-white border-b border-neutral-900 select-none">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* TOP ROW */}
        <div className="flex items-center justify-between py-6 md:py-8 border-b border-neutral-800">
          
          {/* Left: Hamburger Menu & Theme Switcher */}
          <div className="flex items-center gap-4 md:gap-6 flex-1 justify-start">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 hover:bg-neutral-900 rounded-full transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              <Menu size={20} className="text-neutral-200 hover:text-white" />
            </button>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1.5 hover:bg-neutral-900 rounded-full transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Sun size={18} className="text-neutral-300 hover:text-white" />
              ) : (
                <Moon size={18} className="text-neutral-300 hover:text-white" />
              )}
            </button>
          </div>

          {/* Center: Brand Identity */}
          <Link to="/" className="flex flex-col items-center text-center group">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-signature font-normal text-white select-text group-hover:text-neutral-200 transition-colors">
              Daily Pulse
            </h1>
            <p className="text-[10px] md:text-xs text-neutral-400 font-sans tracking-[0.25em] uppercase mt-1.5 select-text">
              All voices matter
            </p>
          </Link>

          {/* Right: Sign In & Subscribe */}
          <div className="flex items-center gap-4 md:gap-6 flex-1 justify-end">
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-1 text-xs md:text-sm font-bold text-neutral-300 hover:text-white transition-colors cursor-pointer">
                  <User size={15} className="mr-0.5 text-neutral-400" />
                  <span className="hidden sm:inline">{user.name}</span>
                  <ChevronDown size={12} className="text-neutral-500 group-hover:text-white transition-colors" />
                </button>
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-2 w-44 bg-neutral-900 border border-neutral-800 rounded-none shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                  <button 
                    onClick={onOpenAuthorPanel}
                    className="w-full text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-neutral-300 hover:text-white hover:bg-neutral-850 transition-colors cursor-pointer"
                  >
                    Dashboard
                  </button>
                  <button 
                    onClick={logout}
                    className="w-full text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-red-400 hover:text-red-300 hover:bg-neutral-850 transition-colors border-t border-neutral-850 cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={onOpenAuthModal}
                className="flex items-center gap-2 text-xs md:text-sm font-medium text-neutral-300 hover:text-white transition-colors cursor-pointer"
              >
                <User size={16} />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
            <button className="bg-white text-black text-xs md:text-sm font-semibold px-4 md:px-5 py-2 hover:bg-neutral-200 active:scale-95 transition-all duration-200 cursor-pointer">
              Subscribe Now
            </button>
          </div>

        </div>

        {/* BOTTOM ROW (Desktop Navigation) */}
        <div className="flex items-center justify-between py-3.5">
          
          {/* Search Icon & Input */}
          <div className="flex items-center gap-2 flex-none">
            {isSearchOpen ? (
              <form onSubmit={handleSearchSubmit} className="flex items-center border border-neutral-800 bg-neutral-950 px-2.5 py-1">
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-0 text-white text-xs outline-none w-32 sm:w-48"
                  autoFocus
                />
                <button type="submit" className="p-0.5 text-neutral-400 hover:text-white cursor-pointer">
                  <Search size={14} />
                </button>
                <button 
                  type="button" 
                  onClick={() => { setIsSearchOpen(false); setSearchQuery(''); searchPosts(''); }}
                  className="p-0.5 text-neutral-400 hover:text-white cursor-pointer ml-1"
                >
                  <X size={14} />
                </button>
              </form>
            ) : (
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-1.5 hover:bg-neutral-900 rounded-full transition-colors cursor-pointer flex-none"
                title="Search Articles"
              >
                <Search size={18} className="text-neutral-300 hover:text-white" />
              </button>
            )}
          </div>

          {/* Nav Links Container */}
          <nav className="flex-1 overflow-x-auto px-4 scrollbar-none">
            <ul className="flex items-center justify-start md:justify-center gap-6 md:gap-8 whitespace-nowrap min-w-max mx-auto">
              {navLinks.map((link) => (
                <li key={link}>
                  <NavLink
                    to={link === 'HOME' ? '/' : `/${link.toLowerCase()}`}
                    className={({ isActive }) => 
                      `text-[11px] font-sans font-bold tracking-wider cursor-pointer transition-colors duration-150 uppercase ${
                        isActive 
                          ? 'text-white border-b-2 border-white pb-0.5' 
                          : 'text-neutral-400 hover:text-white'
                      }`
                    }
                  >
                    {link}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Language Selector */}
          <button className="flex items-center gap-1 text-[11px] font-bold text-neutral-300 hover:text-white transition-colors cursor-pointer flex-none ml-2">
            <span>EN</span>
            <ChevronDown size={14} className="text-neutral-400" />
          </button>

        </div>

      </div>

      {/* MOBILE DRAWER MENU */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col p-6 animate-fade-in">
          {/* Close button & header */}
          <div className="flex items-center justify-between pb-6 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <span className="text-xl">✍️</span>
              <span className="font-signature text-2xl text-white">Daily Pulse</span>
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 hover:bg-neutral-900 rounded-full transition-colors"
            >
              <X size={20} className="text-neutral-200" />
            </button>
          </div>

          {/* Navigation Links list */}
          <nav className="flex-1 py-8 overflow-y-auto">
            <ul className="flex flex-col gap-6 text-left">
              {navLinks.map((link) => (
                <li key={link}>
                  <NavLink
                    to={link === 'HOME' ? '/' : `/${link.toLowerCase()}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) => 
                      `text-xl font-sans font-semibold tracking-wide uppercase block w-full text-left py-1 pl-3 ${
                        isActive ? 'text-white border-l-4 border-white' : 'text-neutral-400'
                      }`
                    }
                  >
                    {link}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer of Drawer */}
          <div className="border-t border-neutral-800 pt-6 space-y-4">
            {user ? (
              <>
                <button 
                  onClick={() => { setIsMobileMenuOpen(false); onOpenAuthorPanel(); }}
                  className="w-full flex items-center justify-center gap-2 border border-neutral-800 py-3 text-sm font-semibold rounded hover:bg-neutral-900 transition-colors cursor-pointer"
                >
                  <User size={18} />
                  <span>Author Dashboard</span>
                </button>
                <button 
                  onClick={() => { setIsMobileMenuOpen(false); logout(); }}
                  className="w-full border border-red-900/30 bg-red-950/20 text-red-400 py-3 text-sm font-semibold rounded hover:bg-red-950/40 transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button 
                onClick={() => { setIsMobileMenuOpen(false); onOpenAuthModal(); }}
                className="w-full flex items-center justify-center gap-2 border border-neutral-800 py-3 text-sm font-semibold rounded hover:bg-neutral-900 transition-colors cursor-pointer"
              >
                <User size={18} />
                <span>Sign In to Account</span>
              </button>
            )}
            <button className="w-full bg-white text-black py-3 text-sm font-semibold hover:bg-neutral-200 transition-colors cursor-pointer">
              Subscribe Now
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
