// Use only the most reliable instance with CORS enabled
const PRIMARY_BASE = 'https://saavn.sumit.co/api';

const fetchApi = async (endpoint, params = {}) => {
  const url = new URL(`${PRIMARY_BASE}${endpoint}`);
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined) url.searchParams.append(key, params[key]);
  });
  
  try {
    const r = await fetch(url.toString(), { mode: 'cors' });
    if (!r.ok) {
      // Don't throw for 404s (like missing lyrics), just return empty
      if (r.status === 404) return { success: false, data: null };
      throw new Error(`HTTP ${r.status}`);
    }
    const data = await r.json();
    return data.data ? data : { success: true, data };
  } catch (err) {
    console.error(`API Error on ${PRIMARY_BASE}${endpoint}:`, err);
    return { success: false, data: null };
  }
};

export const searchAll = async (query) => {
  const [songsRes, artistsRes] = await Promise.all([
    searchSongs(query, 500),
    searchArtists(query, 50)
  ]);

  return {
    success: songsRes.success,
    data: {
      songs: songsRes.data || { results: [] },
      artists: artistsRes.data || { results: [] },
      albums: { results: [] }
    }
  };
};

export const searchSongs = (query, limit = 500) => fetchApi('/search/songs', { query, limit, n: limit });
export const searchAlbums = (query, limit = 500) => fetchApi('/search/albums', { query, limit, n: limit });
export const searchArtists = (query, limit = 500) => fetchApi('/search/artists', { query, limit, n: limit });

export const getAlbumById = (id) => fetchApi('/albums', { id });
export const getArtistById = (id) => fetchApi(`/artists/${id}`);

export const getArtistSongs = async (id, pages = 10) => {
  const allResults = [];
  for (let i = 0; i < pages; i++) {
    const res = await fetchApi(`/artists/${id}/songs`, { page: i, limit: 500, n: 500 });
    if (res.success && res.data) {
      const results = res.data.results || res.data || [];
      if (Array.isArray(results)) {
        allResults.push(...results);
        if (results.length < 10) break;
      } else if (results.songs) {
        allResults.push(...results.songs);
        if (results.songs.length < 10) break;
      }
    }
  }
  return { success: true, data: { results: allResults } };
};

export const getLyrics = async (id) => {
  try {
    const r = await fetch(`https://jiosaavn-api.vercel.app/lyrics?id=${id}`);
    const data = await r.json();
    if (data.status && data.lyrics) {
      return { success: true, data: { lyrics: data.lyrics } };
    }
    return { success: false, data: null };
  } catch (err) {
    return { success: false, data: null };
  }
};

export const getTrending = () => searchSongs('trending hits 2025', 500);
export const getHindiHits = () => searchSongs('new hindi 2025', 500);
export const getTamilHits = () => searchSongs('latest tamil 2025', 500);
export const getTeluguHits = () => searchSongs('latest telugu 2025', 500);
export const getPunjabiHits = () => searchSongs('latest punjabi 2025', 500);
export const getKannadaHits = () => searchSongs('latest kannada 2025', 500);

// Fetch exactly the solo artists we want by taking the #1 search result for each name
export const getTopArtists = async () => {
  const names = [
    'Arijit Singh', 'Talwinder', 'Diljit Dosanjh', 'Atif Aslam', 'Shreya Ghoshal', 
    'Anirudh Ravichander', 'Sid Sriram', 'Neha Kakkar', 'Darshan Raval', 'Armaan Malik',
    'Badshah', 'AP Dhillon', 'Karan Aujla', 'King', 'Ritviz', 'Prateek Kuhad', 
    'Sonu Nigam', 'KK', 'Mohit Chauhan', 'Jubin Nautiyal'
  ];

  const results = await Promise.all(
    names.map(name => searchArtists(name, 1))
  );

  const uniqueArtists = results
    .map(res => res.data?.results?.[0])
    .filter(Boolean); // Remove nulls

  return { success: true, data: { results: uniqueArtists } };
};

export const getSongsByLanguage = (language, page = 1, limit = 500) =>
  fetchApi('/search/songs', { query: `top ${language} 2025`, page, limit, n: limit });

export const getStreamUrl = (song) => {
  const urls = song?.downloadUrl || [];
  if (urls.length === 0) return null;
  const sorted = [...urls].sort((a, b) => (parseInt(b.quality) || 0) - (parseInt(a.quality) || 0));
  return sorted[0]?.url || null;
};

export const decodeHtml = (html) => {
  if (!html) return '';
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};
