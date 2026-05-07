import React from 'react';
import { AnnouncementList } from './AnnouncementList';
import { mockAnnouncements } from './mockAnnouncements';

export function ResidentAnnouncementsWidget() {
  const latestThree = [...mockAnnouncements]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <section className="ann-widget">
      <h2>Latest announcements</h2>
      <AnnouncementList announcements={latestThree} />
    </section>
  );
}
