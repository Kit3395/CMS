const { publishAnnouncement } = require('../../src/services/announcementService');

describe('announcementService', () => {
  it('publishes valid announcements', () => {
    const result = publishAnnouncement({
      title: 'Maintenance',
      body: 'Portal maintenance starts at 10 PM tonight.',
      audience: 'all',
    });

    expect(result.id).toMatch(/^ann_/);
    expect(result.title).toBe('Maintenance');
    expect(result.audience).toBe('all');
  });

  it('throws if title is missing', () => {
    expect(() => publishAnnouncement({ title: '', body: 'Body' })).toThrow('title and body required');
  });
});
