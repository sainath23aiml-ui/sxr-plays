import React, { useState } from 'react';
import { Home, Search, Library, Plus, Heart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import usePlayerStore from '../../store/playerStore';
import Logo from '../ui/Logo';

const Sidebar = () => {
  const location = useLocation();
  const [showImport, setShowImport] = useState(null);
  const { playlists, createPlaylist, likedSongs } = usePlayerStore();

  const handleCreatePlaylist = () => {
    const defaultName = `My Playlist #${playlists.length + 1}`;
    const name = window.prompt("Enter playlist name:", defaultName);
    if (name && name.trim()) {
      createPlaylist(name.trim());
    }
  };

  return (
    <aside className="w-[300px] h-full hidden lg:flex flex-col gap-2 p-2 bg-black text-text-muted select-none">
      {/* Brand Header */}
      <div className="bg-[#121212] rounded-lg p-6 mb-1">
        <Logo />
      </div>

      {/* Top Nav Block */}
      <div className="bg-[#121212] rounded-lg p-3 flex flex-col gap-2">
        <Link 
          to="/" 
          className={clsx("flex items-center gap-4 px-3 py-3 font-bold transition-colors hover:text-white", location.pathname === '/' ? "text-white" : "")}
        >
          <Home size={24} />
          Home
        </Link>
        <Link 
          to="/search" 
          className={clsx("flex items-center gap-4 px-3 py-3 font-bold transition-colors hover:text-white", location.pathname === '/search' ? "text-white" : "")}
        >
          <Search size={24} />
          Search
        </Link>
      </div>

      {/* Library Block */}
      <div className="bg-[#121212] rounded-lg flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 shadow-md z-10">
          <Link 
            to="/library" 
            className="flex items-center gap-3 font-bold hover:text-white transition-colors"
          >
            <Library size={24} />
            Your Library
          </Link>
          <div className="flex items-center gap-1">
            <button 
              onClick={handleCreatePlaylist}
              className="p-1.5 hover:bg-[#1a1a1a] text-text-subdued hover:text-white rounded-full transition-colors"
              title="Create Playlist"
            >
              <Plus size={20} />
            </button>
            <button 
              onClick={() => setShowImport('spotify')}
              className="p-1.5 hover:bg-accent-green/20 text-text-subdued hover:text-accent-green rounded-full transition-colors"
              title="Import from Spotify"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
            </button>
            <button 
              onClick={() => setShowImport('youtube')}
              className="p-1.5 hover:bg-red-500/20 text-text-subdued hover:text-red-500 rounded-full transition-colors"
              title="Import from YouTube"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="fill-current"><path d="M2.5 7.1c.3-1.2 1.3-2.1 2.5-2.4C8.4 4.1 12 4.1 12 4.1s3.6 0 7 .6c1.2.3 2.2 1.2 2.5 2.4.6 2.3.6 7.1.6 7.1s0 4.8-.6 7.1c-.3 1.2-1.3 2.1-2.5 2.4-3.4.6-7 .6-7 .6s-3.6 0-7-.6c-1.2-.3-2.2-1.2-2.5-2.4-.6-2.3-.6-7.1-.6-7.1s0-4.8.6-7.1z"/><path d="M9.7 15.8l6.5-3.6-6.5-3.6v7.2z" fill="#121212" stroke="none"/></svg>
            </button>
          </div>
        </div>

        {/* Scrollable Library Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-2">
          {/* Liked Songs */}
          <Link 
            to="/liked" 
            className={clsx(
              "flex items-center gap-3 p-2 rounded-md hover:bg-[#1a1a1a] transition-colors group cursor-pointer",
              location.pathname === '/liked' ? "bg-[#282828] text-white" : ""
            )}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-800 rounded-md flex items-center justify-center shrink-0">
              <Heart size={20} className="text-white fill-white" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className={clsx("font-semibold truncate", location.pathname === '/liked' ? "text-white" : "group-hover:text-white")}>Liked Songs</span>
              <span className="text-sm text-text-muted flex items-center gap-1">
                <span className="text-accent-green">★</span> {likedSongs.length} songs
              </span>
            </div>
          </Link>

          {/* User Playlists */}
          {playlists.map(playlist => (
            <div 
              key={playlist.id}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-[#1a1a1a] transition-colors group cursor-pointer mt-1"
            >
              <div className="w-12 h-12 bg-[#282828] rounded-md flex items-center justify-center shrink-0 text-white font-black text-xl">
                {playlist.name.charAt(0)}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="font-semibold group-hover:text-white truncate">{playlist.name}</span>
                <span className="text-sm text-text-muted">Playlist • {playlist.songs.length} songs</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Footer Attribution */}
      <div className="px-6 py-4 flex flex-col gap-1 opacity-40 hover:opacity-100 transition-opacity">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase">Built with Power</p>
        <p className="text-[11px] font-black text-white tracking-widest uppercase">Created by <span className="text-[#00ff88]">Sainath</span></p>
      </div>

      {showImport && <SpotifyImportModal type={showImport} onClose={() => setShowImport(null)} />}
    </aside>
  );
};

export default Sidebar;
