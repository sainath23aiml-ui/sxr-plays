import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTopArtists, decodeHtml } from '../api/saavn';
import { useNavigate } from 'react-router-dom';
import { Play, Mic2, Heart } from 'lucide-react';
import usePlayerStore from '../store/playerStore';
import { clsx } from 'clsx';

const AllArtists = () => {
  const navigate = useNavigate();
  const { followedArtists, toggleFollowArtist } = usePlayerStore();

  const { data: artists, isLoading } = useQuery({
    queryKey: ['allArtists'],
    queryFn: () => getTopArtists(),
  });

  const artistList = artists?.data?.results || [];

  return (
    <div className="p-8 pb-24">
      <div className="flex items-center gap-4 mb-12">
        <div className="w-12 h-12 bg-accent-green rounded-full flex items-center justify-center text-black">
          <Mic2 size={24} />
        </div>
        <div>
          <h1 className="text-5xl font-black">All Artists</h1>
          <p className="text-text-subdued font-medium">Explore the top talent from around the world.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
        {isLoading ? (
          Array(18).fill(0).map((_, i) => (
            <div key={i} className="aspect-square rounded-full bg-white/5 animate-pulse" />
          ))
        ) : (
          artistList.map((artist) => {
            const isFollowed = followedArtists.some(a => a.id === artist.id);
            const imageUrl = artist.image?.[2]?.url || artist.image?.[2] || artist.image?.[1]?.url || artist.image?.[1] || artist.image?.[0]?.url || artist.image?.[0];
            
            return (
              <div key={artist.id} className="spotify-card group flex flex-col items-center text-center cursor-pointer" onClick={() => navigate(`/artist/${artist.id}`)}>
                <div className="relative aspect-square w-full mb-6 shadow-2xl rounded-full overflow-hidden bg-white/5 flex items-center justify-center">
                  {imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt={artist.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                  ) : (
                    <Mic2 size={48} className="text-white/20" />
                  )}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/40 transition-colors" />
                  <div className="absolute right-4 bottom-4 spotify-play-btn translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all shadow-2xl">
                    <Play size={24} fill="black" className="ml-1" />
                  </div>
                </div>
                <h3 className="font-black truncate text-[16px] w-full mb-4">{decodeHtml(artist.name)}</h3>
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleFollowArtist(artist); }}
                  className={clsx(
                    "px-8 py-2 rounded-full text-[13px] font-black border transition-all hover:scale-105 active:scale-95",
                    isFollowed ? "bg-white text-black border-white" : "text-white border-white/20 hover:border-white hover:bg-white/5"
                  )}
                >
                  {isFollowed ? "Following" : "Follow"}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AllArtists;
