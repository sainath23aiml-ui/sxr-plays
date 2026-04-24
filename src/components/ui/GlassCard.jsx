import React from 'react';
import { clsx } from 'clsx';

const GlassCard = ({ children, className, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={clsx(
        "glass-card p-6 flex flex-col gap-4",
        className
      )}
    >
      {children}
    </div>
  );
};

export default GlassCard;
