import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAlbumById, decodeHtml } from '../api/saavn';
import usePlayerStore from '../store/playerStore';
import { Play, Clock, Heart, MoreHorizontal } from 'lucide-react';
import { clsx } from 'clsx';

const AlbumDetail = () => {
  const { id } = useParams();
  const { setSong, setQueue, currentSong, isPlaying } = usePlayerStore();

  const { data: album, isLoading } = useQuery({
    queryKey: ['album', id],
    queryFn: () => getAlbumById(id),
  });

  if (isLoading) return <div className="p-8 animate-pulse flex flex-col gap-8">
    <div className="flex gap-8 items-end">
      <div className="w-64 h-64 bg-white/5 rounded-lg" />
      <div className="flex-1 space-y-4">
        <div className="h-4 w-24 bg-white/5 rounded" />
        <div className="h-12 w-64 bg-white/5 rounded" />
        <div className="h-4 w-48 bg-white/5 rounded" />
      </div>
    </div>
  </div>;

  const albumData = album?.data;
  const songs = albumData?.songs || [];

  const handlePlayAlbum = () => {
    if (songs.length > 0) {
      setQueue(songs, 0);
      setSong(songs[0]);
    }
  };

  const handlePlaySong = (song) => {
    setQueue(songs, songs.findIndex(s => s.id === song.id));
    setSong(song);
  };

  return (
    <div className="flex flex-col">
      {/* Album Header */}
      <div className="flex flex-col md:flex-row gap-8 items-end p-8 bg-gradient-to-b from-[#404040] to-black min-h-[340px]">
        <div className="w-64 h-64 rounded shadow-2xl shrink-0">
          <img src={albumData?.image?.[2]?.url} alt={albumData?.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col gap-2 pb-2">
          <span className="text-[12px] font-bold uppercase tracking-widest">Album</span>
          <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">{decodeHtml(albumData?.name)}</h1>
          <div className="flex items-center gap-2 text-[14px] font-bold">
            <span className="text-white hover:underline cursor-pointer">{albumData?.artists?.primary?.[0]?.name}</span>
            <span className="text-text-muted">•</span>
            <span className="text-text-muted">{albumData?.year}</span>
            <span className="text-text-muted">•</span>
            <span className="text-text-muted">{songs.length} songs</span>
          </div>
        </div>
      </div>

      <div className="p-8 bg-black/40 backdrop-blur-sm min-h-screen">
        {/* Action Bar */}
        <div className="flex items-center gap-8 mb-8">
          <button 
            onClick={handlePlayAlbum}
            className="w-14 h-14 rounded-full bg-accent-1 flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          >
            <Play size={28} fill="black" className="ml-1 text-black" />
          </button>
          <button className="text-text-muted hover:text-white transition-colors">
            <Heart size={32} />
          </button>
          <button className="text-text-muted hover:text-white transition-colors">
            <MoreHorizontal size={32} />
          </button>
        </div>

        {/* Songs Table */}
        <div className="flex flex-col">
          <div className="grid grid-cols-[48px_1fr_120px_48px] px-4 py-2 text-[12px] font-bold uppercase tracking-wider text-text-muted border-b border-white/10">
            <div className="text-center">#</div>
            <div>Title</div>
            <div className="text-right flex justify-end items-center gap-2 pr-4"><Clock size={16} /></div>
            <div></div>
          </div>

          <div className="flex flex-col mt-4">
            {songs.map((song, index) => (
              <div 
                key={song.id}
                onClick={() => handlePlaySong(song)}
                className="grid grid-cols-[48px_1fr_120px_48px] px-4 py-3 rounded-md hover:bg-white/10 transition-colors group cursor-pointer items-center"
              >
                <div className="text-center text-text-muted group-hover:text-white font-medium">
                  {currentSong?.id === song.id && isPlaying ? (
                    <div className="flex items-end justify-center gap-0.5 h-4">
                      <div className="w-1 bg-accent-1 animate-pulse h-full" />
                      <div className="w-1 bg-accent-1 animate-pulse h-1/2" />
                      <div className="w-1 bg-accent-1 animate-pulse h-3/4" />
                    </div>
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className={clsx("text-[14px] font-medium truncate", currentSong?.id === song.id ? "text-accent-1" : "text-white")}>
                    {decodeHtml(song.name)}
                  </span>
                  <span className="text-[12px] text-text-muted truncate group-hover:text-white">{song.artists.primary[0].name}</span>
                </div>
                <div className="text-right text-[13px] text-text-muted font-medium pr-4">
                  {Math.floor(song.duration/60)}:{(song.duration%60).toString().padStart(2,'0')}
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Heart size={16} className="text-text-muted hover:text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlbumDetail;
