// tests/quick-verify.test.js
const request = require('supertest');
const { createTestApp } = require('./helpers/testServer');

describe('🚀 Vérification rapide des routes', () => {
  let testApp;

  beforeAll(async () => {
    testApp = await createTestApp();
  });

  test('GET /api/rooms retourne 401 (pas 404)', async () => {
    const response = await request(testApp)
      .get('/api/rooms');
      
    console.log('📊 Status:', response.status);
    console.log('🔍 Body:', response.body);
    
    expect(response.status).toBe(401);
    expect(response.body.error).toBeDefined();
  });

  test('POST /api/rooms retourne 401 (pas 404)', async () => {
    const response = await request(testApp)
      .post('/api/rooms')
      .send({ name: 'Test Room' });
      
    console.log('📊 Status:', response.status);
    
    expect(response.status).toBe(401);
  });

  test('GET /api/rooms/1 retourne 401 (pas 404)', async () => {
    const response = await request(testApp)
      .get('/api/rooms/1');
      
    console.log('📊 Status:', response.status);
    
    expect(response.status).toBe(401);
  });
});