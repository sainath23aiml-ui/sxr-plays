import React, { useEffect, useRef } from 'react';
import { useContextMenuStore } from '../../store/contextMenuStore';
import usePlayerStore from '../../store/playerStore';
import useDownloadStore from '../../store/downloadStore';
import { Play, Plus, ListPlus, Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ContextMenu = () => {
  const { isOpen, x, y, song, closeMenu } = useContextMenuStore();
  const { setSong, queue, setQueue, toggleLike } = usePlayerStore();
  const { downloadedIds, isDownloading, toggleDownload } = useDownloadStore();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        closeMenu();
      }
    };
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen, closeMenu]);

  if (!isOpen || !song) return null;

  // Ensure menu doesn't overflow off screen
  const safeX = Math.min(x, window.innerWidth - 200);
  const safeY = Math.min(y, window.innerHeight - 250);

  const handleAction = (action) => {
    action();
    closeMenu();
  };

  const isDownloaded = downloadedIds.includes(song.id);
  const isDownloadingSong = isDownloading[song.id];

  return (
    <div 
      ref={menuRef}
      className="fixed z-50 w-56 bg-[#282828] border border-white/10 shadow-2xl rounded-md py-1 text-sm text-white animate-fade-in"
      style={{ left: safeX, top: safeY }}
    >
      <div 
        className="px-4 py-3 hover:bg-white/10 cursor-pointer flex items-center gap-3 transition-colors"
        onClick={() => handleAction(() => { setSong(song); })}
      >
        <Play className="w-4 h-4 fill-current" /> Play
      </div>
      <div 
        className="px-4 py-3 hover:bg-white/10 cursor-pointer flex items-center gap-3 transition-colors"
        onClick={() => handleAction(() => {
          setQueue([...queue, song], queue.length);
          toast.success("Added to Queue");
        })}
      >
        <ListPlus className="w-4 h-4" /> Add to queue
      </div>
      <div 
        className="px-4 py-3 hover:bg-white/10 cursor-pointer flex items-center gap-3 transition-colors"
        onClick={() => handleAction(() => toggleDownload(song))}
      >
        {isDownloadingSong ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className={clsx("w-4 h-4", isDownloaded && "text-accent-green")} />
        )}
        {isDownloaded ? "Remove from downloads" : "Download"}
      </div>
      <div className="h-px bg-white/10 my-1 mx-2" />
      <div 
        className="px-4 py-3 hover:bg-white/10 cursor-pointer flex items-center gap-3 transition-colors"
        onClick={() => handleAction(() => {
          toggleLike(song);
          toast.success("Added to Liked Songs");
        })}
      >
        <Plus className="w-4 h-4" /> Save to Liked Songs
      </div>
    </div>
  );
};

export default ContextMenu;
