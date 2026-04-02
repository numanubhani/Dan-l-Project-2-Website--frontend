import React from 'react';
import { APP_ICON_URL } from '../constants';

interface AppIconProps {
  className?: string;
  alt?: string;
}

const AppIcon: React.FC<AppIconProps> = ({ className = 'w-8 h-8', alt = '' }) => (
  <img
    src={APP_ICON_URL}
    alt={alt}
    className={`shrink-0 object-contain ${className}`}
    draggable={false}
  />
);

export default AppIcon;
