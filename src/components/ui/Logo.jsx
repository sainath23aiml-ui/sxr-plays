import React from 'react';
import { clsx } from 'clsx';

const Logo = ({ className = "" }) => {
  return (
    <div className={clsx("flex items-center gap-3 select-none group cursor-default", className)}>
      <div className="w-10 h-10 rounded-[8px] overflow-hidden flex items-center justify-center shadow-[0_0_20px_rgba(0,255,136,0.3)] group-hover:scale-110 transition-transform duration-500">
        <img src="/icon.png" alt="SXR" className="w-full h-full object-cover" />
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-['Orbitron'] text-2xl font-black text-[#00ff88] tracking-[2px] drop-shadow-[0_0_10px_rgba(0,255,136,0.3)]">
          SXR
        </span>
        <span className="font-['Orbitron'] text-[10px] font-bold text-white/50 tracking-[5px] mt-0.5 ml-0.5">
          PLAYS
        </span>
      </div>
    </div>
  );
};

export default Logo;
