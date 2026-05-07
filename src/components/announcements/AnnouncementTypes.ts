export type AnnouncementCategory = 'water' | 'electricity' | 'waste' | 'road';

export type AnnouncementStatus = 'draft' | 'scheduled' | 'active' | 'expired';

export type TargetScope = 'all' | 'building' | 'floor' | 'unit';

export interface Announcement {
  id: string;
  title: string;
  body: string;
  category: AnnouncementCategory;
  status: AnnouncementStatus;
  targetScope: TargetScope;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface AnnouncementFilter {
  query: string;
  category: AnnouncementCategory | 'all';
  status: AnnouncementStatus | 'all';
  targetScope: TargetScope | 'all';
}
