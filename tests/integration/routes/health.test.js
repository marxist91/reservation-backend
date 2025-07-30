// tests/integration/routes/health.test.js
const request = require('supertest');
const { createTestApp } = require('../../helpers/testServer');

describe('Health Check', () => {
  let testApp;

  beforeAll(async () => {
    testApp = await createTestApp();
  });

  test('GET / - Server is running', async () => {
    const response = await request(testApp)
      .get('/')
      .expect(200);
    
    console.log('Server response:', response.body);
  });
});