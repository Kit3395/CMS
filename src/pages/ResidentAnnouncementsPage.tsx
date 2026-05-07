import React, { useMemo, useState } from 'react';
import { AnnouncementFilters } from '../components/announcements/AnnouncementFilters';
import { AnnouncementList } from '../components/announcements/AnnouncementList';
import { mockAnnouncements } from '../components/announcements/mockAnnouncements';
import { AnnouncementFilter } from '../components/announcements/AnnouncementTypes';

const residentFilter: AnnouncementFilter = { query: '', category: 'all', status: 'all', targetScope: 'all' };

export function ResidentAnnouncementsPage() {
  const [filter, setFilter] = useState(residentFilter);

  const filtered = useMemo(() => mockAnnouncements.filter((a) => {
    if (filter.query && !`${a.title} ${a.body}`.toLowerCase().includes(filter.query.toLowerCase())) return false;
    if (filter.category !== 'all' && a.category !== filter.category) return false;
    if (filter.targetScope !== 'all' && a.targetScope !== filter.targetScope) return false;
    return a.status === 'active' || a.status === 'scheduled';
  }), [filter]);

  return (
    <div className="ann-page">
      <h1>Community announcements</h1>
      <AnnouncementFilters value={filter} onChange={setFilter} includeStatus={false} />
      <AnnouncementList announcements={filtered} />
    </div>
  );
}
