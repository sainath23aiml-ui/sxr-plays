import { useEffect, useRef } from 'react';
import usePlayerStore from '../store/playerStore';
import useDownloadStore from '../store/downloadStore';
import { getStreamUrl } from '../api/saavn';

// Module-level singleton audio element
const audio = new Audio();

export const usePlayer = () => {
  const {
    currentSong,
    isPlaying,
    volume,
    isMuted,
    setPlaying,
    setTime,
    setDuration,
    nextSong,
    addToHistory,
  } = usePlayerStore();

  const isInitialMount = useRef(true);
  const lastObjectUrl = useRef(null);

  // Handle Song Change
  useEffect(() => {
    if (!currentSong) return;

    const setupAudio = async () => {
      // Clean up previous blob URL to prevent memory leaks
      if (lastObjectUrl.current) {
        URL.revokeObjectURL(lastObjectUrl.current);
        lastObjectUrl.current = null;
      }

      // Check for offline version first
      const { getCachedUrl } = useDownloadStore.getState();
      const cachedUrl = await getCachedUrl(currentSong);
      
      if (cachedUrl) {
        lastObjectUrl.current = cachedUrl;
      }
      
      const streamUrl = cachedUrl || getStreamUrl(currentSong);
      if (!streamUrl) {
        console.error("No stream URL found for song:", currentSong.name);
        nextSong();
        return;
      }

      audio.src = streamUrl;
      
      if (!isInitialMount.current || isPlaying) {
        audio.play().catch(err => console.error("Playback error:", err));
        setPlaying(true);
        addToHistory(currentSong);
      }
      
      isInitialMount.current = false;
    };

    setupAudio();

    return () => {
      if (lastObjectUrl.current) {
        URL.revokeObjectURL(lastObjectUrl.current);
      }
    };
  }, [currentSong?.id]);

  // Handle Play/Pause
  useEffect(() => {
    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Handle Volume/Mute
  useEffect(() => {
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Audio Event Listeners
  useEffect(() => {
    const onTimeUpdate = () => setTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => nextSong();

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [nextSong, setTime, setDuration]);

  const seek = (time) => {
    audio.currentTime = time;
    setTime(time);
  };

  return { seek };
};
