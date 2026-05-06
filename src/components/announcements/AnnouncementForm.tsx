import React, { useState } from 'react';
import { Announcement, AnnouncementCategory, AnnouncementStatus, TargetScope } from './AnnouncementTypes';

type FormValues = Omit<Announcement, 'id' | 'createdAt' | 'status'> & { status: AnnouncementStatus };

export function AnnouncementForm({ initial, onSubmit }: { initial?: Announcement; onSubmit: (values: FormValues) => void }) {
  const [values, setValues] = useState<FormValues>(
    initial ?? {
      title: '',
      body: '',
      category: 'water',
      targetScope: 'all',
      startDate: '',
      endDate: '',
      status: 'draft',
    },
  );

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => setValues((prev) => ({ ...prev, [key]: value }));

  return (
    <form className="ann-form" onSubmit={(e) => { e.preventDefault(); onSubmit(values); }}>
      <h2>{initial ? 'Edit announcement' : 'Create announcement'}</h2>
      <label>Title<input value={values.title} onChange={(e) => set('title', e.target.value)} required /></label>
      <label>Body<textarea value={values.body} onChange={(e) => set('body', e.target.value)} rows={4} required /></label>
      <label>Category
        <select value={values.category} onChange={(e) => set('category', e.target.value as AnnouncementCategory)}>
          <option value="water">Water</option><option value="electricity">Electricity</option><option value="waste">Waste</option><option value="road">Road</option>
        </select>
      </label>
      <label>Target scope
        <select value={values.targetScope} onChange={(e) => set('targetScope', e.target.value as TargetScope)}>
          <option value="all">All residents</option><option value="building">Building</option><option value="floor">Floor</option><option value="unit">Unit</option>
        </select>
      </label>
      <label>Start date<input type="date" value={values.startDate} onChange={(e) => set('startDate', e.target.value)} required /></label>
      <label>End date<input type="date" value={values.endDate} onChange={(e) => set('endDate', e.target.value)} required /></label>
      <label>Status
        <select value={values.status} onChange={(e) => set('status', e.target.value as AnnouncementStatus)}>
          <option value="draft">Draft</option><option value="scheduled">Scheduled</option><option value="active">Active</option><option value="expired">Expired</option>
        </select>
      </label>
      <button type="submit">{initial ? 'Save changes' : 'Create announcement'}</button>
    </form>
  );
}
