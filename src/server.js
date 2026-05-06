import express from 'express';
import {
  createAnnouncement,
  listAnnouncements,
  listAnnouncementsForResident,
  updateAnnouncement,
} from './announcementsService.js';

const app = express();
app.use(express.json());

function requireAdminOrSU(req, res, next) {
  const role = req.header('x-role');
  if (role !== 'admin' && role !== 'su') {
    return res.status(403).json({ error: 'Forbidden. Admin/SU required.' });
  }
  return next();
}

app.post('/announcements', requireAdminOrSU, (req, res) => {
  const { title, content, start_at, end_at, target_scope, phase, block } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'title and content are required.' });
  }

  if (target_scope === 'phase' && !phase) {
    return res.status(400).json({ error: 'phase is required for target_scope=phase.' });
  }

  if (target_scope === 'block' && !block) {
    return res.status(400).json({ error: 'block is required for target_scope=block.' });
  }

  const announcement = createAnnouncement({
    ...req.body,
    start_at: start_at ?? null,
    end_at: end_at ?? null,
  });

  return res.status(201).json(announcement);
});

app.get('/announcements', (req, res) => {
  const {
    category,
    phase,
    block,
    active_only,
    audience,
  } = req.query;

  const filters = {
    category,
    phase,
    block,
    active_only: active_only === 'true',
  };

  const list = audience === 'resident'
    ? listAnnouncementsForResident(filters)
    : listAnnouncements(filters);

  return res.json(list);
});

app.patch('/announcements/:id', requireAdminOrSU, (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid announcement id.' });
  }

  const updated = updateAnnouncement(id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Announcement not found.' });
  }

  return res.json(updated);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Announcements API listening on port ${port}`);
});
