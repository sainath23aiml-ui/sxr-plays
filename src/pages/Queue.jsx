import React from 'react';
import usePlayerStore from '../store/playerStore';
import { Play, MoreHorizontal, Heart } from 'lucide-react';
import { useContextMenuStore } from '../store/contextMenuStore';

const Queue = () => {
  const { queue, queueIndex, currentSong, setSong, setQueue, toggleLike, likedSongs } = usePlayerStore();
  const { openMenu } = useContextMenuStore();
  
  const upcomingSongs = queue.slice(queueIndex + 1);

  const handlePlay = (song, idxInFullQueue) => {
    setSong(song);
    setQueue(queue, idxInFullQueue);
  };

  return (
    <div className="p-6 pb-24 max-w-4xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-8 text-white">Queue</h1>
      
      {currentSong && (
        <div className="mb-8">
          <h2 className="text-text-muted font-bold mb-4 text-sm">Now Playing</h2>
          <SongRow 
            song={currentSong} 
            index={queueIndex} 
            isActive={true} 
            onPlay={() => {}} 
            onContext={(e) => openMenu(e, currentSong)}
            isLiked={likedSongs.some(s => s.id === currentSong.id)}
            onLike={(e) => { e.stopPropagation(); toggleLike(currentSong); }}
          />
        </div>
      )}

      {upcomingSongs.length > 0 && (
        <div>
          <h2 className="text-text-muted font-bold mb-4 text-sm">Next in Queue</h2>
          <div className="flex flex-col gap-1">
            {upcomingSongs.map((song, i) => {
              const actualIndex = queueIndex + 1 + i;
              return (
                <SongRow 
                  key={`${song.id}-${i}`} 
                  song={song} 
                  index={actualIndex} 
                  isActive={false} 
                  onPlay={() => handlePlay(song, actualIndex)}
                  onContext={(e) => openMenu(e, song)}
                  isLiked={likedSongs.some(s => s.id === song.id)}
                  onLike={(e) => { e.stopPropagation(); toggleLike(song); }}
                />
              );
            })}
          </div>
        </div>
      )}

      {upcomingSongs.length === 0 && !currentSong && (
        <div className="text-center text-text-muted py-20">
          Your queue is empty.
        </div>
      )}
    </div>
  );
};

const SongRow = ({ song, index, isActive, onPlay, onContext, isLiked, onLike }) => (
  <div 
    className={`group flex items-center gap-4 px-4 py-2 rounded-md hover:bg-white/10 cursor-pointer transition-colors ${isActive ? 'bg-white/10' : ''}`}
    onDoubleClick={onPlay}
    onContextMenu={onContext}
  >
    <div className="w-8 text-center text-text-muted group-hover:hidden">
      {isActive ? <Play className="w-4 h-4 text-accent-green inline" fill="currentColor" /> : index + 1}
    </div>
    <div className="w-8 hidden group-hover:flex justify-center text-white" onClick={(e) => { e.stopPropagation(); onPlay(); }}>
      <Play className="w-4 h-4" fill="currentColor" />
    </div>
    <img src={song.image?.[0]?.url || song.image} alt={song.title} className="w-10 h-10 rounded shadow-sm object-cover" />
    <div className="flex-1 overflow-hidden">
      <div className={`truncate font-medium ${isActive ? 'text-accent-green' : 'text-white'}`}>{song.title}</div>
      <div className="text-sm text-text-muted truncate hover:underline">{song.subtitle || song.primaryArtists}</div>
    </div>
    <div className="text-sm text-text-muted hidden md:block w-1/3 truncate hover:underline">{song.album?.name || song.album}</div>
    <div className="flex items-center gap-4">
      <Heart 
        className={`w-4 h-4 cursor-pointer hover:scale-110 transition-transform ${isLiked ? 'text-accent-green fill-accent-green' : 'text-text-muted hover:text-white opacity-0 group-hover:opacity-100'}`}
        onClick={onLike}
      />
      <MoreHorizontal 
        className="w-5 h-5 text-text-muted hover:text-white opacity-0 group-hover:opacity-100 transition-opacity" 
        onClick={onContext}
      />
    </div>
  </div>
);

export default Queue;
