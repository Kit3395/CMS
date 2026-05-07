import React from 'react';
import { categoryIcons, categoryLabels } from './AnnouncementIcons';
import { Announcement } from './AnnouncementTypes';

export function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  return (
    <article className="ann-card">
      <header className="ann-card-header">
        <span className="ann-category-pill">{categoryIcons[announcement.category]} {categoryLabels[announcement.category]}</span>
        <span className={`ann-status ann-status-${announcement.status}`}>{announcement.status}</span>
      </header>
      <h3>{announcement.title}</h3>
      <p>{announcement.body}</p>
      <footer className="ann-card-footer">
        <small>{announcement.startDate} - {announcement.endDate}</small>
        <small>Scope: {announcement.targetScope}</small>
      </footer>
    </article>
  );
}
