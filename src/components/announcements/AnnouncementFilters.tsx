import React from 'react';
import { AnnouncementCategory, AnnouncementFilter, AnnouncementStatus, TargetScope } from './AnnouncementTypes';

interface Props {
  value: AnnouncementFilter;
  onChange: (next: AnnouncementFilter) => void;
  includeStatus?: boolean;
}

export function AnnouncementFilters({ value, onChange, includeStatus = true }: Props) {
  const set = <K extends keyof AnnouncementFilter>(key: K, val: AnnouncementFilter[K]) =>
    onChange({ ...value, [key]: val });

  return (
    <section className="ann-filters">
      <input
        type="search"
        placeholder="Search announcements"
        value={value.query}
        onChange={(e) => set('query', e.target.value)}
      />

      <select value={value.category} onChange={(e) => set('category', e.target.value as AnnouncementCategory | 'all')}>
        <option value="all">All categories</option>
        <option value="water">Water</option>
        <option value="electricity">Electricity</option>
        <option value="waste">Waste</option>
        <option value="road">Road</option>
      </select>

      {includeStatus && (
        <select value={value.status} onChange={(e) => set('status', e.target.value as AnnouncementStatus | 'all')}>
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
        </select>
      )}

      <select value={value.targetScope} onChange={(e) => set('targetScope', e.target.value as TargetScope | 'all')}>
        <option value="all">All scopes</option>
        <option value="all">All residents</option>
        <option value="building">Building</option>
        <option value="floor">Floor</option>
        <option value="unit">Unit</option>
      </select>
    </section>
  );
}
