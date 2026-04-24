import { useEffect } from 'react';
import usePlayerStore from '../store/playerStore';
import { searchSongs } from '../api/saavn';

export const useVibeQueue = () => {
  const { queue, queueIndex, currentSong, setQueue } = usePlayerStore();

  const vibeScore = (candidate, current) => {
    let score = 0;
    if (!candidate || !current) return 0;
    
    // Same language -> +3
    if (candidate.language === current.language) score += 3;
    
    // Same primary artist -> +2
    if (candidate.artists?.primary?.[0]?.id === current.artists?.primary?.[0]?.id) score += 2;
    
    // Same album -> +1
    if (candidate.album?.id === current.album?.id) score += 1;
    
    // Released within 2 years -> +1
    if (Math.abs(parseInt(candidate.year || 0) - parseInt(current.year || 0)) <= 2) score += 1;
    
    return score;
  };

  useEffect(() => {
    if (!currentSong || queue.length === 0) return;

    const remaining = queue.length - queueIndex - 1;
    
    if (remaining < 3) {
      const fetchRecommendations = async () => {
        const artistName = currentSong.artists?.primary?.[0]?.name || currentSong.artists?.all?.[0]?.name;
        if (!artistName) return;

        const results = await searchSongs(artistName);
        const candidates = results?.data?.results || [];
        
        // Filter out songs already in queue
        const existingIds = new Set(queue.map(s => s.id));
        const newCandidates = candidates.filter(s => !existingIds.has(s.id));

        // Score and Sort
        const scored = newCandidates.map(s => ({
          song: s,
          score: vibeScore(s, currentSong)
        })).sort((a, b) => b.score - a.score);

        // Take top 5
        const top5 = scored.slice(0, 5).map(s => ({ ...s.song, vibeAdded: true }));

        if (top5.length > 0) {
          setQueue([...queue, ...top5], queueIndex);
        }
      };

      fetchRecommendations();
    }
  }, [queueIndex, currentSong, queue, setQueue]);
};
