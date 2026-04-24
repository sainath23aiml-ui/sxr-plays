import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSongsByLanguage, decodeHtml } from '../api/saavn';
import usePlayerStore from '../store/playerStore';
import { Play, Heart, Plus, ChevronRight, Filter } from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'react-hot-toast';
import PlaylistPicker from '../components/ui/PlaylistPicker';

const Languages = () => {
  const [selectedLang, setSelectedLang] = useState('hindi');
  const [page, setPage] = useState(1);
  const [allSongs, setAllSongs] = useState([]);
  const { setSong, setQueue, likedSongs, toggleLike } = usePlayerStore();
  const [pickerSong, setPickerSong] = useState(null);

  const { data: songsData, isLoading, isFetching } = useQuery({
    queryKey: ['languages', selectedLang, page],
    queryFn: () => getSongsByLanguage(selectedLang, page, 50),
    keepPreviousData: true,
  });

  useEffect(() => {
    if (songsData?.data) {
      const newSongs = songsData.data.results || songsData.data.songs || [];
      if (page === 1) {
        setAllSongs(newSongs);
      } else {
        setAllSongs(prev => [...prev, ...newSongs]);
      }
    }
  }, [songsData, page]);

  const handleLangChange = (lang) => {
    setSelectedLang(lang);
    setPage(1);
    setAllSongs([]);
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  return (
    <div className="p-8 pb-24 relative">
      {pickerSong && <PlaylistPicker song={pickerSong} onClose={() => setPickerSong(null)} />}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/5 pb-8 relative">
        <div className="absolute top-0 right-10 w-96 h-96 bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 blur-[100px] pointer-events-none -z-10" />
        <div>
          <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 drop-shadow-md">Discover</h1>
          <p className="text-white/60 font-medium text-lg md:text-xl">Explore the biggest hits across multiple languages.</p>
        </div>
        
        <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
          {languages.map(lang => (
            <button 
              key={lang.id}
              onClick={() => handleLangChange(lang.id)}
              className={clsx(
                "px-6 py-2.5 rounded-full text-[13px] uppercase tracking-widest font-bold transition-all whitespace-nowrap border",
                selectedLang === lang.id 
                  ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105" 
                  : "bg-black/40 backdrop-blur-md text-white/70 border-white/10 hover:border-white/30 hover:text-white"
              )}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 mb-12">
        {allSongs.map((song, i) => {
          const isLiked = likedSongs.some(s => s.id === song.id);
          return (
            <div key={`${song.id}-${i}`} className="group relative perspective-1000">
              <div className="bg-[#1a1a1a] p-3 pb-6 rounded-sm shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/5 transform transition-all duration-500 group-hover:-translate-y-4 group-hover:rotate-2 group-hover:shadow-[0_20px_50px_rgba(255,255,255,0.1)]">
                {/* Vinyl Record emerging effect on hover */}
                <div className="absolute top-4 right-4 w-[85%] aspect-square rounded-full bg-[#111] shadow-2xl transition-transform duration-700 ease-out group-hover:translate-x-6 group-hover:-translate-y-2 group-hover:rotate-[60deg] opacity-0 group-hover:opacity-100 border border-[#222] overflow-hidden -z-10">
                   {/* Vinyl Grooves */}
                   <div className="absolute inset-0 rounded-full border-[20px] border-[#181818]" />
                   <div className="absolute inset-0 rounded-full border-[40px] border-[#151515]" />
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full overflow-hidden">
                     <img src={song.image?.[0]?.url} className="w-full h-full object-cover opacity-80" />
                   </div>
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-black rounded-full" />
                </div>

                <div 
                  className="relative w-full aspect-square mb-4 overflow-hidden bg-[#222] shadow-inner cursor-pointer"
                  onClick={() => { setSong(song); setQueue(allSongs, i); }}
                >
                  <img src={song.image?.[2]?.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter group-hover:contrast-110 group-hover:saturate-120" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-100 scale-50">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-110 hover:bg-white transition-all hover:text-black">
                      <Play size={28} fill="currentColor" className="ml-1" />
                    </div>
                  </div>
                </div>

                {/* Polaroid Text Area */}
                <div className="flex flex-col px-1 bg-[#1a1a1a] relative z-10">
                  <h3 className="font-bold text-[16px] truncate text-white tracking-tight mb-1">{decodeHtml(song.name)}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-[12px] uppercase tracking-wider text-white/50 font-bold truncate flex-1">{decodeHtml(song.artists?.primary?.[0]?.name)}</p>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/40 rounded-full px-2 py-1 backdrop-blur-sm -mr-2">
                      <button 
                        onClick={() => toggleLike(song)}
                        className={clsx("transition-transform hover:scale-110", isLiked ? "text-rose-500" : "text-white/60 hover:text-white")}
                      >
                        <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
                      </button>
                      <button 
                        onClick={() => setPickerSong(song)}
                        className="text-white/60 hover:text-white transition-transform hover:scale-110 p-1"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {isLoading && page === 1 && (
          Array(12).fill(0).map((_, i) => (
            <div key={i} className="aspect-square bg-white/5 rounded-xl animate-pulse" />
          ))
        )}
      </div>

      {allSongs.length > 0 && (
        <div className="flex justify-center mt-12">
          <button 
            onClick={handleLoadMore}
            disabled={isFetching}
            className={clsx(
              "px-12 py-3 rounded-full bg-white text-black font-black text-[15px] hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center gap-3",
              isFetching && "opacity-50 cursor-not-allowed"
            )}
          >
            {isFetching ? "LOADING..." : "LOAD MORE SONGS"}
          </button>
        </div>
      )}
    </div>
  );
};

const languages = [
  { id: 'hindi', name: 'Hindi' },
  { id: 'punjabi', name: 'Punjabi' },
  { id: 'telugu', name: 'Telugu' },
  { id: 'tamil', name: 'Tamil' },
  { id: 'kannada', name: 'Kannada' },
  { id: 'english', name: 'English' },
  { id: 'malayalam', name: 'Malayalam' },
  { id: 'marathi', name: 'Marathi' },
];

export default Languages;
