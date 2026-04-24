import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import TopBar from './components/layout/TopBar';
import Sidebar from './components/layout/Sidebar';
import PlayerBar from './components/layout/PlayerBar';
import RightPanel from './components/layout/RightPanel';
import Home from './pages/Home';
import Search from './pages/Search';
import Library from './pages/Library';
import Stats from './pages/Stats';
import Languages from './pages/Languages';
import AllArtists from './pages/AllArtists';
import AlbumDetail from './pages/AlbumDetail';
import ArtistDetail from './pages/ArtistDetail';
import Queue from './pages/Queue';
import LikedSongs from './pages/LikedSongs';
import MobileBottomNav from './components/layout/MobileBottomNav';
import ContextMenu from './components/ui/ContextMenu';
import usePlayerStore from './store/playerStore';
import { useColorTheme } from './hooks/useColorTheme';
import { useVibeQueue } from './hooks/useVibeQueue';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import FullScreenPlayer from './components/ui/FullScreenPlayer';
import { clsx } from 'clsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => {
  const { currentSong } = usePlayerStore();
  const [showRightPanel, setShowRightPanel] = useState(false);
  
  useColorTheme(currentSong?.image?.[1]?.url);
  useVibeQueue();
  useKeyboardShortcuts();

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="flex flex-col h-screen bg-black text-white overflow-hidden relative">
          {/* Apple Music Style Ambient Background */}
          {currentSong && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
              <div 
                className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-blob"
                style={{ backgroundColor: 'var(--dynamic-glow)' }}
              />
              <div 
                className="absolute top-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-blob animation-delay-2000"
                style={{ backgroundColor: 'var(--dynamic-glow)' }}
              />
              <div 
                className="absolute -bottom-[20%] left-[20%] w-[80vw] h-[80vw] rounded-full mix-blend-screen filter blur-[150px] opacity-20 animate-blob animation-delay-4000"
                style={{ backgroundColor: 'var(--dynamic-glow)' }}
              />
            </div>
          )}

          {/* Top Navigation */}
          <TopBar onToggleRightPanel={() => setShowRightPanel(!showRightPanel)} />

          <div className="flex-1 flex overflow-hidden">
            {/* Left Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 min-w-0 overflow-y-auto custom-scrollbar relative bg-[#121212] rounded-lg mx-2 mb-2">
              <div className="max-w-[1400px] mx-auto min-h-full pb-[160px] xl:pb-20">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/album/:id" element={<AlbumDetail />} />
                  <Route path="/artist/:id" element={<ArtistDetail />} />
                  <Route path="/library" element={<Library />} />
                  <Route path="/stats" element={<Stats />} />
                  <Route path="/discover" element={<Languages />} />
                  <Route path="/artists" element={<AllArtists />} />
                  <Route path="/liked" element={<LikedSongs />} />
                  <Route path="/queue" element={<Queue />} />
                </Routes>
              </div>
            </main>

            {/* Right Panel (Details & Lyrics) */}
            <div 
              className={clsx(
                "transition-all duration-300 ease-in-out h-full overflow-hidden mb-2",
                showRightPanel ? "w-[350px] opacity-100 mr-2" : "w-0 opacity-0"
              )}
            >
              <RightPanel onClose={() => setShowRightPanel(false)} />
            </div>
          </div>

          {/* Mobile Bottom Navigation */}
          <MobileBottomNav />

          {/* Player Bar */}
          <PlayerBar onToggleLyrics={() => setShowRightPanel(!showRightPanel)} isLyricsOpen={showRightPanel} />
          
          {/* Global Context Menu */}
          <ContextMenu />
          
          {/* Full Screen Reels Player */}
          <FullScreenPlayer />
        </div>

        <Toaster position="bottom-center" />
      </Router>
    </QueryClientProvider>
  );
};

export default App;
