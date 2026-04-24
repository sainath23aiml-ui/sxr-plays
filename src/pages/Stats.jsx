import React, { useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Clock, Heart, Mic2, Calendar, Trophy, PlayCircle, BarChart3 } from 'lucide-react';
import usePlayerStore from '../store/playerStore';
import { decodeHtml } from '../api/saavn';

const Stats = () => {
  const { history, likedSongs, followedArtists } = usePlayerStore();

  const stats = useMemo(() => {
    const hourCounts = Array(24).fill(0);
    const artistCounts = {};
    let totalListenTimeSeconds = 0;

    history.forEach(item => {
      // Time of day
      const date = new Date(item.playedAt);
      const hour = date.getHours();
      hourCounts[hour]++;

      // Artist tracking
      const artist = item.artists?.primary?.[0]?.name || 'Unknown';
      artistCounts[artist] = (artistCounts[artist] || 0) + 1;

      // Duration tracking
      if (item.duration) {
        totalListenTimeSeconds += parseInt(item.duration, 10);
      }
    });

    const hourData = hourCounts.map((count, hour) => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      count
    }));

    const topArtists = Object.entries(artistCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count], index) => ({ name: decodeHtml(name), count, rank: index + 1 }));

    return { 
      hourData, 
      topArtists, 
      totalMinutes: Math.floor(totalListenTimeSeconds / 60)
    };
  }, [history]);

  return (
    <div className="flex flex-col min-h-screen bg-[#121212] pb-[160px] lg:pb-32 overflow-x-hidden">
      
      {/* Huge Wrapped Header */}
      <div className="relative pt-16 pb-24 px-6 md:px-12 flex flex-col items-center justify-center text-center overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 shadow-2xl rounded-b-[40px] md:rounded-b-[80px]">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40 mix-blend-overlay">
           <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-white rounded-full blur-[100px]" />
           <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-yellow-300 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-6">
          <span className="px-5 py-2 rounded-full bg-white/20 backdrop-blur-xl text-white font-black text-[10px] md:text-xs tracking-[0.3em] uppercase shadow-lg border border-white/30">
            Your Year In Review
          </span>
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter drop-shadow-2xl scale-y-110">
            WRAPPED
          </h1>
          <p className="text-white/90 font-bold text-lg md:text-2xl max-w-xl drop-shadow-md">
            The data behind your rhythm. Discover what truly moved you.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-8 md:gap-12 p-6 md:p-12 max-w-[1400px] mx-auto w-full -mt-12 relative z-20">
        
        {/* Core Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            { label: 'Songs Played', value: history.length, icon: PlayCircle, color: 'from-blue-500 to-cyan-400' },
            { label: 'Minutes Listened', value: stats.totalMinutes, icon: Clock, color: 'from-orange-500 to-amber-400' },
            { label: 'Liked Tracks', value: likedSongs.length, icon: Heart, color: 'from-rose-500 to-pink-500' },
            { label: 'Followed Artists', value: followedArtists.length, icon: Mic2, color: 'from-emerald-500 to-teal-400' },
          ].map((stat, i) => (
            <div key={i} className={`bg-gradient-to-br ${stat.color} p-[2px] rounded-3xl shadow-xl hover:scale-105 transition-transform`}>
              <div className="bg-[#181818] h-full w-full rounded-[22px] p-6 flex flex-col justify-between gap-6 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity">
                   <stat.icon size={100} />
                </div>
                <stat.icon className="text-white relative z-10" size={32} />
                <div className="flex flex-col relative z-10">
                  <span className="text-4xl md:text-5xl font-black text-white tracking-tight">{stat.value}</span>
                  <span className="text-[12px] font-bold text-white/60 uppercase tracking-widest mt-1">{stat.label}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* Top Artists Ranking */}
          <div className="bg-[#181818] rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-2xl border border-white/5">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="text-yellow-400" size={28} />
              <h2 className="text-2xl font-black text-white tracking-tight">Your Top Artists</h2>
            </div>
            
            {stats.topArtists.length > 0 ? (
              <div className="flex flex-col gap-4">
                {stats.topArtists.map((artist, i) => (
                  <div key={artist.name} className="flex items-center gap-4 bg-[#282828]/50 hover:bg-[#282828] transition-colors p-4 rounded-2xl border border-white/5 group">
                    <span className={`text-4xl font-black w-12 text-center ${i === 0 ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-white/20'}`}>
                      {artist.rank}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg md:text-xl font-bold text-white truncate group-hover:text-accent-green transition-colors">{artist.name}</h3>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[11px] text-white/50 font-bold uppercase tracking-widest">Plays</span>
                      <span className="text-white font-black text-lg">{artist.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center py-10">
                 <p className="text-white/50 font-bold italic text-center">Start listening to artists to build your rankings!</p>
              </div>
            )}
          </div>

          {/* Vibe Timeline / Activity Area Chart */}
          <div className="bg-gradient-to-br from-[#1DB954]/10 to-[#181818] p-6 md:p-8 rounded-3xl border border-[#1DB954]/20 flex flex-col gap-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BarChart3 className="text-accent-green" size={28} />
                <h2 className="text-2xl font-black text-white tracking-tight">Vibe Timeline</h2>
              </div>
            </div>
            <p className="text-white/60 font-medium text-sm -mt-2">When do you listen to the most music?</p>
            
            <div className="h-[250px] md:h-[350px] min-h-[250px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.hourData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1DB954" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#1DB954" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="hour" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 'bold' }} 
                    interval={3} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#282828', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#1DB954', fontWeight: '900', fontSize: '18px' }}
                    labelStyle={{ color: 'rgba(255,255,255,0.5)', fontWeight: 'bold', marginBottom: '4px' }}
                    cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2, strokeDasharray: '4 4' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    name="Streams"
                    stroke="#1DB954" 
                    strokeWidth={5} 
                    fillOpacity={1} 
                    fill="url(#colorCount)" 
                    activeDot={{ r: 8, fill: '#fff', stroke: '#1DB954', strokeWidth: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent History List */}
        <div className="bg-[#181818] p-6 md:p-8 rounded-3xl border border-white/5 flex flex-col gap-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="text-blue-400" size={28} />
            <h2 className="text-2xl font-black text-white tracking-tight">Recently Streamed</h2>
          </div>
          
          <div className="flex flex-col gap-2">
            {history.slice(0, 10).map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 md:p-4 rounded-2xl hover:bg-[#282828] transition-colors group cursor-default border border-transparent hover:border-white/5">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative w-12 h-12 shrink-0 rounded-md overflow-hidden shadow-lg group-hover:scale-105 transition-transform">
                    <img src={item.image?.[0]?.url || item.image?.[1]?.url} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-white text-[15px] truncate">{decodeHtml(item.name)}</span>
                    <span className="text-[13px] text-white/60 truncate group-hover:text-white transition-colors">
                      {decodeHtml(item.artists?.primary?.[0]?.name)}
                    </span>
                  </div>
                </div>
                <span className="text-[12px] text-white/40 font-bold tracking-wider whitespace-nowrap ml-4 hidden sm:block">
                  {new Date(item.playedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            
            {history.length === 0 && (
              <div className="py-20 flex flex-col items-center justify-center gap-4 text-center bg-[#282828]/30 rounded-2xl border border-white/5 border-dashed">
                <Calendar size={48} className="text-white/20" />
                <p className="text-white/50 font-bold">Your stream history is currently empty.</p>
                <p className="text-white/30 text-sm">Play some tracks to build your history.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
