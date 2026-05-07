import React from 'react';
import { AnnouncementCard } from './AnnouncementCard';
import { Announcement } from './AnnouncementTypes';

export function AnnouncementList({ announcements }: { announcements: Announcement[] }) {
  if (!announcements.length) return <p>No announcements found.</p>;

  return <div className="ann-grid">{announcements.map((a) => <AnnouncementCard key={a.id} announcement={a} />)}</div>;
}
