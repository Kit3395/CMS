function publishAnnouncement({ title, body, audience }) {
  if (!title || !body) {
    throw new Error('title and body required');
  }

  return {
    id: `ann_${Date.now()}`,
    title,
    body,
    audience: audience || 'all',
    publishedAt: new Date().toISOString(),
  };
}

module.exports = {
  publishAnnouncement,
};
