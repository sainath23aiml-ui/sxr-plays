import React, { useMemo } from 'react';
import usePlayerStore from '../../store/playerStore';
import { useQuery } from '@tanstack/react-query';
import { getLyrics, decodeHtml } from '../../api/saavn';
import { clsx } from 'clsx';

const LyricsPanel = () => {
  const { currentSong } = usePlayerStore();

  const { data: lyricsData, isLoading, isError } = useQuery({
    queryKey: ['lyrics', currentSong?.id],
    queryFn: () => getLyrics(currentSong?.id),
    enabled: !!currentSong?.id,
    retry: false, // Don't retry lyrics if they 404
  });

  const parsedLyrics = useMemo(() => {
    if (!lyricsData?.data?.lyrics) return null;
    
    const lyrics = lyricsData.data.lyrics;
    
    if (typeof lyrics === 'string') {
      // Split by <br> or newline and filter empty lines
      return lyrics
        .split(/<br>|\n/)
        .map(line => ({ text: decodeHtml(line).trim(), time: 0 }))
        .filter(line => line.text.length > 0);
    }
    
    return null;
  }, [lyricsData]);

  if (isLoading) return (
    <div className="flex flex-col gap-4 py-8">
      {Array(8).fill(0).map((_, i) => (
        <div key={i} className="h-8 w-full bg-white/5 rounded animate-pulse" />
      ))}
    </div>
  );

  if (isError || !parsedLyrics || parsedLyrics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4 gap-4">
        <div className="text-4xl">🎵</div>
        <p className="text-text-subdued font-medium">Lyrics aren't available for this track yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 py-8 px-2">
      {parsedLyrics.map((line, i) => (
        <p 
          key={i} 
          className={clsx(
            "text-2xl font-bold transition-all duration-300 text-left cursor-default",
            "text-white/40 hover:text-white"
          )}
        >
          {line.text}
        </p>
      ))}
      <div className="h-20" /> {/* Spacer at bottom */}
    </div>
  );
};

export default LyricsPanel;
