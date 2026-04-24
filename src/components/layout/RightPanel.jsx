import React, { useState } from 'react';
import { X, MoreHorizontal, Mic2, ListMusic, Music2, Heart, Plus } from 'lucide-react';
import usePlayerStore from '../../store/playerStore';
import { decodeHtml } from '../../api/saavn';
import LyricsPanel from '../features/LyricsPanel';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';
import Logo from '../ui/Logo';

const RightPanel = ({ onClose }) => {
  const navigate = useNavigate();
  const { currentSong, likedSongs, toggleLike, followedArtists, toggleFollowArtist } = usePlayerStore();
  const [view, setView] = useState('info'); 

  if (!currentSong) return (
    <aside className="w-[350px] h-full flex flex-col bg-[#121212] border-l border-white/5 items-center justify-center p-8 text-center gap-4 text-text-subdued">
      <Music2 size={48} />
      <p className="text-[14px] font-medium">Play a song to see details here</p>
    </aside>
  );

  const isLiked = likedSongs.some(s => s.id === currentSong.id);
  const primaryArtist = currentSong.artists?.primary?.[0];
  const isFollowed = primaryArtist && followedArtists.some(a => a.id === primaryArtist.id);

  return (
    <aside className="w-[350px] h-full flex flex-col bg-[#121212] border-l border-white/5 overflow-hidden">
      <div className="flex flex-col p-6 gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[14px] font-bold text-white">
            {view === 'info' ? 'Now Playing' : 'Lyrics'}
          </h3>
          <div className="flex items-center gap-1">
             <button 
              onClick={() => toggleLike(currentSong)}
              className={clsx("p-2 transition-colors", isLiked ? "text-accent-green" : "text-text-subdued hover:text-white")}
            >
              <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-text-subdued hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        
        <div className="flex bg-white/5 p-1 rounded-full">
          <button 
            onClick={() => setView('info')}
            className={clsx(
              "flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-[13px] font-bold transition-all",
              view === 'info' ? "bg-white/10 text-white" : "text-text-subdued hover:text-white"
            )}
          >
            <ListMusic size={16} />
            Info
          </button>
          <button 
            onClick={() => setView('lyrics')}
            className={clsx(
              "flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-[13px] font-bold transition-all",
              view === 'lyrics' ? "bg-white/10 text-white" : "text-text-subdued hover:text-white"
            )}
          >
            <Mic2 size={16} />
            Lyrics
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-6">
        {view === 'info' ? (
          <div className="flex flex-col gap-8 animate-fade-in">
            <div className="w-full aspect-square rounded-xl overflow-hidden shadow-2xl">
              <img src={currentSong.image?.[2]?.url} alt="" className="w-full h-full object-cover" />
            </div>

            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold text-white hover:underline cursor-pointer" onClick={() => navigate(`/album/${currentSong.album?.id}`)}>
                {decodeHtml(currentSong.name)}
              </h2>
              <p className="text-text-subdued font-bold text-lg hover:underline cursor-pointer" onClick={() => primaryArtist && navigate(`/artist/${primaryArtist.id}`)}>
                {decodeHtml(primaryArtist?.name)}
              </p>
            </div>

            {/* Artist Card */}
            {primaryArtist && (
              <div className="bg-[#181818] p-4 rounded-xl flex flex-col gap-4 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-white/5 border border-white/10">
                    <img src={primaryArtist.image?.[1]?.url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[14px] font-bold truncate">{decodeHtml(primaryArtist.name)}</h4>
                    <p className="text-[12px] text-text-subdued">Artist</p>
                  </div>
                  <button 
                    onClick={() => toggleFollowArtist(primaryArtist)}
                    className={clsx(
                      "px-4 py-1.5 rounded-full text-[12px] font-bold border transition-all",
                      isFollowed ? "bg-white text-black border-white" : "text-white border-white/20 hover:border-white"
                    )}
                  >
                    {isFollowed ? "Following" : "Follow"}
                  </button>
                </div>
                <button 
                  onClick={() => navigate(`/artist/${primaryArtist.id}`)}
                  className="w-full py-2.5 rounded-full bg-white/5 text-[13px] font-bold hover:bg-white/10 transition-all"
                >
                  View Artist Profile
                </button>
              </div>
            )}

            {/* Credits Section */}
            <div className="flex flex-col gap-4">
              <h4 className="text-[14px] font-bold text-white uppercase tracking-wider">Credits</h4>
              <div className="flex flex-col gap-4">
                 <div className="flex justify-between items-center group">
                    <div className="flex flex-col min-w-0" onClick={() => primaryArtist && navigate(`/artist/${primaryArtist.id}`)}>
                      <span className="text-[15px] font-bold text-white group-hover:underline cursor-pointer truncate">{decodeHtml(primaryArtist?.name)}</span>
                      <span className="text-[13px] text-text-subdued">Main Artist</span>
                    </div>
                 </div>
                 <div className="flex justify-between items-center group">
                    <div className="flex flex-col min-w-0">
                      <span className="text-[15px] font-bold text-[#00ff88]">Sainath</span>
                      <span className="text-[13px] text-text-subdued">Project Creator</span>
                    </div>
                 </div>
                 {currentSong.artists?.featured?.map(artist => (
                    <div key={artist.id} className="flex justify-between items-center group">
                      <div className="flex flex-col min-w-0" onClick={() => navigate(`/artist/${artist.id}`)}>
                        <span className="text-[15px] font-bold text-white group-hover:underline cursor-pointer truncate">{decodeHtml(artist.name)}</span>
                        <span className="text-[13px] text-text-subdued">Featured Artist</span>
                      </div>
                    </div>
                 ))}
              </div>
            </div>

            {/* Logo Footer */}
            <div className="mt-8 pt-8 border-t border-white/5 flex flex-col items-center gap-4 opacity-50">
               <Logo className="scale-75" />
               <p className="text-[10px] font-black tracking-[0.3em] uppercase text-white/40">Verified Platform</p>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            <LyricsPanel />
          </div>
        )}
      </div>
    </aside>
  );
};

export default RightPanel;
