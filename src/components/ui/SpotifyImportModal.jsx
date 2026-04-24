import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, List, Link as LinkIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import usePlayerStore from '../../store/playerStore';
import { searchSongs } from '../../api/saavn';
import { clsx } from 'clsx';

const SpotifyImportModal = ({ type = 'spotify', onClose }) => {
  const [url, setUrl] = useState('');
  const [manualText, setManualText] = useState('');
  const [importMode, setImportMode] = useState('link'); // 'link' | 'text'
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const { createPlaylist, addSongToPlaylist } = usePlayerStore();

  const handleImport = async () => {
    let trackList = [];
    let playlistName = "Imported Playlist";

    if (importMode === 'text') {
      if (!manualText.trim()) {
        toast.error('Please enter some song titles');
        return;
      }
      trackList = manualText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      playlistName = "Manual Import";
    } else {
      const isSpotify = url.includes('spotify.com');
      const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');

      if (!isSpotify && !isYoutube) {
        toast.error('Please enter a valid Spotify or YouTube Playlist URL');
        return;
      }

      setIsImporting(true);
      try {
        if (isSpotify) {
          let embedUrl = url;
          if (url.includes('spotify.com/playlist/')) {
            const playlistId = url.split('playlist/')[1].split('?')[0];
            embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}`;
          } else if (url.includes('spotify.com/album/')) {
            const albumId = url.split('album/')[1].split('?')[0];
            embedUrl = `https://open.spotify.com/embed/album/${albumId}`;
          }

          const proxies = [
            `https://corsproxy.io/?url=${encodeURIComponent(embedUrl)}`,
            `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(embedUrl)}`
          ];

          let htmlText = null;
          for (const proxyUrl of proxies) {
            try {
              const response = await fetch(proxyUrl);
              if (response.ok) {
                htmlText = await response.text();
                break;
              }
            } catch (e) {
              console.warn('Proxy failed, trying next...');
            }
          }
          if (!htmlText) throw new Error("Failed to fetch playlist data due to CORS or Proxy blocking.");

          const match = htmlText.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
          if (!match) throw new Error("Could not find playlist data. Make sure it's public.");

          const nextData = JSON.parse(match[1]);
          const entity = nextData?.props?.pageProps?.state?.data?.entity;

          if (!entity || !entity.trackList || entity.trackList.length === 0) {
            throw new Error("No playable tracks found in this Spotify playlist.");
          }
          
          playlistName = entity.name || "Spotify Import";
          trackList = entity.trackList.map(t => `${t.title} ${t.subtitle || ''}`.trim());
          
        } else if (isYoutube) {
          const proxies = [
            `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
            `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(url)}`
          ];

          let htmlText = null;
          for (const proxyUrl of proxies) {
            try {
              const response = await fetch(proxyUrl);
              if (response.ok) {
                htmlText = await response.text();
                break;
              }
            } catch (e) {
              console.warn('Proxy failed, trying next...');
            }
          }
          
          if (!htmlText) throw new Error("Failed to fetch YouTube data due to CORS or Proxy blocking.");
          
          let match = htmlText.match(/var\s+ytInitialData\s*=\s*(\{.+?\});\s*<\/script>/s);
          if (!match) match = htmlText.match(/window\["ytInitialData"\]\s*=\s*(\{.+?\});\s*<\/script>/s);
          
          if (!match) throw new Error("Could not parse YouTube playlist data. It may be private or protected.");
          
          const data = JSON.parse(match[1]);
          const titles = [];
          
          const searchForTracks = (obj) => {
            if (!obj || typeof obj !== 'object') return;
            
            if (obj.playlistVideoRenderer && obj.playlistVideoRenderer.title) {
              const title = obj.playlistVideoRenderer.title.runs?.[0]?.text;
              const artist = obj.playlistVideoRenderer.shortBylineText?.runs?.[0]?.text || '';
              if (title && title !== '[Private video]') titles.push(`${title} ${artist}`.trim());
            } 
            else if (obj.musicResponsiveListItemRenderer) {
              const flexColumns = obj.musicResponsiveListItemRenderer.flexColumns;
              if (flexColumns && flexColumns.length > 0) {
                const title = flexColumns[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.text;
                let artist = '';
                if (flexColumns.length > 1) {
                  artist = flexColumns[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.map(r => r.text).join('') || '';
                }
                if (title && title !== '[Private video]') titles.push(`${title} ${artist}`.trim());
              }
            }
            else if (obj.gridVideoRenderer && obj.gridVideoRenderer.title) {
              const title = obj.gridVideoRenderer.title.runs?.[0]?.text;
              const artist = obj.gridVideoRenderer.shortBylineText?.runs?.[0]?.text || '';
              if (title) titles.push(`${title} ${artist}`.trim());
            }
            
            Object.values(obj).forEach(val => searchForTracks(val));
          };
          
          searchForTracks(data);
          
          const titleMatch = htmlText.match(/<title>(.*?)<\/title>/);
          if (titleMatch) playlistName = titleMatch[1].replace(' - YouTube', '').replace(' - YouTube Music', '');
          
          if (titles.length === 0) throw new Error("No tracks found. Make sure the YouTube playlist is public.");
          
          trackList = [...new Set(titles)]; // Deduplicate
        }
      } catch (err) {
        console.error(err);
        toast.error(err.message || 'Failed to fetch playlist');
        setIsImporting(false);
        return;
      }
    }

    if (trackList.length === 0) {
      setIsImporting(false);
      return;
    }

    setIsImporting(true);
    setProgress({ current: 0, total: trackList.length });
    const playlistId = createPlaylist(playlistName);

    let addedCount = 0;
    for (let i = 0; i < trackList.length; i++) {
      const query = trackList[i].replace(/[\[\]\(\)]/g, ''); // Clean up brackets for better search
      try {
        const res = await searchSongs(query, 1);
        if (res.success && res.data?.results?.length > 0) {
          addSongToPlaylist(playlistId, res.data.results[0]);
          addedCount++;
        }
      } catch (e) {
        console.error("Failed to find track:", query);
      }
      setProgress({ current: i + 1, total: trackList.length });
    }

    if (addedCount > 0) {
      toast.success(`Successfully imported ${addedCount} tracks to "${playlistName}"!`);
    } else {
      toast.error("Could not find matching songs for this playlist on our servers.");
    }
    onClose();
    setIsImporting(false);
  };

  const isYoutubeMode = type === 'youtube' || (importMode === 'link' && (url.includes('youtube.com') || url.includes('youtu.be')));

  return createPortal(
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-[#181818] w-full max-w-md rounded-2xl p-6 border border-white/10 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            {isYoutubeMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600 fill-current">
                <path d="M2.5 7.1c.3-1.2 1.3-2.1 2.5-2.4C8.4 4.1 12 4.1 12 4.1s3.6 0 7 .6c1.2.3 2.2 1.2 2.5 2.4.6 2.3.6 7.1.6 7.1s0 4.8-.6 7.1c-.3 1.2-1.3 2.1-2.5 2.4-3.4.6-7 .6-7 .6s-3.6 0-7-.6c-1.2-.3-2.2-1.2-2.5-2.4-.6-2.3-.6-7.1-.6-7.1s0-4.8.6-7.1z"/>
                <path d="M9.7 15.8l6.5-3.6-6.5-3.6v7.2z" fill="#181818" stroke="none"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-[#1DB954]" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
            )}
            Import Playlist
          </h2>
          <button onClick={onClose} className="text-text-subdued hover:text-white" disabled={isImporting}><X size={24} /></button>
        </div>

        {!isImporting ? (
          <div className="flex flex-col gap-4">
            <div className="flex bg-[#282828] p-1 rounded-xl">
              <button 
                onClick={() => setImportMode('link')}
                className={clsx(
                  "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-bold transition-all",
                  importMode === 'link' ? "bg-[#383838] text-white shadow-lg" : "text-text-subdued hover:text-white"
                )}
              >
                <LinkIcon size={18} />
                Link
              </button>
              <button 
                onClick={() => setImportMode('text')}
                className={clsx(
                  "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-bold transition-all",
                  importMode === 'text' ? "bg-[#383838] text-white shadow-lg" : "text-text-subdued hover:text-white"
                )}
              >
                <List size={18} />
                Manual
              </button>
            </div>

            {importMode === 'link' ? (
              <>
                <p className="text-sm text-text-subdued leading-relaxed">
                  Paste a public <strong>{isYoutubeMode ? 'YouTube / YT Music' : 'Spotify'}</strong> Playlist link below. We will scan the tracks and rebuild it here!
                </p>
                <input
                  type="text"
                  placeholder={isYoutubeMode ? "https://youtube.com/playlist?list=..." : "https://open.spotify.com/playlist/..."}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-[#282828] text-white rounded-lg px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-white/50 border border-transparent transition-all"
                />
              </>
            ) : (
              <>
                <p className="text-sm text-text-subdued leading-relaxed">
                  Paste a list of song titles (one per line). We will search for them and create your playlist!
                </p>
                <textarea
                  rows={5}
                  placeholder="Song Title - Artist&#10;Another Song&#10;..."
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  className="w-full bg-[#282828] text-white rounded-lg px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-white/50 border border-transparent transition-all resize-none"
                />
              </>
            )}

            <button
              onClick={handleImport}
              className={clsx(
                "w-full text-black font-black py-3 rounded-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 mt-2",
                isYoutubeMode ? "bg-white" : "bg-[#1DB954]"
              )}
            >
              Start Import
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 gap-4 animate-fade-in">
            <Loader2 size={48} className={clsx("animate-spin mb-2", isYoutubeMode ? "text-red-500" : "text-[#1DB954]")} />
            <h3 className="text-xl font-bold text-white">Rebuilding Playlist...</h3>
            <p className="text-text-subdued">
              Matching track {progress.current} of {progress.total}
            </p>
            <div className="w-full bg-white/10 h-2 rounded-full mt-4 overflow-hidden">
              <div 
                className={clsx("h-full transition-all duration-300", isYoutubeMode ? "bg-red-500" : "bg-[#1DB954]")}
                style={{ width: `${(progress.current / Math.max(progress.total, 1)) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default SpotifyImportModal;
