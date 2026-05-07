import { Announcement } from './AnnouncementTypes';

export const mockAnnouncements: Announcement[] = [
  { id: '1', title: 'Water interruption', body: 'Water supply will be interrupted from 2-5 PM.', category: 'water', status: 'active', targetScope: 'building', startDate: '2026-05-08', endDate: '2026-05-08', createdAt: '2026-05-06' },
  { id: '2', title: 'Power maintenance', body: 'Generator testing planned Saturday morning.', category: 'electricity', status: 'scheduled', targetScope: 'all', startDate: '2026-05-10', endDate: '2026-05-10', createdAt: '2026-05-05' },
  { id: '3', title: 'Waste collection update', body: 'Collection now starts 30 minutes earlier.', category: 'waste', status: 'active', targetScope: 'all', startDate: '2026-05-07', endDate: '2026-05-20', createdAt: '2026-05-04' },
  { id: '4', title: 'Road resurfacing', body: 'Main gate access may be slower due to resurfacing.', category: 'road', status: 'draft', targetScope: 'all', startDate: '2026-05-12', endDate: '2026-05-14', createdAt: '2026-05-03' },
];
