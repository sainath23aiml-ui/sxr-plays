import React, { useEffect, useState, useRef } from 'react';
import usePlayerStore from '../../store/playerStore';
import { usePlayer } from '../../hooks/usePlayer';
import { 
  ChevronDown, Heart, Play, Pause, SkipBack, SkipForward, 
  Volume2, VolumeX, Shuffle, Repeat, Plus, MoreHorizontal, Mic2, Download, Loader2
} from 'lucide-react';
import useDownloadStore from '../../store/downloadStore';
import { decodeHtml } from '../../api/saavn';
import { clsx } from 'clsx';
import { useContextMenuStore } from '../../store/contextMenuStore';
import PlaylistPicker from './PlaylistPicker';
import LyricsPanel from '../features/LyricsPanel';

const FullScreenPlayer = () => {
  const { 
    isFullScreen, setFullScreen, currentSong, isPlaying, setPlaying, 
    currentTime, duration, nextSong, prevSong, likedSongs, toggleLike,
    isShuffled, toggleShuffle, repeatMode, cycleRepeat,
    volume, setVolume, isMuted, toggleMute
  } = usePlayerStore();
  
  const { seek } = usePlayer();
  const { downloadedIds, isDownloading, toggleDownload } = useDownloadStore();
  const { openMenu } = useContextMenuStore();
  const containerRef = useRef(null);
  const wheelTimeoutRef = useRef(null);

  const [touchStartY, setTouchStartY] = useState(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);

  useEffect(() => {
    if (!isFullScreen) {
      if (document.fullscreenElement) document.exitFullscreen().catch(e => {});
      return;
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setFullScreen(false);
      else if (e.key === 'ArrowUp') prevSong();
      else if (e.key === 'ArrowDown') nextSong();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isFullScreen, setFullScreen, nextSong, prevSong]);

  const handleWheel = (e) => {
    if (wheelTimeoutRef.current) return;
    if (e.deltaY > 50) {
      nextSong();
      wheelTimeoutRef.current = setTimeout(() => { wheelTimeoutRef.current = null; }, 1000);
    } else if (e.deltaY < -50) {
      prevSong();
      wheelTimeoutRef.current = setTimeout(() => { wheelTimeoutRef.current = null; }, 1000);
    }
  };

  const handleTouchStart = (e) => {
    setTouchStartY(e.touches[0].clientY);
    setSwipeOffset(0);
  };

  const handleTouchMove = (e) => {
    if (!touchStartY) return;
    setSwipeOffset(e.touches[0].clientY - touchStartY);
  };

  const handleTouchEnd = () => {
    if (swipeOffset < -100) nextSong();
    else if (swipeOffset > 100) prevSong();
    setTouchStartY(null);
    setSwipeOffset(0);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isFullScreen || !currentSong) return null;

  const isLiked = likedSongs.some(s => s.id === currentSong.id);
  const isDownloaded = downloadedIds.includes(currentSong.id);
  const isDownloadingSong = isDownloading[currentSong.id];
  const imageUrl = currentSong.image?.[2]?.url || currentSong.image?.[0]?.url || currentSong.image;

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[9999] bg-black text-white flex flex-col justify-between overflow-hidden animate-fade-in"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translateY(${swipeOffset}px)`,
        transition: touchStartY ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
      }}
    >
      {/* Background Blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 blur-3xl scale-110 pointer-events-none"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-[#121212] pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between p-6 shrink-0">
        <button 
          onClick={() => setFullScreen(false)}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-colors pointer-events-auto"
        >
          <ChevronDown size={24} className="md:w-8 md:h-8" />
        </button>
        <div className="text-center px-4">
          <p className="text-[10px] md:text-[12px] font-bold tracking-[0.2em] uppercase text-white/60">Playing from Queue</p>
          <p className="text-xs md:text-sm font-black truncate max-w-[200px] md:max-w-[300px]">{currentSong.album?.name || "SXR Audio"}</p>
        </div>
        <button 
          onClick={(e) => openMenu(e, currentSong)}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-colors pointer-events-auto"
        >
          <MoreHorizontal size={24} className="md:w-8 md:h-8" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 md:p-8 w-full max-w-3xl mx-auto pointer-events-none overflow-hidden min-h-0">
        
        {/* Album Art or Lyrics */}
        <div className="w-full flex-1 flex flex-col items-center justify-center min-h-0 pointer-events-auto">
          {showLyrics ? (
            <div className="w-full h-full max-h-[60vh] bg-black/40 backdrop-blur-md rounded-2xl md:rounded-[2rem] shadow-2xl p-4 md:p-8 overflow-y-auto custom-scrollbar border border-white/5">
              <LyricsPanel />
            </div>
          ) : (
            <div className="w-full aspect-square max-w-[350px] md:max-w-[500px] max-h-[50vh] bg-white/5 rounded-2xl md:rounded-[2rem] shadow-2xl overflow-hidden pointer-events-auto transition-all">
              <img 
                src={imageUrl} 
                alt={currentSong.name} 
                className={clsx(
                  "w-full h-full object-cover transition-transform duration-[10s]",
                  isPlaying && "scale-110"
                )}
              />
            </div>
          )}
        </div>

        {/* Track Info & Actions */}
        <div className="w-full flex items-center justify-between mt-6 md:mt-8 mb-6 pointer-events-auto shrink-0">
          <div className="flex flex-col min-w-0 pr-4 flex-1">
            <h1 className="text-2xl md:text-4xl font-black truncate drop-shadow-lg mb-1 md:mb-2">{decodeHtml(currentSong.name)}</h1>
            <p className="text-base md:text-xl text-white/70 font-medium truncate drop-shadow-md">
              {decodeHtml(currentSong.artists?.primary?.[0]?.name || currentSong.subtitle)}
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0 relative">
            <button 
              onClick={() => setShowPicker(!showPicker)} 
              className="p-3 md:p-4 bg-white/5 rounded-full backdrop-blur-md hover:bg-white/20 transition-all"
              title="Add to Playlist"
            >
              <Plus size={24} className="text-white" />
            </button>
            {showPicker && <div className="absolute bottom-full right-0 mb-4 z-50"><PlaylistPicker song={currentSong} onClose={() => setShowPicker(false)} /></div>}
            
            <button 
              onClick={() => toggleDownload(currentSong)}
              disabled={isDownloadingSong}
              className={clsx("p-3 md:p-4 bg-white/10 rounded-full backdrop-blur-md hover:bg-white/20 transition-all", isDownloaded && "text-accent-green")}
              title={isDownloaded ? "Downloaded" : "Download for offline"}
            >
              {isDownloadingSong ? (
                <Loader2 size={24} className="animate-spin text-white" />
              ) : (
                <Download size={24} fill={isDownloaded ? "currentColor" : "none"} className={!isDownloaded ? "text-white/50" : ""} />
              )}
            </button>

            <button 
              onClick={() => toggleLike(currentSong)} 
              className="p-3 md:p-4 bg-white/10 rounded-full backdrop-blur-md hover:bg-white/20 transition-all"
              title={isLiked ? "Unlike" : "Like"}
            >
              <Heart size={24} fill={isLiked ? "#E11D48" : "none"} className={isLiked ? "text-rose-600" : "text-white"} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full flex items-center gap-3 md:gap-4 text-xs md:text-sm font-bold text-white/60 mb-6 md:mb-8 pointer-events-auto shrink-0">
          <span>{formatTime(currentTime)}</span>
          <div 
            className="flex-1 h-2 md:h-3 bg-white/20 rounded-full relative cursor-pointer group"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              seek((e.clientX - rect.left) / rect.width * duration);
            }}
          >
            <div 
              className="absolute top-0 left-0 h-full bg-white rounded-full group-hover:bg-accent-green transition-colors"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100" />
            </div>
          </div>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Playback Controls & Bottom Actions */}
        <div className="w-full flex flex-col gap-6 pointer-events-auto shrink-0">
          <div className="flex items-center justify-between px-2 md:px-0">
            <button onClick={toggleShuffle} className={clsx("p-2 md:p-3 rounded-full hover:bg-white/10 transition-colors hidden sm:block", isShuffled ? "text-accent-green" : "text-white/60")}>
              <Shuffle size={24} />
            </button>
            
            <div className="flex items-center justify-center gap-4 md:gap-8 flex-1">
              <button onClick={prevSong} className="text-white hover:text-accent-green transition-colors">
                <SkipBack className="w-9 h-9 md:w-12 md:h-12" fill="currentColor" />
              </button>
              
              <button 
                onClick={() => setPlaying(!isPlaying)}
                className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.3)]"
              >
                {isPlaying ? <Pause className="w-9 h-9 md:w-12 md:h-12" fill="currentColor" /> : <Play className="w-9 h-9 md:w-12 md:h-12 ml-2" fill="currentColor" />}
              </button>
              
              <button onClick={nextSong} className="text-white hover:text-accent-green transition-colors">
                <SkipForward className="w-9 h-9 md:w-12 md:h-12" fill="currentColor" />
              </button>
            </div>
            
            <button onClick={cycleRepeat} className={clsx("p-2 md:p-3 rounded-full hover:bg-white/10 transition-colors hidden sm:block", repeatMode !== 'none' ? "text-accent-green" : "text-white/60")}>
              <Repeat size={24} />
            </button>
          </div>

          {/* Extra Controls Row (Volume, Lyrics) */}
          <div className="flex items-center justify-between w-full px-2 md:px-0 opacity-80 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2 group w-[120px] md:w-[200px]">
              <button onClick={toggleMute} className="text-white/60 hover:text-white transition-colors">
                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <div className="flex-1 h-1.5 bg-white/20 rounded-full relative cursor-pointer hidden sm:block">
                 <input 
                  type="range" min="0" max="1" step="0.01" 
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div 
                  className="h-full bg-white group-hover:bg-accent-green rounded-full pointer-events-none transition-colors" 
                  style={{ width: `${(isMuted ? 0 : volume) * 100}%` }} 
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Shuffle/Repeat for Mobile */}
              <button onClick={toggleShuffle} className={clsx("p-2 rounded-full sm:hidden transition-colors", isShuffled ? "text-accent-green" : "text-white/60")}>
                <Shuffle size={20} />
              </button>
              <button onClick={cycleRepeat} className={clsx("p-2 rounded-full sm:hidden transition-colors", repeatMode !== 'none' ? "text-accent-green" : "text-white/60")}>
                <Repeat size={20} />
              </button>
              
              <button 
                onClick={() => setShowLyrics(!showLyrics)} 
                className={clsx("p-2 md:p-3 rounded-full transition-all flex items-center gap-2", showLyrics ? "bg-accent-green text-black font-bold" : "bg-white/10 text-white hover:bg-white/20")}
              >
                <Mic2 size={20} />
                <span className="hidden md:inline">{showLyrics ? "Hide Lyrics" : "Show Lyrics"}</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Swipe Indicator (Mobile Only) */}
      <div className="relative z-10 pb-6 flex flex-col items-center justify-center text-white/40 pointer-events-none animate-pulse md:hidden">
        <span className="text-[10px] uppercase tracking-widest font-bold mt-1">Swipe for Next</span>
        <ChevronDown size={20} />
      </div>

    </div>
  );
};

export default FullScreenPlayer;
