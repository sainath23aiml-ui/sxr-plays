import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';

const CACHE_NAME = 'sxr-music-downloads';

const useDownloadStore = create(
  persist(
    (set, get) => ({
      downloadedIds: [],
      downloadedSongs: [], // Full metadata
      isDownloading: {}, // { songId: true/false }

      toggleDownload: async (song) => {
        if (!song || !song.downloadUrl) return;
        
        const { downloadedIds, downloadedSongs, isDownloading } = get();
        const isDownloaded = downloadedIds.includes(song.id);
        const cache = await caches.open(CACHE_NAME);

        if (isDownloaded) {
          // Remove from cache
          const audioUrl = song.downloadUrl[4]?.url || song.downloadUrl[0]?.url;
          await cache.delete(audioUrl);
          
          // Also delete images
          if (song.image) {
            for (const img of song.image) {
              await cache.delete(img.url);
            }
          }

          set({ 
            downloadedIds: downloadedIds.filter(id => id !== song.id),
            downloadedSongs: downloadedSongs.filter(s => s.id !== song.id)
          });
          toast.success('Removed from downloads');
        } else {
          // Add to cache
          set({ isDownloading: { ...isDownloading, [song.id]: true } });
          try {
            const audioUrl = song.downloadUrl[4]?.url || song.downloadUrl[0]?.url;
            
            // Download audio
            const audioRes = await fetch(audioUrl);
            if (!audioRes.ok) throw new Error('Audio download failed');
            await cache.put(audioUrl, audioRes);

            // Download images
            if (song.image) {
              await Promise.all(song.image.map(async (img) => {
                try {
                  const imgRes = await fetch(img.url);
                  if (imgRes.ok) await cache.put(img.url, imgRes);
                } catch (e) {
                  console.warn('Failed to cache image:', img.url);
                }
              }));
            }
            
            set((state) => ({ 
              downloadedIds: [...state.downloadedIds, song.id],
              downloadedSongs: [song, ...state.downloadedSongs],
              isDownloading: { ...state.isDownloading, [song.id]: false }
            }));
            toast.success('Downloaded for offline use!');
          } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download song');
            set({ isDownloading: { ...isDownloading, [song.id]: false } });
          }
        }
      },

      isSongDownloaded: (songId) => get().downloadedIds.includes(songId),
      
      getCachedUrl: async (song) => {
        if (!song || !song.downloadUrl) return null;
        const cache = await caches.open(CACHE_NAME);
        const url = song.downloadUrl[4]?.url || song.downloadUrl[0]?.url;
        const response = await cache.match(url);
        if (response) {
          const blob = await response.blob();
          return URL.createObjectURL(blob);
        }
        return null;
      }
    }),
    {
      name: 'sxr-music-downloads',
      partialize: (state) => ({ 
        downloadedIds: state.downloadedIds,
        downloadedSongs: state.downloadedSongs 
      }),
    }
  )
);

export default useDownloadStore;
