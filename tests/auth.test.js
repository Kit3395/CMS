const request = require('supertest');
const app = require('../src/app');
const { initUsers } = require('../src/data/users');

beforeEach(() => {
  initUsers();
});

describe('Authentication and RBAC', () => {
  test('POST /auth/login returns token for valid credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@cms.local', password: 'admin123456' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.role).toBe('ADMIN');
  });

  test('GET /auth/me returns current user', async () => {
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: 'resident@cms.local', password: 'resident123456' });

    const token = loginRes.body.data.accessToken;
    const meRes = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.statusCode).toBe(200);
    expect(meRes.body.data.email).toBe('resident@cms.local');
    expect(meRes.body.data.role).toBe('RESIDENT');
  });

  test('GET /admin/dashboard denies RESIDENT', async () => {
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: 'resident@cms.local', password: 'resident123456' });

    const token = loginRes.body.data.accessToken;
    const adminRes = await request(app)
      .get('/admin/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(adminRes.statusCode).toBe(403);
    expect(adminRes.body.error.code).toBe('RBAC_FORBIDDEN');
  });

  test('GET /admin/dashboard allows SU', async () => {
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: 'su@cms.local', password: 'su123456' });

    const token = loginRes.body.data.accessToken;
    const adminRes = await request(app)
      .get('/admin/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(adminRes.statusCode).toBe(200);
    expect(adminRes.body.data.role).toBe('SU');
  });
});
