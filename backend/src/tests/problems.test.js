import request from 'supertest';
import app from '../app.js';
import User from '../models/User.js';

describe('Problem Routes', () => {
  let adminToken = '';
  let createdProblemId = '';

  const adminUser = {
    name: 'Problem Admin',
    email: 'admin_problems@example.com',
    password: 'password123',
    role: 'admin',
    isEmailVerified: true
  };

  beforeAll(async () => {
    // Create an admin user directly in the database
    const user = await User.create(adminUser);
    
    // Login to get the JWT token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: adminUser.email,
        password: adminUser.password
      });
      
    adminToken = loginRes.body.token;
  });

  it('should allow admin to create a new problem', async () => {
    const newProblem = {
      name: 'Test Two Sum',
      externalId: 'custom_test_two_sum',
      source: 'FULLPREP',
      difficulty: 'EASY',
      description: 'Find two numbers that add up to target.',
      timeLimitSeconds: 1,
      memoryLimitMb: 256,
      cfTags: ['math', 'arrays']
    };

    const res = await request(app)
      .post('/api/problems')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newProblem);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe(newProblem.name);
    
    createdProblemId = res.body.data._id; // Save for later tests
  });

  it('should fetch public tags', async () => {
    const res = await request(app).get('/api/problems/tags');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tags.length).toBeGreaterThan(0);
  });

  it('should not allow regular users to create problems', async () => {
    const res = await request(app)
      .post('/api/problems')
      .send({ name: 'Hacker Problem' });

    expect(res.status).toBe(401); // Unauthorized, no token
  });

  it('should fetch the list of problems', async () => {
    const res = await request(app).get('/api/problems');
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Since we created one problem above, the total should be at least 1
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('should fetch a single problem by ID', async () => {
    const res = await request(app).get(`/api/problems/${createdProblemId}`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Test Two Sum');
  });
});
