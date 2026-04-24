import React, { useState, Suspense, lazy } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  getTrending, getHindiHits, getTamilHits, getTeluguHits, 
  getPunjabiHits, getKannadaHits, getTopArtists, getArtistSongs, decodeHtml 
} from '../api/saavn';
import usePlayerStore from '../store/playerStore';
import { Play, Plus, Heart, Flame, Star, Mic2, ChevronRight, Music2, Layers, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { toast } from 'react-hot-toast';

// Custom 3D Component
import MusicVisualizer3D from '../components/ui/MusicVisualizer3D';
import PlaylistPicker from '../components/ui/PlaylistPicker';
import { CardSkeleton } from '../components/ui/Skeleton';
import { useContextMenuStore } from '../store/contextMenuStore';
import BentoGrid from '../components/ui/BentoGrid';


const SongCard = ({ song, list }) => {
  const { setSong, setQueue, likedSongs, toggleLike } = usePlayerStore();
  const { openMenu } = useContextMenuStore();
  const [showPicker, setShowPicker] = useState(false);
  const isLiked = likedSongs.some(s => s.id === song.id);

  return (
    <div 
      className="bg-[#181818]/40 backdrop-blur-md border border-white/5 hover:border-[#1DB954]/40 hover:bg-[#282828]/80 p-3 md:p-4 rounded-[20px] group relative flex flex-col transition-all duration-500 hover:-translate-y-3 shadow-lg hover:shadow-[0_20px_40px_rgba(29,185,84,0.15)]"
      onContextMenu={(e) => openMenu(e, song)}
    >
      <div 
        className="relative aspect-square mb-4 rounded-xl overflow-hidden cursor-pointer shadow-lg" 
        onClick={() => { setSong(song); setQueue(list, list.findIndex(s => s.id === song.id)); }}
      >
        <img src={song.image?.[2]?.url || song.image?.[2] || song.image?.[0]?.url || song.image?.[0]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute right-3 bottom-3 translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 shadow-2xl">
          <div className="w-12 h-12 bg-accent-green rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform text-black shadow-[0_10px_20px_rgba(29,185,84,0.4)]">
             <Play size={22} fill="currentColor" className="ml-1" />
          </div>
        </div>
      </div>
      <div className="flex flex-col relative z-10 px-1">
        <h3 className="font-black text-white truncate text-[16px] mb-1 drop-shadow-md group-hover:text-accent-green transition-colors duration-300">{decodeHtml(song.name || song.title)}</h3>
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-medium text-white/50 truncate flex-1 hover:text-white transition-colors cursor-pointer">{decodeHtml(song.artists?.primary?.[0]?.name || song.artists?.all?.[0]?.name || song.subtitle)}</p>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[#181818]/80 backdrop-blur-xl px-2 py-1 rounded-full border border-white/5 -mr-1">
            <button onClick={() => toggleLike(song)} className={clsx("transition-transform hover:scale-110", isLiked ? "text-accent-green" : "text-white/70 hover:text-white")}>
              <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
            </button>
            <div className="relative">
              <button onClick={() => setShowPicker(!showPicker)} className="text-white/70 hover:text-white hover:scale-110 transition-transform"><Plus size={18} /></button>
              {showPicker && <PlaylistPicker song={song} onClose={() => setShowPicker(false)} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const { followedArtists, toggleFollowArtist, setSong, setQueue, history } = usePlayerStore();
  const navigate = useNavigate();
  const [limits, setLimits] = useState({ trending: 12, hindi: 12, tamil: 12, telugu: 12, punjabi: 12, kannada: 12 });

  const { data: trending, isLoading: tl } = useQuery({ queryKey: ['trending'], queryFn: getTrending });
  const { data: hindi, isLoading: hl } = useQuery({ queryKey: ['hindi'], queryFn: getHindiHits });
  const { data: tamil, isLoading: tml } = useQuery({ queryKey: ['tamil'], queryFn: getTamilHits });
  const { data: telugu, isLoading: tgl } = useQuery({ queryKey: ['telugu'], queryFn: getTeluguHits });
  const { data: punjabi, isLoading: pl } = useQuery({ queryKey: ['punjabi'], queryFn: getPunjabiHits });
  const { data: kannada, isLoading: kl } = useQuery({ queryKey: ['kannada'], queryFn: getKannadaHits });
  const { data: artists, isLoading: al } = useQuery({ queryKey: ['topArtists'], queryFn: getTopArtists });

  const { data: followedSongs } = useQuery({
    queryKey: ['followedSongs', followedArtists.map(a => a.id).join(',')],
    queryFn: async () => {
      const results = await Promise.all(followedArtists.slice(0, 3).map(a => getArtistSongs(a.id, 1)));
      return results.flatMap(res => res.data?.results || []);
    },
    enabled: followedArtists.length > 0,
  });

  const handleLoadMore = (key) => {
    setLimits(prev => ({ ...prev, [key]: prev[key] + 12 }));
  };

  const renderSection = (id, title, list, loading, Icon) => {
    if (loading) {
      return (
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-8">
            {Icon && <Icon className="text-accent-green" size={28} />}
            <h2 className="text-3xl font-black tracking-tight">{title}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 lg:gap-8">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        </section>
      );
    }
    if (!list || list.length === 0) return null;
    const currentLimit = limits[id] || 12;

    return (
      <section className="mb-14 animate-fade-in">
        <div className="flex items-end justify-between mb-8 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            {Icon && <div className="p-2.5 bg-gradient-to-br from-[#1DB954] to-emerald-700 rounded-xl shadow-[0_0_20px_rgba(29,185,84,0.3)]"><Icon className="text-black" size={24} strokeWidth={2.5} /></div>}
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 drop-shadow-md">{title}</h2>
          </div>
          <button onClick={() => navigate(id === 'artists' ? '/artists' : '/discover')} className="text-[12px] font-black uppercase tracking-widest text-white/50 hover:text-accent-green transition-colors flex items-center gap-1 group bg-white/5 px-4 py-2 rounded-full hover:bg-white/10">
            Show all
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 lg:gap-8">
          {list.slice(0, currentLimit).map((song) => <SongCard key={song.id} song={song} list={list} />)}
        </div>
        {list.length > currentLimit && (
          <div className="flex justify-center mt-10 animate-fade-in">
            <button 
              onClick={() => handleLoadMore(id)}
              className="px-8 py-3 rounded-full border-2 border-white/20 text-[14px] font-black hover:bg-white hover:text-black hover:border-white transition-all hover:scale-105 active:scale-95 shadow-xl"
            >
              Load More Tracks
            </button>
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="flex flex-col min-h-full pb-24 overflow-x-hidden">
      {/* 3D Cinematic Hero Section */}
      <div className="relative h-[450px] md:h-[550px] w-full overflow-hidden mb-8 rounded-b-[40px] shadow-2xl">
        <div className="absolute inset-0 bg-[#0a0a0a] -z-10" />
        
        <div className="absolute inset-0 z-0">
          <Suspense fallback={null}>
            <MusicVisualizer3D />
          </Suspense>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent z-10" />
        
        <div className="relative z-20 h-full flex flex-col justify-center p-6 sm:p-12 max-w-[1400px] mx-auto w-full">
          <div className="flex items-center gap-2 text-accent-green mb-4 font-bold tracking-[0.2em] uppercase text-[12px] animate-fade-in">
            <Music2 size={18} fill="currentColor" />
            Curated for you
          </div>
          <h1 className="text-6xl sm:text-8xl md:text-9xl font-black text-white mb-6 leading-none tracking-tighter animate-slide-up">
            SXR <span className="text-white/40">Music</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/60 max-w-xl mb-8 font-medium animate-slide-up delay-100">
            Discover hits, follow your favorite artists, and listen offline anywhere.
          </p>
          <div className="flex items-center gap-4 animate-slide-up delay-200">
            <button 
              onClick={() => trending?.data?.results && (setSong(trending.data.results[0]), setQueue(trending.data.results, 0))}
              className="px-10 py-4 bg-white text-black rounded-full font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              Start Listening
            </button>
          </div>
        </div>
      </div>

      <div className="p-8 pt-0 max-w-[1500px] mx-auto w-full">
        {/* Bento Grid for Personalization */}
        <BentoGrid trendingSongs={trending?.data?.results || []} />

        {followedArtists.length > 0 && (
          renderSection(`followed`, `From Your Circle`, followedSongs, false, Star)
        )}

        {renderSection("trending", "Trending Worldwide", trending?.data?.results || trending?.data, tl, Flame)}

        <section className="mb-16">
          <div className="flex items-end justify-between mb-8 border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-700 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)]"><Mic2 className="text-white" size={24} strokeWidth={2.5} /></div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 drop-shadow-md">Top Artists</h2>
            </div>
            <button onClick={() => navigate('/artists')} className="text-[12px] font-black uppercase tracking-widest text-white/50 hover:text-indigo-400 transition-colors flex items-center gap-1 group bg-white/5 px-4 py-2 rounded-full hover:bg-white/10">
              Show all 
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
            {al ? (
              Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} type="circle" />)
            ) : (
              artists?.data?.results?.slice(0, 6).map((artist) => {
                const isFollowed = followedArtists.some(a => a.id === artist.id);
                return (
                <div key={artist.id} className="spotify-card group flex flex-col items-center text-center perspective-1000">
                  <div className="relative aspect-square w-full mb-6 shadow-2xl rounded-full overflow-hidden cursor-pointer transition-transform duration-500 group-hover:rotate-y-12 bg-white/5 flex items-center justify-center" onClick={() => navigate(`/artist/${artist.id}`)}>
                    {(artist.image?.[2]?.url || artist.image?.[2] || artist.image?.[1]?.url || artist.image?.[1] || artist.image?.[0]?.url || artist.image?.[0]) ? (
                      <img src={artist.image?.[2]?.url || artist.image?.[2] || artist.image?.[1]?.url || artist.image?.[1] || artist.image?.[0]?.url || artist.image?.[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Mic2 size={40} className="text-white/20" />
                    )}
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/40 transition-colors" />
                    <div className="absolute right-4 bottom-4 spotify-play-btn translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all shadow-2xl"><Play size={24} fill="black" className="ml-1" /></div>
                  </div>
                  <h3 className="font-black truncate text-[16px] w-full mb-4">{decodeHtml(artist.name)}</h3>
                  <button 
                    onClick={() => toggleFollowArtist(artist)}
                    className={clsx(
                      "px-8 py-2 rounded-full text-[13px] font-black border transition-all hover:scale-105 active:scale-95",
                      isFollowed ? "bg-white text-black border-white" : "text-white border-white/20 hover:border-white hover:bg-white/5"
                    )}
                  >
                    {isFollowed ? "Following" : "Follow"}
                  </button>
                </div>
              );
            }))}
          </div>
        </section>

        {renderSection("hindi", "Bollywood Superhits", hindi?.data?.results || hindi?.data, hl, Music2)}
        {renderSection("telugu", "Telugu Trends", telugu?.data?.results || telugu?.data, tgl)}
        {renderSection("punjabi", "Punjabi Power", punjabi?.data?.results || punjabi?.data, pl)}
        {renderSection("tamil", "Tamil Hits", tamil?.data?.results || tamil?.data, tml)}
        {renderSection("kannada", "Kannada Classics", kannada?.data?.results || kannada?.data, kl)}
      </div>
    </div>
  );
};

export default Home;
