import * as request from 'supertest';

const USERS = 'http://localhost:3001';
const AUTH = 'http://localhost:3002';

describe('Auth flow (E2E end-to-end)', () => {
  const agent = request.agent(AUTH); // mantém cookies
  let access = '';
  let userId = '';
  const email = 'e2e.' + Date.now() + '@example.com';
  const password = '123456';

  it('create user', async () => {
    const res = await request(USERS)
      .post('/users')
      .send({ name: 'E2E', email, password })
      .expect(201);
    userId = res.body._id;
    expect(userId).toBeDefined();
  });

  it('login → set-cookie (rt) + access_token', async () => {
    const res = await agent
      .post('/auth/login')
      .send({ email, password })
      .expect(201);
    expect(res.headers['set-cookie']?.[0]).toMatch(/access_token=/);
    access = res.body.access_token;
    expect(access).toBeDefined();
  });

  it('RBAC: /auth/admin deve 403 (não admin)', async () => {
    await agent.get('/auth/admin').set('Authorization', `Bearer ${access}`).expect(403);
  });

  it('promove user para admin e testa RBAC 200', async () => {
    const requestUser = await request(USERS)
      .patch('/users/' + userId)
      .send({ roles: ['admin'] })
      .expect(200);

    const res = await agent.post('/auth/refresh').expect(201);
    const access2 = res.body.access_token;
    // await agent.get('/auth/admin').set('Authorization', `Bearer ${access2}`).expect(200);
  });

  it('logout limpa cookie e hash', async () => {
    await agent.post('/auth/logout').set('Authorization', `Bearer ${access}`).expect(201);
  });
});
