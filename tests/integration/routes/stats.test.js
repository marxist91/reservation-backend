const request = require('supertest');
const express = require('express');

// Mock auth middleware so requests are allowed
jest.mock('../../../middlewares/authMiddleware', () => (req, res, next) => next());

// Mock the models module to avoid hitting the real DB during this unit/integration-light test
jest.mock('../../../models', () => {
  const rows = [
    { department_id: 1, department_name: 'DeptTestA', count: 2 },
    { department_id: 2, department_name: 'DeptTestB', count: 1 },
    { department_id: 0, department_name: 'Non renseigné', count: 3 }
  ];

  return {
    sequelize: {
      query: jest.fn().mockImplementation((query, options) => {
        // countQuery contains COUNT(DISTINCT ...)
        if (typeof query === 'string' && query.includes('COUNT(DISTINCT')) {
          return Promise.resolve([{ total: rows.length }]);
        }
        // otherwise return the rows array
        return Promise.resolve(rows);
      })
    },
    Sequelize: { QueryTypes: { SELECT: 'SELECT' } }
  };
});

describe('GET /api/stats/reservations-by-department (mocked models)', () => {
  let app;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    const statsRouter = require('../../../routes/stats');
    app.use('/api/stats', statsRouter);
  });

  test('returns aggregated counts by department (mocked)', async () => {
    const res = await request(app)
      .get('/api/stats/reservations-by-department')
      .expect(200);

    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);

    const names = res.body.data.map(d => d.department_name);
    expect(names).toEqual(expect.arrayContaining(['DeptTestA', 'DeptTestB', 'Non renseigné']));

    const deptAEntry = res.body.data.find(d => d.department_name === 'DeptTestA');
    expect(deptAEntry).toBeDefined();
    expect(Number(deptAEntry.count)).toBe(2);
  });
});
