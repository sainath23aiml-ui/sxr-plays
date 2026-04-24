import { useEffect } from 'react';
import usePlayerStore from '../store/playerStore';

export const useKeyboardShortcuts = () => {
  const { isPlaying, setPlaying, nextSong, prevSong, volume, setVolume, toggleMute } = usePlayerStore();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          setPlaying(!isPlaying);
          break;
        case 'ArrowRight':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            nextSong();
          }
          break;
        case 'ArrowLeft':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            prevSong();
          }
          break;
        case 'ArrowUp':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setVolume(Math.min(1, volume + 0.1));
          }
          break;
        case 'ArrowDown':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setVolume(Math.max(0, volume - 0.1));
          }
          break;
        case 'KeyM':
          toggleMute();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, setPlaying, nextSong, prevSong, volume, setVolume, toggleMute]);
};
