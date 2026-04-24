import { create } from 'zustand';

export const useContextMenuStore = create((set) => ({
  isOpen: false,
  x: 0,
  y: 0,
  song: null,
  openMenu: (e, song) => {
    e.preventDefault();
    set({ isOpen: true, x: e.clientX, y: e.clientY, song });
  },
  closeMenu: () => set({ isOpen: false, song: null })
}));
