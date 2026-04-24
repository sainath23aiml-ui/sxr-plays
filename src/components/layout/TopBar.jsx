import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, ChevronLeft, ChevronRight, Home, Library, Info, Languages, BarChart2, X, Play, Heart } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { searchAll, decodeHtml } from '../../api/saavn';
import usePlayerStore from '../../store/playerStore';
import Logo from '../ui/Logo';

const TopBar = ({ onToggleRightPanel }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef(null);
  const { setSong, setQueue } = usePlayerStore();

  useEffect(() => {
    const fetchSuggestions = async () => {
      const q = query.trim();
      if (q.length > 0) {
        try {
          const res = await searchAll(q);
          if (res.success && res.data) {
            setSuggestions(res.data);
            setShowSuggestions(true);
          } else {
             setSuggestions(null);
             setShowSuggestions(false);
          }
        } catch (err) {
          console.error("Suggestion error:", err);
        }
      } else {
        setSuggestions(null);
        setShowSuggestions(false);
      }
    };
    const timer = setTimeout(fetchSuggestions, 150); // Faster trigger
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (item, type) => {
    if (type === 'songs') {
      setSong(item);
      setQueue([item], 0);
    } else if (type === 'albums') {
      navigate(`/album/${item.id}`);
    } else if (type === 'artists') {
      navigate(`/artist/${item.id}`);
    }
    setShowSuggestions(false);
    setQuery('');
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Search', path: '/search', icon: Search },
    { name: 'Library', path: '/library', icon: Library },
    { name: 'Liked', path: '/liked', icon: Heart },
    { name: 'Discover', path: '/discover', icon: Languages },
    { name: 'Stats', path: '/stats', icon: BarChart2 },
  ];

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-black/90 backdrop-blur-xl sticky top-0 z-[999] gap-8 border-b border-white/5">
      <div className="flex items-center gap-4 shrink-0">
        <Logo className="xl:hidden scale-75 -ml-4" />
        
        <div className="hidden sm:flex items-center gap-2 mr-4">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-text-subdued hover:text-white transition-colors"><ChevronLeft size={24} /></button>
          <button onClick={() => navigate(1)} className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-text-subdued hover:text-white transition-colors"><ChevronRight size={24} /></button>
        </div>

        <nav className="hidden xl:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.name} to={link.path} className={clsx("flex items-center gap-2 px-4 py-2 rounded-full text-[14px] font-bold transition-all", location.pathname === link.path ? "bg-white text-black shadow-lg" : "text-text-subdued hover:text-white hover:bg-white/5")}>
              <link.icon size={18} />
              {link.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="relative flex-1 max-w-2xl mx-auto" ref={dropdownRef}>
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-subdued z-10 pointer-events-none"><Search size={20} /></div>
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleSearch}
          onFocus={() => query.length > 0 && setShowSuggestions(true)}
          placeholder="What do you want to play?" 
          className="w-full h-11 pl-12 pr-12 bg-[#242424] hover:bg-[#2a2a2a] border border-transparent focus:border-white/30 focus:bg-[#2c2c2c] rounded-full text-[15px] font-medium text-white focus:outline-none transition-all shadow-inner"
        />
        {query && (
          <button onClick={() => { setQuery(''); setSuggestions(null); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-subdued hover:text-white z-10"><X size={20} /></button>
        )}

        {/* Suggestions Dropdown - ENSURED HIGH Z-INDEX AND VISIBILITY */}
        {showSuggestions && suggestions && (
          <div className="absolute top-[calc(100%+8px)] left-[-10vw] sm:left-0 w-[120vw] sm:w-full max-w-[100vw] sm:max-w-none bg-[#181818] border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden animate-fade-in max-h-[75vh] overflow-y-auto z-[1000]">
            {suggestions.songs?.results?.length > 0 && (
              <div className="p-2">
                <h4 className="px-4 py-3 text-[11px] font-black text-text-subdued uppercase tracking-[0.2em]">Songs</h4>
                {suggestions.songs.results.slice(0, 6).map(song => (
                  <div key={song.id} onClick={() => handleSelectSuggestion(song, 'songs')} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/10 cursor-pointer group transition-colors">
                    <div className="relative w-12 h-12 shrink-0">
                      <img src={song.image?.[0]?.url} className="w-full h-full rounded shadow-md object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Play size={16} fill="white" /></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-bold text-white truncate">{decodeHtml(song.name || song.title)}</p>
                      <p className="text-[13px] text-text-subdued truncate group-hover:text-white">{decodeHtml(song.artists?.primary?.[0]?.name || song.artists?.all?.[0]?.name || song.subtitle)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {suggestions.artists?.results?.length > 0 && (
              <div className="p-2 border-t border-white/5">
                <h4 className="px-4 py-3 text-[11px] font-black text-text-subdued uppercase tracking-[0.2em]">Artists</h4>
                {suggestions.artists.results.slice(0, 4).map(artist => (
                  <div key={artist.id} onClick={() => handleSelectSuggestion(artist, 'artists')} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/10 cursor-pointer group transition-colors">
                    <img src={artist.image?.[0]?.url || artist.image?.[0]} className="w-12 h-12 rounded-full shadow-md object-cover shrink-0" />
                    <p className="text-[15px] font-bold text-white truncate group-hover:text-accent-green">{decodeHtml(artist.name || artist.title)}</p>
                  </div>
                ))}
              </div>
            )}
            {!suggestions.songs?.results?.length && !suggestions.artists?.results?.length && (
              <div className="p-8 text-center text-text-subdued italic">No instant matches found. Press Enter to search deeper.</div>
            )}
          </div>
        )}
      </div>

      <div className="hidden sm:flex items-center gap-4 shrink-0">
        <button onClick={onToggleRightPanel} className="p-2.5 rounded-full bg-[#242424] text-text-subdued hover:text-white hover:bg-[#2c2c2c] transition-all"><Info size={22} /></button>
        <button className="p-2.5 rounded-full bg-[#242424] text-text-subdued hover:text-white hover:bg-[#2c2c2c] transition-all relative" onClick={() => navigate('/stats')}>
          <Bell size={22} />
          <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-accent-green rounded-full border-2 border-black" />
        </button>
        <div className="w-10 h-10 ml-2 rounded-full bg-gradient-to-br from-accent-green to-emerald-600 text-black flex items-center justify-center font-black hover:scale-110 transition-all text-[15px] shadow-lg cursor-pointer">S</div>
      </div>
    </header>
  );
};

export default TopBar;
