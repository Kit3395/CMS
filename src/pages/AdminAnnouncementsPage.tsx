import React, { useMemo, useState } from 'react';
import { AnnouncementFilters } from '../components/announcements/AnnouncementFilters';
import { AnnouncementForm } from '../components/announcements/AnnouncementForm';
import { AnnouncementList } from '../components/announcements/AnnouncementList';
import { mockAnnouncements } from '../components/announcements/mockAnnouncements';
import { AnnouncementFilter } from '../components/announcements/AnnouncementTypes';

const defaultFilter: AnnouncementFilter = { query: '', category: 'all', status: 'all', targetScope: 'all' };

export function AdminAnnouncementsPage() {
  const [filter, setFilter] = useState(defaultFilter);
  const [saved, setSaved] = useState('');

  const filtered = useMemo(() => mockAnnouncements.filter((a) => {
    if (filter.query && !`${a.title} ${a.body}`.toLowerCase().includes(filter.query.toLowerCase())) return false;
    if (filter.category !== 'all' && a.category !== filter.category) return false;
    if (filter.status !== 'all' && a.status !== filter.status) return false;
    if (filter.targetScope !== 'all' && a.targetScope !== filter.targetScope) return false;
    return true;
  }), [filter]);

  return (
    <div className="ann-page">
      <h1>Announcements</h1>
      <AnnouncementFilters value={filter} onChange={setFilter} includeStatus />
      <AnnouncementList announcements={filtered} />
      <AnnouncementForm onSubmit={(values) => setSaved(`Saved: ${values.title}`)} />
      {saved && <p>{saved}</p>}
    </div>
  );
}
