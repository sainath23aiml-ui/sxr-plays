import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import usePlayerStore from '../../store/playerStore';
import { toast } from 'react-hot-toast';

const PlaylistPicker = ({ song, onClose }) => {
  const { playlists, addSongToPlaylist, createPlaylist } = usePlayerStore();
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleAdd = (pid, pname) => {
    addSongToPlaylist(pid, song);
    toast.success(`Added to ${pname}`);
    onClose();
  };

  const handleCreate = () => {
    if (!newPlaylistName.trim()) return;
    const id = createPlaylist(newPlaylistName.trim());
    addSongToPlaylist(id, song);
    toast.success(`Created & Added to ${newPlaylistName}`);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in" onClick={(e) => { e.stopPropagation(); onClose(); }}>
      <div className="w-full max-w-sm bg-[#181818] rounded-2xl shadow-2xl border border-white/10 p-6 flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-white">Add to Playlist</h3>
          <button onClick={onClose} className="text-text-subdued hover:text-white">&times;</button>
        </div>
        
        <div className="max-h-64 overflow-y-auto custom-scrollbar mb-6 flex flex-col gap-2">
          {playlists.length === 0 ? (
            <p className="text-text-subdued text-[14px] text-center py-4">No playlists yet.</p>
          ) : (
            playlists.map(p => (
              <button key={p.id} onClick={() => handleAdd(p.id, p.name)} className="w-full text-left px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-[15px] font-bold transition-colors truncate">
                {p.name}
              </button>
            ))
          )}
        </div>

        <div className="pt-6 border-t border-white/10 flex flex-col gap-3">
          <input 
            type="text" 
            placeholder="New playlist name..." 
            value={newPlaylistName}
            onChange={e => setNewPlaylistName(e.target.value)}
            className="w-full bg-[#282828] rounded-lg px-4 py-3 text-[14px] focus:outline-none border border-transparent focus:border-accent-green transition-colors"
          />
          <button onClick={handleCreate} className="w-full py-3 bg-white text-black rounded-lg text-[15px] font-black hover:bg-gray-200 transition-colors">Create & Add</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PlaylistPicker;
