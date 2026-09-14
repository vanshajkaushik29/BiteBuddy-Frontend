"use client";

interface UserAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  src?: string;
}

export function UserAvatar({ name, size = 'md', src }: UserAvatarProps) {
  const sizeClass = size === 'sm' ? 'w-7 h-7 text-xs' : size === 'lg' ? 'w-12 h-12 text-lg' : 'w-9 h-9 text-sm';
  return (
    <div className={`${sizeClass} rounded-full bg-primary-600 flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
