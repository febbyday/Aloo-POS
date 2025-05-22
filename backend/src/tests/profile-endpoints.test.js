/**
 * Profile Endpoints Tests
 * 
 * Tests for the profile management endpoints
 */

const request = require('supertest');
const app = require('../app');
const { createTestUser, loginTestUser, cleanupTestUser } = require('./test-utils');

describe('Profile Endpoints', () => {
  let authToken;
  let testUser;

  // Setup: Create a test user and get auth token
  beforeAll(async () => {
    testUser = await createTestUser();
    const loginResponse = await loginTestUser(testUser.email, 'password123');
    authToken = loginResponse.token;
  });

  // Cleanup: Remove test user
  afterAll(async () => {
    await cleanupTestUser(testUser.id);
  });

  // Test getting profile
  test('GET /api/v1/auth/profile - Get user profile', async () => {
    const response = await request(app)
      .get('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data).toHaveProperty('username', testUser.username);
    expect(response.body.data).toHaveProperty('email', testUser.email);
    expect(response.body.data).not.toHaveProperty('password');
  });

  // Test updating profile
  test('POST /api/v1/auth/profile/update - Update user profile', async () => {
    const updatedData = {
      firstName: 'Updated',
      lastName: 'User'
    };

    const response = await request(app)
      .post('/api/v1/auth/profile/update')
      .set('Authorization', `Bearer ${authToken}`)
      .send(updatedData);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('firstName', updatedData.firstName);
    expect(response.body.data).toHaveProperty('lastName', updatedData.lastName);
  });

  // Test changing password
  test('POST /api/v1/auth/profile/change-password - Change password', async () => {
    const passwordData = {
      currentPassword: 'password123',
      newPassword: 'newPassword123'
    };

    const response = await request(app)
      .post('/api/v1/auth/profile/change-password')
      .set('Authorization', `Bearer ${authToken}`)
      .send(passwordData);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body).toHaveProperty('message', 'Password changed successfully');

    // Verify we can login with the new password
    const loginResponse = await loginTestUser(testUser.email, 'newPassword123');
    expect(loginResponse).toHaveProperty('token');
  });

  // Test avatar upload
  test('POST /api/v1/auth/profile/upload-avatar - Upload avatar', async () => {
    // Create a simple test image
    const testImagePath = path.join(__dirname, 'test-avatar.png');
    
    const response = await request(app)
      .post('/api/v1/auth/profile/upload-avatar')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('avatar', testImagePath);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('avatarUrl');
    
    // Verify the avatar URL is accessible
    const avatarUrl = response.body.data.avatarUrl;
    const avatarResponse = await request(app).get(avatarUrl);
    expect(avatarResponse.status).toBe(200);
  });
});
