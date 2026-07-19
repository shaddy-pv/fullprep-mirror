import request from 'supertest';
import app from '../app.js';

describe('Authentication Routes', () => {
  const testUser = {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'password123'
  };

  let token = '';

  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.user.email).toBe(testUser.email);
    expect(response.body.token).toBeDefined();
    
    token = response.body.token; // Save for later tests
  });

  it('should not register a user with an existing email', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(response.status).toBe(409); // Our global error handler sends 409 for duplicates
    expect(response.body.success).toBe(false);
  });

  it('should login an existing user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();
  });

  it('should not login with incorrect password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'wrongpassword'
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('should get current user profile with token', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.user.email).toBe(testUser.email);
  });

  it('should not get profile without token', async () => {
    const response = await request(app)
      .get('/api/auth/me');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
