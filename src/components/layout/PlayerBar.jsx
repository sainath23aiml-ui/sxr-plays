import React, { useEffect } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, 
  Volume2, VolumeX, Mic2, ListMusic, Maximize2, Heart, X, Download, CloudOff, Loader2 
} from 'lucide-react';
import usePlayerStore from '../../store/playerStore';
import useDownloadStore from '../../store/downloadStore';
import { usePlayer } from '../../hooks/usePlayer';
import { decodeHtml } from '../../api/saavn';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';

const PlayerBar = ({ onToggleLyrics, isLyricsOpen }) => {
  const { 
    currentSong, isPlaying, setPlaying, 
    currentTime, duration, volume, setVolume,
    isMuted, toggleMute, isShuffled, toggleShuffle,
    repeatMode, cycleRepeat, nextSong, prevSong,
    likedSongs, toggleLike,
    isFullScreen, toggleFullScreen, setFullScreen
  } = usePlayerStore();

  const { downloadedIds, isDownloading, toggleDownload } = useDownloadStore();

  const { seek } = usePlayer();

  // Feature 2: Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input field
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          setPlaying(!isPlaying);
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextSong();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevSong();
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullScreen();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, nextSong, prevSong, setPlaying, toggleMute]);

  // Feature 4: Media Session API (Lock Screen / Background Audio)
  useEffect(() => {
    if ('mediaSession' in navigator && currentSong) {
      const title = decodeHtml(currentSong.name || currentSong.title);
      const artist = decodeHtml(currentSong.artists?.primary?.[0]?.name || currentSong.artists?.all?.[0]?.name || 'Unknown Artist');
      const album = decodeHtml(currentSong.album?.name || '');
      const artworkUrl = currentSong.image?.[2]?.url || currentSong.image?.[0]?.url || '';

      navigator.mediaSession.metadata = new MediaMetadata({
        title,
        artist,
        album,
        artwork: [
          { src: artworkUrl, sizes: '96x96', type: 'image/jpeg' },
          { src: artworkUrl, sizes: '128x128', type: 'image/jpeg' },
          { src: artworkUrl, sizes: '192x192', type: 'image/jpeg' },
          { src: artworkUrl, sizes: '256x256', type: 'image/jpeg' },
          { src: artworkUrl, sizes: '384x384', type: 'image/jpeg' },
          { src: artworkUrl, sizes: '512x512', type: 'image/jpeg' },
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => setPlaying(true));
      navigator.mediaSession.setActionHandler('pause', () => setPlaying(false));
      navigator.mediaSession.setActionHandler('previoustrack', prevSong);
      navigator.mediaSession.setActionHandler('nexttrack', nextSong);
    }
  }, [currentSong, setPlaying, prevSong, nextSong]);

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    seek(percentage * duration);
  };

  if (!currentSong) return null;

  return (
    <>
      {/* Desktop Player Bar */}
      <footer className="hidden lg:flex h-[90px] bg-black border-t border-white/5 px-4 flex-col relative z-40">
      <div className="flex-1 flex items-center justify-between gap-4">
        {/* Track Info */}
        <div className="flex items-center gap-4 w-[30%] min-w-0">
          <div className="w-14 h-14 rounded-md overflow-hidden bg-white/5 shrink-0 shadow-lg relative group/art">
            <img src={currentSong.image?.[1]?.url} alt={currentSong.name} className="w-full h-full object-cover" />
            {isPlaying && (
              <div className="absolute inset-0 bg-black/40 flex items-end justify-center gap-[2px] pb-1 px-1">
                <div className="visualizer-bar" style={{ animationDelay: '0s' }} />
                <div className="visualizer-bar" style={{ animationDelay: '0.1s' }} />
                <div className="visualizer-bar" style={{ animationDelay: '0.2s' }} />
                <div className="visualizer-bar" style={{ animationDelay: '0.15s' }} />
              </div>
            )}
          </div>
          <div className="min-w-0 flex flex-col">
            <h4 className="text-[14px] font-bold text-white truncate hover:underline cursor-pointer">{decodeHtml(currentSong.name)}</h4>
            <p className="text-[11px] text-text-muted truncate hover:underline hover:text-white cursor-pointer">{decodeHtml(currentSong.artists?.primary?.[0]?.name)}</p>
          </div>
          <button 
            onClick={() => toggleLike(currentSong)}
            className={clsx("transition-colors ml-2", likedSongs.some(s => s.id === currentSong.id) ? "text-accent-green" : "text-text-muted hover:text-white")}
          >
            <Heart size={18} fill={likedSongs.some(s => s.id === currentSong.id) ? "currentColor" : "none"} />
          </button>
          <button 
            onClick={() => toggleDownload(currentSong)}
            disabled={isDownloading[currentSong.id]}
            className={clsx("transition-colors ml-2", downloadedIds.includes(currentSong.id) ? "text-accent-green" : "text-text-muted hover:text-white")}
            title={downloadedIds.includes(currentSong.id) ? "Downloaded" : "Download for offline"}
          >
            {isDownloading[currentSong.id] ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Download size={18} className={clsx(!downloadedIds.includes(currentSong.id) && "opacity-50")} />
            )}
          </button>
          <button 
            onClick={() => usePlayerStore.getState().clearSong()}
            className="text-text-muted hover:text-white transition-colors ml-2"
            title="Stop & Clear Player"
          >
            <X size={18} />
          </button>
        </div>

        {/* Playback Controls */}
        <div className="flex-1 max-w-[40%] flex flex-col items-center gap-2">
          <div className="flex items-center gap-6">
            <button 
              onClick={toggleShuffle}
              className={clsx("transition-colors", isShuffled ? "text-accent-1" : "text-text-muted hover:text-white")}
            >
              <Shuffle size={16} />
            </button>
            <button onClick={prevSong} className="text-text-muted hover:text-white transition-transform">
              <SkipBack size={20} fill="currentColor" />
            </button>
            <button 
              onClick={() => setPlaying(!isPlaying)}
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
            </button>
            <button onClick={nextSong} className="text-text-muted hover:text-white transition-transform">
              <SkipForward size={20} fill="currentColor" />
            </button>
            <button 
              onClick={cycleRepeat}
              className={clsx("transition-colors", repeatMode !== 'none' ? "text-accent-1" : "text-text-muted hover:text-white")}
            >
              <Repeat size={16} />
            </button>
          </div>
          
          {/* Progress Slider */}
          <div className="flex items-center gap-2 w-full text-[11px] text-text-muted font-medium">
            <span className="w-8 text-right">{formatTime(currentTime)}</span>
            <div 
              className="flex-1 h-1 bg-white/10 rounded-full relative cursor-pointer group"
              onClick={handleSeek}
            >
              <div 
                className="h-full bg-white group-hover:bg-accent-1 rounded-full relative transition-all" 
                style={{ width: `${(currentTime / duration) * 100}%` }} 
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-xl" />
              </div>
            </div>
            <span className="w-8">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume & Extras */}
        <div className="w-[30%] hidden md:flex items-center justify-end gap-3">
          <button 
            onClick={onToggleLyrics}
            className={clsx("transition-colors", isLyricsOpen ? "text-accent-green" : "text-text-muted hover:text-white")}
            title="Lyrics Panel"
          >
            <Mic2 size={16} />
          </button>
          <Link 
            to="/queue"
            className="text-text-muted hover:text-white transition-colors"
            title="Queue"
          >
            <ListMusic size={16} />
          </Link>
          <div className="flex items-center gap-2 w-24 group">
            <button onClick={toggleMute} className="text-text-muted group-hover:text-white">
              {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <div className="flex-1 h-1 bg-white/10 rounded-full group-hover:bg-white/20 relative cursor-pointer">
               <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div 
                className="h-full bg-white group-hover:bg-accent-green rounded-full" 
                style={{ width: `${(isMuted ? 0 : volume) * 100}%` }} 
              />
            </div>
          </div>
          <button 
            onClick={toggleFullScreen}
            className="text-text-muted hover:text-white transition-colors"
            title="Fullscreen Mode"
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </div>
      </footer>

      {/* Mobile Floating Mini Player */}
      <div 
        onClick={() => setFullScreen(true)}
        className="lg:hidden fixed bottom-[72px] left-2 right-2 h-[56px] rounded-lg z-[800] overflow-hidden flex items-center px-2 gap-3 shadow-2xl cursor-pointer"
        style={{ backgroundColor: 'var(--dynamic-glow, #282828)' }}
      >
        {/* Dark overlay to ensure text is readable against extracted color */}
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />
        
        {/* Album Art */}
        <div className="w-10 h-10 rounded shadow-md shrink-0 relative z-10 overflow-hidden">
          <img src={currentSong.image?.[1]?.url} alt={currentSong.name} className="w-full h-full object-cover" />
        </div>
        
        {/* Track Info (Title & Artist) */}
        <div className="flex-1 min-w-0 flex flex-col justify-center relative z-10">
          <h4 className="text-[13px] font-bold text-white truncate drop-shadow-md">{decodeHtml(currentSong.name)}</h4>
          <p className="text-[11px] text-white/80 truncate drop-shadow-md flex items-center gap-1">
            {decodeHtml(currentSong.artists?.primary?.[0]?.name)}
          </p>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-3 relative z-10 mr-1">
          <button onClick={(e) => { e.stopPropagation(); toggleLike(currentSong); }} className="text-white hover:scale-110 transition-transform">
             <Heart size={20} fill={likedSongs.some(s => s.id === currentSong.id) ? "currentColor" : "none"} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setPlaying(!isPlaying); }} className="text-white hover:scale-110 transition-transform">
             {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
          </button>
        </div>
        
        {/* Progress Bar Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/20 z-10">
          <div className="h-full bg-white transition-all" style={{ width: `${(currentTime / duration) * 100}%` }} />
        </div>
      </div>
    </>
  );
};

export default PlayerBar;
