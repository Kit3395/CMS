const request = require('supertest');
const app = require('../../src/app');

describe('Auth + RBAC integration', () => {
  it('blocks anonymous user from staff announcement endpoint', async () => {
    const res = await request(app).post('/announcements').send({
      title: 'Notice',
      body: 'This is a sufficiently long body for validation.',
      audience: 'all',
    });

    expect(res.status).toBe(401);
  });

  it('blocks basic user from admin endpoint', async () => {
    const res = await request(app)
      .get('/admin/reports')
      .set('x-user-id', 'u1')
      .set('x-user-role', 'user');

    expect(res.status).toBe(403);
  });

  it('allows admin to access admin endpoint', async () => {
    const res = await request(app)
      .get('/admin/reports')
      .set('x-user-id', 'a1')
      .set('x-user-role', 'admin');

    expect(res.status).toBe(200);
  });

  it('enforces password policy on registration', async () => {
    const weak = await request(app).post('/auth/register').send({ password: 'weakpass' });
    expect(weak.status).toBe(400);

    const strong = await request(app)
      .post('/auth/register')
      .send({ password: 'StrongP@ssword99' });
    expect(strong.status).toBe(201);
  });

  it('enforces rate limiting for announcements', async () => {
    const agent = request(app);
    const headers = { 'x-user-id': 's1', 'x-user-role': 'staff' };
    const payload = {
      title: 'Ops window',
      body: 'This is a long enough body to pass request validation checks.',
      audience: 'staff',
    };

    const first = await agent.post('/announcements').set(headers).send(payload);
    const second = await agent.post('/announcements').set(headers).send(payload);
    const third = await agent.post('/announcements').set(headers).send(payload);

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(third.status).toBe(429);
  });

  it('sets secure headers with helmet', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBeDefined();
  });
});
