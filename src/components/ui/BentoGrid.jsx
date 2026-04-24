import React from 'react';
import { Play, Heart, Download, TrendingUp, Clock, Star, Mic2, Music2 } from 'lucide-react';
import { clsx } from 'clsx';
import usePlayerStore from '../../store/playerStore';
import useDownloadStore from '../../store/downloadStore';
import { decodeHtml } from '../../api/saavn';
import { useNavigate } from 'react-router-dom';

const BentoGrid = ({ trendingSongs = [] }) => {
  const { history, likedSongs, followedArtists, setSong, setQueue } = usePlayerStore();
  const { downloadedSongs } = useDownloadStore();
  const navigate = useNavigate();

  const handlePlaySong = (song, list) => {
    if (!song) return;
    setQueue(list, list.findIndex(s => s.id === song.id));
    setSong(song);
  };

  const featuredSong = trendingSongs[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-auto md:grid-rows-2 gap-4 h-auto md:h-[600px] mb-12">
      {/* 1. Featured Artist / Now Playing (Large 2x2) */}
      <div 
        className="md:col-span-2 md:row-span-2 bg-[#181818] rounded-[2rem] overflow-hidden relative group cursor-pointer border border-white/5 shadow-2xl"
        onClick={() => featuredSong && handlePlaySong(featuredSong, trendingSongs)}
      >
        {featuredSong && (
          <img 
            src={featuredSong.image?.[2]?.url} 
            className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
            alt=""
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <div className="absolute bottom-8 left-8 right-8 z-10">
          <div className="flex items-center gap-2 text-accent-green font-bold text-xs uppercase tracking-widest mb-2">
            <TrendingUp size={14} />
            Trending Now
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-2 leading-tight">
            {featuredSong ? decodeHtml(featuredSong.name) : "Ready to Play?"}
          </h2>
          <p className="text-white/60 text-lg font-medium mb-6">
            {featuredSong ? decodeHtml(featuredSong.artists?.primary?.[0]?.name) : "Discover the latest hits"}
          </p>
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black hover:scale-110 active:scale-95 transition-all shadow-xl">
            <Play size={32} fill="currentColor" className="ml-1" />
          </div>
        </div>
      </div>

      {/* 2. Recently Played (Wide 2x1) */}
      <div className="md:col-span-2 bg-[#181818] rounded-[2rem] p-6 border border-white/5 relative overflow-hidden group">
        <div className="flex items-center justify-between mb-4 relative z-10">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Clock size={20} className="text-blue-400" />
            Recents
          </h3>
          <button onClick={() => navigate('/history')} className="text-xs font-bold text-white/40 hover:text-white uppercase tracking-wider">View All</button>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar relative z-10 h-[calc(100%-40px)]">
          {history.slice(0, 4).map((song) => (
            <div 
              key={song.id} 
              onClick={() => handlePlaySong(song, history)}
              className="flex-shrink-0 w-24 h-full flex flex-col gap-2 group/item cursor-pointer"
            >
              <div className="aspect-square bg-white/5 rounded-xl overflow-hidden relative shadow-lg">
                <img src={song.image?.[1]?.url} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform" alt="" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 flex items-center justify-center transition-opacity">
                  <Play size={20} fill="white" className="text-white" />
                </div>
              </div>
              <p className="text-[11px] font-bold truncate px-1">{decodeHtml(song.name)}</p>
            </div>
          ))}
          {history.length === 0 && (
            <div className="flex flex-col items-center justify-center w-full h-full text-white/20">
              <Music2 size={40} strokeWidth={1} />
              <p className="text-xs font-bold mt-2 tracking-widest uppercase">Start Listening</p>
            </div>
          )}
        </div>
      </div>

      {/* 3. Liked Songs (Square 1x1) */}
      <div 
        onClick={() => navigate('/library')}
        className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2rem] p-6 flex flex-col justify-end gap-2 relative group cursor-pointer overflow-hidden shadow-xl"
      >
        <Heart size={80} className="absolute -right-4 -top-4 opacity-20 rotate-12 group-hover:scale-110 transition-transform duration-700" fill="white" />
        <h3 className="text-2xl font-black text-white">Liked</h3>
        <p className="text-white/70 text-xs font-bold uppercase tracking-widest">{likedSongs.length} Tracks</p>
      </div>

      {/* 4. Downloads (Square 1x1) */}
      <div 
        onClick={() => navigate('/library')}
        className="bg-gradient-to-br from-emerald-500 to-teal-700 rounded-[2rem] p-6 flex flex-col justify-end gap-2 relative group cursor-pointer overflow-hidden shadow-xl"
      >
        <Download size={80} className="absolute -right-4 -top-4 opacity-20 -rotate-12 group-hover:scale-110 transition-transform duration-700" fill="white" />
        <h3 className="text-2xl font-black text-white">Offline</h3>
        <p className="text-white/70 text-xs font-bold uppercase tracking-widest">{downloadedSongs.length} Songs</p>
      </div>
    </div>
  );
};

export default BentoGrid;
