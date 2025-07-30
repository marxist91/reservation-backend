// __tests__/routes/reservations.test.js
const request = require('supertest');
const app = require('../../../app'); // ton Express
describe('Reservations routes', () => {
  it('POST /reservations → crée une réservation', async () => {
    const res = await request(app)
      .post('/reservations')
      .send({ roomId: 1, userId: 2, date: '2025-07-29' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    
  });
});