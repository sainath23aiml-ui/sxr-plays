import React from 'react';
import { clsx } from 'clsx';

export const Skeleton = ({ className, circle }) => {
  return (
    <div
      className={clsx(
        "animate-pulse bg-[#2a2a2a]",
        circle ? "rounded-full" : "rounded-md",
        className
      )}
    />
  );
};

export const CardSkeleton = ({ type = 'square' }) => (
  <div className="bg-[#181818] p-4 rounded-lg flex flex-col gap-4 animate-pulse">
    <div className={clsx("w-full aspect-square bg-[#2a2a2a]", type === 'circle' ? "rounded-full" : "rounded-md")} />
    <div className="flex flex-col gap-2">
      <div className="w-3/4 h-4 bg-[#2a2a2a] rounded-sm" />
      <div className="w-1/2 h-3 bg-[#2a2a2a] rounded-sm" />
    </div>
  </div>
);

export const RowSkeleton = () => (
  <div className="flex items-center gap-4 py-2 animate-pulse">
    <div className="w-10 h-10 bg-[#2a2a2a] rounded-sm shrink-0" />
    <div className="flex flex-col gap-2 flex-1">
      <div className="w-1/3 h-4 bg-[#2a2a2a] rounded-sm" />
      <div className="w-1/4 h-3 bg-[#2a2a2a] rounded-sm" />
    </div>
  </div>
);
