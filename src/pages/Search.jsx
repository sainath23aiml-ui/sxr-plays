import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchAll, decodeHtml } from '../api/saavn';
import usePlayerStore from '../store/playerStore';
import { Play, Plus, Heart, MoreHorizontal, Clock, Disc } from 'lucide-react';
import { clsx } from 'clsx';
import PlaylistPicker from '../components/ui/PlaylistPicker';
import { CardSkeleton, RowSkeleton } from '../components/ui/Skeleton';
import { useContextMenuStore } from '../store/contextMenuStore';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const navigate = useNavigate();
  const { setSong, setQueue, likedSongs, toggleLike } = usePlayerStore();
  const { openMenu } = useContextMenuStore();
  const [activeFilter, setActiveFilter] = useState('all');
  const [pickerSong, setPickerSong] = useState(null);

  const { data: results, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: () => searchAll(query),
    enabled: !!query,
  });

  if (!query) {
    return (
      <div className="p-4 md:p-8 pt-4 min-h-screen">
        <h1 className="text-4xl md:text-5xl font-black mb-8 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
          Explore Worlds
        </h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {categories.map((cat, i) => (
            <div 
              key={cat.name} 
              className={clsx(
                "relative rounded-[24px] p-6 overflow-hidden cursor-pointer group transition-all duration-500 shadow-2xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]",
                cat.color,
                i % 4 === 0 || i % 7 === 0 ? "aspect-[4/5] md:col-span-2 md:aspect-[2/1] lg:col-span-1 lg:aspect-[4/5]" : "aspect-square"
              )}
              onClick={() => navigate(`/discover?lang=${cat.name.toLowerCase()}`)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <h3 className="text-2xl md:text-3xl font-black text-white leading-tight relative z-10 group-hover:scale-110 transition-transform duration-500 origin-top-left drop-shadow-lg">
                {cat.name}
              </h3>
              
              <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-black/20 rounded-full blur-2xl group-hover:bg-black/40 transition-colors" />
              <Disc size={120} strokeWidth={1} className="absolute -right-8 -bottom-8 text-white opacity-20 group-hover:rotate-[45deg] group-hover:scale-125 group-hover:opacity-40 transition-all duration-700 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const songs = results?.data?.songs?.results || [];
  const topResult = songs[0];
  const artists = results?.data?.artists?.results || [];
  const albums = results?.data?.albums?.results || [];

  return (
    <div className="p-8 min-h-full relative">
      {pickerSong && <PlaylistPicker song={pickerSong} onClose={() => setPickerSong(null)} />}
      {/* Search Filters */}
      <div className="flex items-center gap-3 mb-8 sticky top-0 z-20 py-2 bg-[#121212]/80 backdrop-blur-md">
        {['all', 'songs', 'artists', 'albums'].map(filter => (
          <button 
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={clsx(
              "px-4 py-1.5 rounded-full text-[14px] font-bold transition-all capitalize",
              activeFilter === filter ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20"
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-[40%]"><CardSkeleton /></div>
            <div className="flex-1 flex flex-col gap-2">
              <RowSkeleton />
              <RowSkeleton />
              <RowSkeleton />
              <RowSkeleton />
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-fade-in">
          {activeFilter === 'all' && (
            <div className="flex flex-col lg:flex-row gap-8 mb-12">
              {/* Top Result */}
              {topResult && (
                <div className="w-full lg:w-[45%]">
                  <h2 className="text-2xl font-black mb-4 tracking-tight">Top Match</h2>
                  <div 
                    onClick={() => { setSong(topResult); setQueue(songs, 0); }}
                    onContextMenu={(e) => openMenu(e, topResult)}
                    className="bg-gradient-to-br from-[#181818] to-[#121212] hover:from-[#282828] hover:to-[#181818] p-6 md:p-8 rounded-[32px] transition-all cursor-pointer group relative shadow-2xl border border-white/5 overflow-hidden"
                  >
                    {/* Glowing backdrop for image */}
                    <div className="absolute top-8 left-8 w-32 h-32 bg-accent-green/30 blur-[60px] group-hover:bg-accent-green/50 transition-colors pointer-events-none" />
                    
                    <img src={topResult.image?.[2]?.url || topResult.image?.[2] || topResult.image?.[0]?.url || topResult.image?.[0]} className="relative z-10 w-32 h-32 md:w-40 md:h-40 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] mb-8 group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-500 object-cover" />
                    
                    <h3 className="relative z-10 text-4xl md:text-5xl font-black text-white mb-3 truncate tracking-tighter drop-shadow-lg">{decodeHtml(topResult.name || topResult.title)}</h3>
                    
                    <div className="relative z-10 flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full bg-white/10 text-[12px] font-black tracking-widest text-white uppercase backdrop-blur-md border border-white/5">SONG</span>
                      <span className="text-[15px] font-bold text-white/70 hover:text-white hover:underline transition-colors" onClick={(e) => { e.stopPropagation(); navigate(`/artist/${topResult.artists?.primary?.[0]?.id || topResult.artists?.all?.[0]?.id}`); }}>
                        {decodeHtml(topResult.artists?.primary?.[0]?.name || topResult.artists?.all?.[0]?.name || topResult.subtitle)}
                      </span>
                    </div>
                    
                    <div className="absolute right-6 bottom-6 flex items-center gap-2 md:gap-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-20">
                      <button onClick={(e) => { e.stopPropagation(); toggleLike(topResult); }} className={clsx("w-12 h-12 rounded-full flex items-center justify-center bg-black/40 hover:bg-black/80 backdrop-blur-xl transition-colors border border-white/10", likedSongs.some(s => s.id === topResult.id) ? "text-accent-green border-accent-green/30" : "text-white")}>
                        <Heart size={22} fill={likedSongs.some(s => s.id === topResult.id) ? "currentColor" : "none"} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setPickerSong(topResult); }} className="w-12 h-12 rounded-full flex items-center justify-center bg-black/40 hover:bg-black/80 backdrop-blur-xl text-white transition-colors border border-white/10">
                        <Plus size={24} />
                      </button>
                      <div className="w-16 h-16 bg-accent-green rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(29,185,84,0.4)] hover:scale-110 hover:bg-white transition-all text-black">
                        <Play size={28} fill="currentColor" className="ml-1" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Songs Section */}
              <div className="flex-1">
                <h2 className="text-2xl font-black mb-4">Songs</h2>
                <div className="flex flex-col gap-1">
                  {songs.map((song, i) => {
                    const isLiked = likedSongs.some(s => s.id === song.id);
                    return (
                      <div 
                        key={song.id} 
                        onClick={() => { setSong(song); setQueue(songs, i); }}
                        onContextMenu={(e) => openMenu(e, song)}
                        className="flex items-center gap-4 p-2 rounded-lg hover:bg-white/10 group cursor-pointer transition-colors"
                      >
                        <div className="relative w-10 h-10 shrink-0">
                          <img src={song.image?.[0]?.url} className="w-full h-full rounded object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Play size={16} fill="white" /></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[15px] font-bold text-white truncate">{decodeHtml(song.name)}</p>
                          <p className="text-[13px] text-text-subdued truncate group-hover:text-white">{decodeHtml(song.artists?.primary?.[0]?.name)}</p>
                        </div>
                        <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); toggleLike(song); }} className={clsx(isLiked ? "text-accent-green" : "text-text-subdued hover:text-white transition-colors")}>
                            <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
                          </button>
                          <MoreHorizontal className="w-5 h-5 text-text-subdued hover:text-white transition-colors" onClick={(e) => openMenu(e, song)} />
                          <span className="text-[13px] text-text-subdued tabular-nums ml-2">3:24</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Grid Views for Artists/Albums */}
          <div className="space-y-12">
             {(activeFilter === 'all' || activeFilter === 'artists') && artists.length > 0 && (
               <section>
                 <h2 className="text-2xl font-black mb-6">Artists</h2>
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                   {artists.map(artist => {
                     const imageUrl = artist.image?.[2]?.url || artist.image?.[2] || artist.image?.[1]?.url || artist.image?.[1] || artist.image?.[0]?.url || artist.image?.[0];
                     return (
                       <div key={artist.id} onClick={() => navigate(`/artist/${artist.id}`)} className="spotify-card group text-center flex flex-col items-center">
                         <div className="relative aspect-square w-full mb-4 rounded-full overflow-hidden shadow-2xl bg-white/5 flex items-center justify-center">
                           {imageUrl ? (
                             <img src={imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                           ) : (
                             <Mic2 size={40} className="text-white/20" />
                           )}
                           <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100" />
                         </div>
                         <p className="font-bold text-[14px] truncate w-full">{decodeHtml(artist.name)}</p>
                         <p className="text-[12px] text-text-subdued">Artist</p>
                       </div>
                     );
                   })}
                 </div>
               </section>
             )}

             {(activeFilter === 'all' || activeFilter === 'albums') && albums.length > 0 && (
               <section>
                 <h2 className="text-2xl font-black mb-6">Albums</h2>
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                   {albums.map(album => (
                     <div key={album.id} onClick={() => navigate(`/album/${album.id}`)} className="spotify-card group">
                       <div className="relative aspect-square w-full mb-4 rounded-lg overflow-hidden shadow-2xl">
                         <img src={album.image?.[2]?.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                         <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100" />
                         <div className="absolute right-2 bottom-2 spotify-play-btn"><Play size={24} fill="black" className="ml-1" /></div>
                       </div>
                       <p className="font-bold text-[14px] truncate w-full">{decodeHtml(album.name)}</p>
                       <p className="text-[12px] text-text-subdued truncate">{decodeHtml(album.artists?.primary?.[0]?.name)}</p>
                     </div>
                   ))}
                 </div>
               </section>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

const categories = [
  { name: 'Pop', color: 'bg-gradient-to-br from-fuchsia-600 to-purple-800' },
  { name: 'Hip-Hop', color: 'bg-gradient-to-br from-orange-500 to-red-700' },
  { name: 'Lo-Fi', color: 'bg-gradient-to-br from-emerald-400 to-teal-700' },
  { name: 'Bollywood', color: 'bg-gradient-to-br from-pink-500 to-rose-800' },
  { name: 'Romance', color: 'bg-gradient-to-br from-rose-400 to-red-600' },
  { name: 'Workout', color: 'bg-gradient-to-br from-amber-400 to-orange-600' },
  { name: 'Chill', color: 'bg-gradient-to-br from-sky-400 to-blue-700' },
  { name: 'Party', color: 'bg-gradient-to-br from-violet-500 to-purple-800' },
  { name: 'Punjabi', color: 'bg-gradient-to-br from-yellow-400 to-orange-600' },
  { name: 'Tamil', color: 'bg-gradient-to-br from-green-400 to-emerald-700' },
  { name: 'Telugu', color: 'bg-gradient-to-br from-blue-500 to-indigo-800' },
  { name: 'Rock', color: 'bg-gradient-to-br from-zinc-600 to-gray-900' },
  { name: 'EDM', color: 'bg-gradient-to-br from-indigo-400 to-cyan-700' },
  { name: 'Indie', color: 'bg-gradient-to-br from-orange-400 to-amber-700' },
  { name: 'Classical', color: 'bg-gradient-to-br from-slate-500 to-slate-800' },
  { name: 'K-Pop', color: 'bg-gradient-to-br from-fuchsia-400 to-pink-700' },
];

export default Search;
