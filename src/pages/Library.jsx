import React, { useState } from 'react';
import { Plus, Search, List, Library as LibraryIcon, Music, Play, Trash2, ChevronLeft, Heart, Download } from 'lucide-react';
import usePlayerStore from '../store/playerStore';
import useDownloadStore from '../store/downloadStore';
import { decodeHtml } from '../api/saavn';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';
import SpotifyImportModal from '../components/ui/SpotifyImportModal';

const Library = () => {
  const navigate = useNavigate();
  const { playlists, createPlaylist, deletePlaylist, removeSongFromPlaylist, setSong, setQueue, likedSongs } = usePlayerStore();
  const { downloadedSongs } = useDownloadStore();
  const [activePlaylistId, setActivePlaylistId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showImport, setShowImport] = useState(null); // 'spotify' | 'youtube' | null
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const activePlaylist = activePlaylistId === 'liked' 
    ? { name: 'Liked Songs', songs: likedSongs, id: 'liked' }
    : activePlaylistId === 'downloads'
    ? { name: 'Downloads', songs: downloadedSongs, id: 'downloads' }
    : playlists.find(p => p.id === activePlaylistId);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    const id = createPlaylist(newPlaylistName.trim());
    setActivePlaylistId(id);
    setNewPlaylistName('');
    setIsCreating(false);
  };

  const handlePlaySong = (song, list) => {
    setQueue(list, list.findIndex(s => s.id === song.id));
    setSong(song);
  };

  return (
    <div className="flex flex-col h-full min-h-screen p-8 bg-[#121212]">
      {activePlaylistId ? (
        <div className="flex flex-col gap-8 animate-fade-in -mx-8 px-8 relative">
          {/* Cinematic Blur Background */}
          <div className="absolute top-0 left-0 w-full h-[400px] -z-10 overflow-hidden pointer-events-none opacity-30">
            <div className={clsx(
              "w-full h-full blur-[100px] transform scale-150 origin-top",
              activePlaylistId === 'liked' ? "bg-gradient-to-br from-indigo-700 to-purple-400" : 
              activePlaylistId === 'downloads' ? "bg-gradient-to-br from-emerald-700 to-teal-400" :
              "bg-white/20"
            )} />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#121212]/80 to-[#121212]" />
          </div>

          {/* Playlist Detail Header */}
          <div className="flex items-end gap-8 pt-12 mb-8">
            <button onClick={() => setActivePlaylistId(null)} className="absolute top-4 left-8 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-colors z-20 shadow-lg"><ChevronLeft size={24} /></button>
            <div className={clsx(
              "w-48 h-48 md:w-64 md:h-64 shadow-[0_30px_60px_rgba(0,0,0,0.6)] flex items-center justify-center rounded-2xl md:rounded-[2rem] overflow-hidden relative group",
              activePlaylistId === 'liked' ? "bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" : 
              activePlaylistId === 'downloads' ? "bg-gradient-to-br from-emerald-600 to-teal-500" :
              "bg-gradient-to-br from-[#282828] to-[#121212]"
            )}>
              {/* Glass reflection */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              {activePlaylistId === 'liked' ? <Heart size={100} fill="white" className="drop-shadow-2xl" /> : 
               activePlaylistId === 'downloads' ? <Download size={100} fill="white" className="drop-shadow-2xl" /> :
               (activePlaylist.songs[0] ? <img src={activePlaylist.songs[0].image?.[2]?.url} className="w-full h-full object-cover" /> : <Music size={80} className="text-white/20" />)}
            </div>
            <div className="flex flex-col gap-3 relative z-10">
              <span className="text-[12px] font-black uppercase tracking-[0.3em] bg-white/10 px-3 py-1 rounded-full w-max backdrop-blur-md border border-white/10">Playlist</span>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80">{activePlaylist.name}</h1>
              <div className="flex items-center gap-3 text-[14px] font-bold mt-2 opacity-80">
                <span className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-accent-green flex items-center justify-center"><Play size={12} fill="black" /></div>SXR Audio</span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
                <span>{activePlaylist.songs.length} tracks</span>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-6 mb-8">
            <button 
              onClick={() => activePlaylist.songs.length > 0 && handlePlaySong(activePlaylist.songs[0], activePlaylist.songs)}
              className="w-14 h-14 bg-accent-green rounded-full flex items-center justify-center hover:scale-105 transition-transform"
            >
              <Play size={24} fill="black" className="ml-1" />
            </button>
            {activePlaylistId !== 'liked' && activePlaylistId !== 'downloads' && (
              <button 
                onClick={() => { deletePlaylist(activePlaylistId); setActivePlaylistId(null); }}
                className="text-text-subdued hover:text-white transition-colors"
              >
                <Trash2 size={24} />
              </button>
            )}
          </div>

          {/* Song List */}
          <div className="flex flex-col">
             <div className="grid grid-cols-[40px_1fr_1fr_120px] gap-4 px-4 py-2 text-text-subdued border-b border-white/10 text-[14px] font-medium mb-4">
                <span>#</span>
                <span>Title</span>
                <span>Album</span>
                <span className="text-right">Duration</span>
             </div>
             {activePlaylist.songs.map((song, i) => (
                <div 
                  key={song.id}
                  className="grid grid-cols-[40px_1fr_1fr_120px] gap-4 px-4 py-3 rounded-md hover:bg-white/10 group cursor-pointer"
                  onClick={() => handlePlaySong(song, activePlaylist.songs)}
                >
                  <span className="text-text-subdued flex items-center">{i + 1}</span>
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={song.image?.[0]?.url} className="w-10 h-10 rounded" />
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-white truncate">{decodeHtml(song.name)}</span>
                      <span className="text-[13px] text-text-subdued truncate group-hover:text-white">{decodeHtml(song.artists.primary[0]?.name)}</span>
                    </div>
                  </div>
                  <span className="text-text-subdued flex items-center truncate">{decodeHtml(song.album?.name)}</span>
                  <div className="flex items-center justify-end gap-4">
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeSongFromPlaylist(activePlaylist.id, song.id); }}
                      className="opacity-0 group-hover:opacity-100 text-text-subdued hover:text-white transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                    <span className="text-text-subdued">{song.duration ? `${Math.floor(song.duration/60)}:${(song.duration%60).toString().padStart(2,'0')}` : '3:45'}</span>
                  </div>
                </div>
             ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Your Library</h1>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex bg-[#282828] rounded-full p-1 border border-white/5">
                <button 
                  onClick={() => setShowImport('spotify')}
                  className="flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-[#1DB954] text-black rounded-full font-bold hover:scale-105 transition-transform"
                  title="Import from Spotify"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                     <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                  </svg>
                  <span className="hidden sm:inline">Spotify</span>
                </button>
                <button 
                  onClick={() => setShowImport('youtube')}
                  className="flex items-center gap-2 px-3 sm:px-4 py-1.5 hover:bg-white/10 text-white rounded-full font-bold hover:scale-105 transition-transform"
                  title="Import from YouTube"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#FF0000] fill-current"><path d="M2.5 7.1c.3-1.2 1.3-2.1 2.5-2.4C8.4 4.1 12 4.1 12 4.1s3.6 0 7 .6c1.2.3 2.2 1.2 2.5 2.4.6 2.3.6 7.1.6 7.1s0 4.8-.6 7.1c-.3 1.2-1.3 2.1-2.5 2.4-3.4.6-7 .6-7 .6s-3.6 0-7-.6c-1.2-.3-2.2-1.2-2.5-2.4-.6-2.3-.6-7.1-.6-7.1s0-4.8.6-7.1z"/><path d="M9.7 15.8l6.5-3.6-6.5-3.6v7.2z" fill="#121212" stroke="none"/></svg>
                  <span className="hidden sm:inline">YouTube</span>
                </button>
              </div>
              <button 
                onClick={() => setIsCreating(true)}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">Create Playlist</span>
                <span className="sm:hidden">Create</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {/* Liked Songs Tile */}
            <div 
              onClick={() => setActivePlaylistId('liked')}
              className="col-span-2 aspect-[2/1] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6 md:p-8 rounded-[32px] flex flex-col justify-end gap-1 md:gap-2 cursor-pointer hover:scale-[1.02] transition-transform relative group shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 blur-[80px] rounded-full pointer-events-none" />
              <Heart size={120} className="absolute -right-8 -bottom-8 opacity-20 rotate-12 group-hover:scale-110 transition-transform duration-700" fill="white" />
              
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-md relative z-10">Liked Songs</h2>
              <p className="text-white/90 font-bold tracking-widest uppercase text-xs relative z-10">{likedSongs.length} tracks</p>
              
              <div className="absolute right-6 bottom-6 w-14 h-14 bg-accent-green rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-[0_10px_20px_rgba(29,185,84,0.4)] z-20">
                <Play size={24} fill="black" className="ml-1" />
              </div>
            </div>

            {/* Downloads Tile */}
            <div 
              onClick={() => setActivePlaylistId('downloads')}
              className="aspect-square bg-gradient-to-br from-emerald-500 to-teal-600 p-4 md:p-6 rounded-[24px] flex flex-col justify-end gap-1 cursor-pointer hover:scale-[1.02] transition-transform relative group shadow-2xl overflow-hidden"
            >
              <Download size={80} className="absolute -right-4 -top-4 opacity-20 rotate-12 group-hover:scale-110 transition-transform duration-700" fill="white" />
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight drop-shadow-md relative z-10">Downloads</h2>
              <p className="text-white/90 font-bold uppercase text-[10px] relative z-10">{downloadedSongs.length} songs offline</p>
            </div>

            {playlists.map(p => (
              <div 
                key={p.id}
                onClick={() => setActivePlaylistId(p.id)}
                className="bg-[#181818]/60 backdrop-blur-xl border border-white/5 p-4 rounded-[24px] cursor-pointer group transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
              >
                <div className="aspect-square bg-gradient-to-br from-[#282828] to-[#121212] rounded-[16px] shadow-lg mb-4 flex items-center justify-center relative overflow-hidden">
                  {p.songs[0] ? (
                    <img src={p.songs[0].image?.[2]?.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <Music size={64} className="text-white/10" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute right-3 bottom-3 translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="w-12 h-12 bg-accent-green rounded-full flex items-center justify-center text-black shadow-lg">
                      <Play size={22} fill="currentColor" className="ml-1" />
                    </div>
                  </div>
                </div>
                <h3 className="font-black truncate text-[16px] text-white px-1">{p.name}</h3>
                <p className="text-[12px] text-white/50 font-medium px-1 mt-1 truncate">By You • {p.songs.length} tracks</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="bg-[#282828] p-8 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in">
            <h2 className="text-2xl font-bold mb-6">Create New Playlist</h2>
            <input 
              autoFocus
              type="text" 
              placeholder="Playlist name" 
              value={newPlaylistName}
              onChange={e => setNewPlaylistName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white mb-6 focus:outline-none focus:border-white/20 text-lg"
            />
            <div className="flex gap-4">
              <button type="button" onClick={() => setIsCreating(false)} className="flex-1 py-3 font-bold hover:bg-white/5 rounded-xl transition-colors">Cancel</button>
              <button type="submit" className="flex-1 py-3 bg-white text-black font-bold rounded-xl hover:scale-105 transition-transform">Create</button>
            </div>
          </form>
        </div>
      )}

      {/* Import Modal */}
      {showImport && <SpotifyImportModal type={showImport} onClose={() => setShowImport(null)} />}
    </div>
  );
};

export default Library;
