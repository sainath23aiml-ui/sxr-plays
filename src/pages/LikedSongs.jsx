import React from 'react';
import usePlayerStore from '../store/playerStore';
import { Play, Heart, Clock, MoreHorizontal, Disc3 } from 'lucide-react';
import { useContextMenuStore } from '../store/contextMenuStore';
import { clsx } from 'clsx';

const LikedSongs = () => {
  const { likedSongs, setSong, setQueue, currentSong, toggleLike } = usePlayerStore();
  const { openMenu } = useContextMenuStore();

  const handlePlay = (song, index) => {
    setQueue(likedSongs, index);
    setSong(song);
  };

  return (
    <div className="flex flex-col min-h-screen relative pb-32">
      {/* Massive Crimson Blur Background */}
      <div className="absolute top-0 left-0 w-full h-[600px] pointer-events-none -z-10 overflow-hidden opacity-50">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-rose-600 rounded-full blur-[120px]" />
        <div className="absolute top-[10%] right-[-10%] w-[50%] h-[50%] bg-pink-700 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#121212]/80 to-[#121212]" />
      </div>

      <div className="px-6 md:px-12 pt-20">
        <div className="flex flex-col md:flex-row items-end gap-8 mb-12 relative z-10">
          <div className="relative group">
            <div className="absolute inset-0 bg-rose-500 rounded-[32px] blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none" />
            <div className="w-56 h-56 md:w-72 md:h-72 bg-gradient-to-br from-rose-500 via-pink-600 to-purple-700 flex items-center justify-center shadow-[0_20px_50px_rgba(225,29,72,0.5)] rounded-[32px] relative overflow-hidden transform group-hover:scale-105 transition-transform duration-700">
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 mix-blend-overlay transition-opacity duration-500 pointer-events-none" />
              <Heart className="w-28 h-28 text-white fill-white drop-shadow-2xl animate-[pulse_3s_ease-in-out_infinite]" />
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <span className="text-[12px] font-black uppercase tracking-[0.3em] bg-white/10 px-4 py-1.5 rounded-full w-max backdrop-blur-md border border-white/20 text-white shadow-lg">Your Collection</span>
            <h1 className="text-6xl md:text-8xl lg:text-[120px] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 drop-shadow-2xl py-2">Liked Songs</h1>
            <p className="text-white/80 font-bold text-lg md:text-xl flex items-center gap-2">
              <span>SXR Profile</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
              <span className="text-rose-300">{likedSongs.length} tracks</span>
            </p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-6 mb-12">
          <button 
            className="w-16 h-16 rounded-full bg-rose-500 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-[0_10px_30px_rgba(225,29,72,0.6)] hover:bg-rose-400 group"
            onClick={() => likedSongs.length > 0 && handlePlay(likedSongs[0], 0)}
          >
            <Play className="w-8 h-8 ml-1 drop-shadow-md group-hover:scale-110 transition-transform" fill="currentColor" />
          </button>
          
          <button className="w-12 h-12 rounded-full border border-white/20 text-white flex items-center justify-center hover:border-white hover:bg-white/10 transition-all">
            <MoreHorizontal size={24} />
          </button>
        </div>

        <div className="w-full max-w-[1400px]">
          {/* Header */}
          <div className="grid grid-cols-[30px_1fr_1fr_80px] gap-4 px-6 py-4 text-white/50 text-[13px] font-black uppercase tracking-widest border-b border-white/10 mb-4 sticky top-16 bg-[#121212]/90 backdrop-blur-xl z-20">
            <div className="text-center">#</div>
            <div>Track</div>
            <div className="hidden md:block">Album</div>
            <div className="flex justify-end"><Clock size={16} /></div>
          </div>

          {/* List */}
          <div className="flex flex-col gap-2 relative z-10">
            {likedSongs.length === 0 ? (
              <div className="text-center text-white/40 py-32 flex flex-col items-center gap-6 bg-white/5 rounded-[32px] border border-white/5 border-dashed">
                <Heart className="w-24 h-24 opacity-20" />
                <h2 className="text-2xl font-black text-white/60 tracking-tight">Your heart is empty.</h2>
                <p className="font-medium text-lg">Find tracks you love and tap the heart icon to build your collection.</p>
              </div>
            ) : (
              likedSongs.map((song, i) => (
                <div
                  key={song.id}
                  onContextMenu={(e) => openMenu(e, song)}
                  className={clsx(
                    "group grid grid-cols-[30px_1fr_1fr_80px] gap-4 px-6 py-3 md:py-4 rounded-2xl items-center cursor-pointer transition-all duration-300 border border-transparent",
                    currentSong?.id === song.id 
                      ? "bg-rose-500/10 border-rose-500/20 shadow-[inset_0_0_20px_rgba(225,29,72,0.1)]" 
                      : "hover:bg-white/5 hover:border-white/10 hover:shadow-lg"
                  )}
                  onDoubleClick={() => handlePlay(song, i)}
                >
                  <div className="text-center text-white/40 font-bold text-base group-hover:hidden w-8">
                    {currentSong?.id === song.id ? <Disc3 className="w-5 h-5 text-rose-500 animate-spin" /> : i + 1}
                  </div>
                  <div className="hidden group-hover:flex items-center justify-center w-8">
                    <Play className="w-5 h-5 text-white" fill="currentColor" onClick={() => handlePlay(song, i)} />
                  </div>
                  
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden shrink-0 shadow-md">
                      <img src={song.image?.[2]?.url || song.image?.[0]?.url || song.image} alt={song.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className={clsx("truncate font-black text-[16px] md:text-[18px]", currentSong?.id === song.id ? 'text-rose-400' : 'text-white')}>
                        {song.title || song.name}
                      </div>
                      <div className="text-[13px] text-white/60 font-medium truncate group-hover:text-white transition-colors">
                        {song.subtitle || song.primaryArtists || song.artists?.primary?.[0]?.name}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-[14px] text-white/50 hidden md:block truncate font-medium group-hover:text-white/80 transition-colors">
                    {song.album?.name || song.album || "Unknown Album"}
                  </div>
                  
                  <div className="text-[14px] text-white/50 flex items-center justify-end gap-6 font-medium">
                    <Heart 
                      className="w-5 h-5 text-rose-500 fill-rose-500 cursor-pointer hover:scale-125 transition-transform" 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(song);
                      }}
                    />
                    <div className="w-8 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                       <MoreHorizontal className="w-6 h-6 text-white/50 hover:text-white transition-colors" onClick={(e) => openMenu(e, song)} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LikedSongs;
