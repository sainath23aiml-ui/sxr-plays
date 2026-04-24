import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getArtistById, getArtistSongs, decodeHtml } from '../api/saavn';
import usePlayerStore from '../store/playerStore';
import { Play, Pause, Heart, MoreHorizontal, Check, UserPlus } from 'lucide-react';
import { clsx } from 'clsx';

const ArtistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentSong, isPlaying, setSong, setQueue, followedArtists, toggleFollowArtist, likedSongs, toggleLike } = usePlayerStore();

  const { data: artist, isLoading: isArtistLoading } = useQuery({
    queryKey: ['artist', id],
    queryFn: () => getArtistById(id),
  });

  const { data: artistSongs, isLoading: isSongsLoading } = useQuery({
    queryKey: ['artistSongs', id],
    queryFn: () => getArtistSongs(id),
    enabled: !!id,
  });

  if (isArtistLoading) return <div className="p-8 animate-pulse"><div className="h-64 bg-white/5 rounded-2xl mb-8" /><div className="h-10 w-48 bg-white/5 rounded mb-4" /><div className="space-y-2">{Array(5).fill(0).map((_, i) => <div key={i} className="h-16 bg-white/5 rounded" />)}</div></div>;

  const artistData = artist?.data;
  // Combine all fetched pages of songs
  const songs = artistSongs?.data?.results || [];
  const isFollowed = followedArtists.some(a => a.id === id);

  const handlePlayArtist = () => {
    if (songs.length > 0) {
      setQueue(songs, 0);
      setSong(songs[0]);
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-24">
      {/* Header Banner */}
      <div className="relative h-[45vh] min-h-[350px] flex items-end p-12 bg-gradient-to-b from-[#333333] to-[#121212]">
        <div className="absolute inset-0 bg-black/30" />
        {(artistData?.image?.[2]?.url || artistData?.image?.[2]) && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-50 mix-blend-overlay" 
            style={{ backgroundImage: `url(${artistData.image[2].url || artistData.image[2]})` }} 
          />
        )}
        
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <Check size={14} className="text-white" strokeWidth={4} />
            </div>
            <span className="text-[14px] font-bold text-white uppercase tracking-wider">Verified Artist</span>
          </div>
          <h1 className="text-8xl lg:text-9xl font-black text-white tracking-tighter leading-none">{decodeHtml(artistData?.name)}</h1>
          <p className="text-xl font-bold text-white/80">{artistData?.followerCount?.toLocaleString() || '11.5M'} monthly listeners</p>
        </div>
      </div>

      {/* Controls */}
      <div className="p-12 flex items-center gap-8">
        <button 
          onClick={handlePlayArtist}
          className="w-16 h-16 bg-accent-green rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-2xl"
        >
          <Play size={32} fill="black" className="ml-1" />
        </button>
        <button 
          onClick={() => toggleFollowArtist({ id, name: artistData.name, image: artistData.image })}
          className={clsx(
            "px-10 py-2.5 rounded-full font-black text-[14px] border-2 transition-all hover:scale-105",
            isFollowed ? "bg-white text-black border-white" : "border-white/30 text-white hover:border-white"
          )}
        >
          {isFollowed ? "Following" : "Follow"}
        </button>
        <button className="text-text-subdued hover:text-white transition-colors"><MoreHorizontal size={36} /></button>
      </div>

      {/* Popular Songs */}
      <div className="px-12 pb-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black">Popular Songs ({songs.length})</h2>
        </div>
        
        <div className="flex flex-col gap-2">
          {isSongsLoading ? (
             Array(10).fill(0).map((_, i) => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)
          ) : songs.length > 0 ? (
            songs.map((song, i) => {
              const isCurrent = currentSong?.id === song.id;
              const isLiked = likedSongs.some(s => s.id === song.id);
              return (
                <div 
                  key={`${song.id}-${i}`} 
                  onClick={() => { setQueue(songs, i); setSong(song); }}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/10 group cursor-pointer transition-all"
                >
                  <span className={clsx("w-8 text-right text-[15px] font-bold", isCurrent ? "text-accent-green" : "text-text-subdued")}>
                    {isCurrent && isPlaying ? <div className="visualizer-bar h-4 inline-block mx-1" /> : i + 1}
                  </span>
                  <div className="w-12 h-12 rounded-lg overflow-hidden relative shadow-lg">
                    <img src={song.image?.[1]?.url || song.image?.[1]} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Play size={20} fill="white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={clsx("text-[16px] font-black truncate", isCurrent ? "text-accent-green" : "text-white")}>{decodeHtml(song.name || song.title)}</p>
                    <p className="text-[14px] text-text-subdued truncate group-hover:text-white">{song.playCount?.toLocaleString() || song.subtitle || 'Verified Hit'}</p>
                  </div>
                  <div className="flex items-center gap-8 opacity-0 group-hover:opacity-100 transition-all pr-4">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleLike(song); }}
                      className={clsx(isLiked ? "text-accent-green" : "text-text-subdued hover:text-white")}
                    >
                      <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                    </button>
                    <span className="text-[14px] text-text-subdued font-bold tabular-nums">{song.duration ? `${Math.floor(song.duration/60)}:${(song.duration%60).toString().padStart(2, '0')}` : '3:45'}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
              <p className="text-text-subdued font-bold italic">No songs found for this artist. Try another artist or check your connection.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtistDetail;
