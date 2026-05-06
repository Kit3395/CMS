import React from 'react';
import { AnnouncementCategory } from './AnnouncementTypes';

interface IconProps {
  className?: string;
}

const WaterDropIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M12 3C12 3 6 10 6 14a6 6 0 1 0 12 0c0-4-6-11-6-11Z" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

const LightBulbIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M12 3a7 7 0 0 0-4 12.8c.7.5 1 1.2 1 2V19h6v-1.2c0-.8.3-1.5 1-2A7 7 0 0 0 12 3Z" stroke="currentColor" strokeWidth="1.8" />
    <path d="M9 21h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const TrashBinIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M4 7h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M9 7V5h6v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M7 7l1 13h8l1-13" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
);

const RoadIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M7 21 10 3h4l3 18" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M12 7v2M12 12v2M12 17v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const categoryLabels: Record<AnnouncementCategory, string> = {
  water: 'Water',
  electricity: 'Electricity',
  waste: 'Waste',
  road: 'Road',
};

export const categoryIcons: Record<AnnouncementCategory, React.ReactNode> = {
  water: <WaterDropIcon className="ann-icon" />,
  electricity: <LightBulbIcon className="ann-icon" />,
  waste: <TrashBinIcon className="ann-icon" />,
  road: <RoadIcon className="ann-icon" />,
};
