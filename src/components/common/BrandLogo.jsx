import React from 'react';
import { Users } from 'lucide-react';

const BrandLogo = ({ size = 'md', className = '' }) => {
  const sizeMap = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-9 h-9 rounded-xl',
    lg: 'w-14 h-14 rounded-2xl',
  };

  const iconSizeMap = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  return (
    <div
      className={`${sizeMap[size] || sizeMap.md} bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/25 border border-blue-400/30 shrink-0 ${className}`}
    >
      <Users className={`${iconSizeMap[size] || iconSizeMap.md} text-white`} />
    </div>
  );
};

export default BrandLogo;
