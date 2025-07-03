import React from "react";

interface AvatarProps {
  children: React.ReactNode;
  className?: string;
}

export const Avatar = ({ children, className = "" }: AvatarProps) => (
  <div className={`w-10 h-10 rounded-full overflow-hidden bg-gray-200 ${className}`}>
    {children}
  </div>
);

export const AvatarImage = ({ src, alt = "" }: { src: string; alt?: string }) => (
  <img src={src} alt={alt} className="w-full h-full object-cover" />
);

export const AvatarFallback = ({ children }: { children: React.ReactNode }) => (
  <div className="w-full h-full flex items-center justify-center text-sm text-gray-700">
    {children}
  </div>
);
