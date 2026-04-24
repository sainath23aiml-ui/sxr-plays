import { useEffect, useRef } from 'react';
import usePlayerStore from '../store/playerStore';
import { getStreamUrl } from '../api/saavn';

export const useCrossfade = (primaryAudio) => {
  const { 
    queue, queueIndex, crossfadeDuration, 
    volume, isMuted, setSong, nextSong 
  } = usePlayerStore();
  
  const secondaryAudioRef = useRef(new Audio());
  const crossfadeStarted = useRef(false);

  useEffect(() => {
    if (!primaryAudio) return;

    const checkCrossfade = () => {
      const remaining = primaryAudio.duration - primaryAudio.currentTime;
      
      if (remaining <= crossfadeDuration && !crossfadeStarted.current && queue.length > 0) {
        const nextIndex = (queueIndex + 1) % queue.length;
        const nextTrack = queue[nextIndex];
        
        if (nextTrack) {
          const nextUrl = getStreamUrl(nextTrack);
          if (nextUrl) {
            crossfadeStarted.current = true;
            secondaryAudioRef.current.src = nextUrl;
            secondaryAudioRef.current.volume = 0;
            secondaryAudioRef.current.play().catch(() => {});

            // Start crossfade interval
            const interval = 100; // ms
            const steps = (crossfadeDuration * 1000) / interval;
            let currentStep = 0;

            const fadeInterval = setInterval(() => {
              currentStep++;
              const fadeRatio = currentStep / steps;
              
              if (primaryAudio) {
                primaryAudio.volume = Math.max(0, (isMuted ? 0 : volume) * (1 - fadeRatio));
              }
              secondaryAudioRef.current.volume = Math.min(isMuted ? 0 : volume, (isMuted ? 0 : volume) * fadeRatio);

              if (currentStep >= steps) {
                clearInterval(fadeInterval);
                // When finished, the store should naturally trigger the next song
                // But we've already started playing the next one in the secondary audio
                // This is a bit tricky to sync back to the singleton usePlayer.
                // For simplicity in this v1, we'll let the singleton handle it or 
                // just warn that crossfade is an advanced feature.
              }
            }, interval);
          }
        }
      }
    };

    const intervalId = setInterval(checkCrossfade, 1000);
    return () => {
      clearInterval(intervalId);
      crossfadeStarted.current = false;
    };
  }, [primaryAudio, queue, queueIndex, crossfadeDuration, volume, isMuted]);

  return secondaryAudioRef.current;
};
