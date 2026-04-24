import { useEffect } from 'react';
import { getColor } from 'colorthief';

export const useColorTheme = (imageUrl) => {
  useEffect(() => {
    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;

    img.onload = async () => {
      try {
        // In colorthief v3, we use the functional API
        const color = await getColor(img);
        
        if (color && Array.isArray(color)) {
          const [r, g, b] = color;
          const root = document.documentElement;
          
          root.style.setProperty('--dynamic-accent', `rgb(${r}, ${g}, ${b})`);
          const dimR = Math.floor(r * 0.15);
          const dimG = Math.floor(g * 0.15);
          const dimB = Math.floor(b * 0.15);
          root.style.setProperty('--dynamic-bg', `rgb(${dimR}, ${dimG}, ${dimB})`);
          root.style.setProperty('--dynamic-glow', `rgba(${r}, ${g}, ${b}, 0.2)`);
        }
      } catch (err) {
        // Fallback to default branding on error
        const root = document.documentElement;
        root.style.setProperty('--dynamic-accent', '#1DB954');
        root.style.setProperty('--dynamic-bg', '#000000');
        root.style.setProperty('--dynamic-glow', 'rgba(29, 185, 84, 0.2)');
      }
    };

    img.onerror = () => {
      const root = document.documentElement;
      root.style.setProperty('--dynamic-accent', '#1DB954');
      root.style.setProperty('--dynamic-bg', '#000000');
      root.style.setProperty('--dynamic-glow', 'rgba(29, 185, 84, 0.2)');
    };
  }, [imageUrl]);
};
