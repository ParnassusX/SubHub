// backend/tests/subscriptions.test.js
const request = require('supertest');
const app = require('../index'); // Express app from index.js
const { db } = require('../database'); // Mocked database
const jwt = require('jsonwebtoken'); // Used to sign mock tokens if needed, or get from login

// Ensure bcrypt is mocked as in auth.test.js if not globally mocked via jest.config.js
// or if specific behaviors are needed. For these tests, we primarily care about the token.
jest.mock('bcryptjs', () => ({
  // No specific bcrypt operations are directly tested here, only that auth protects routes
  // So, a simple mock is fine.
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true)
}));

// Ensure database is explicitly mocked for these tests too
jest.mock('../database');


describe('Subscription Endpoints', () => {
  let token;
  const testUserId = 1;
  const testUserEmail = 'user@example.com';

  beforeAll(async () => {
    // Simulate a successful login to get a token for testing protected routes
    // We can either call the login endpoint or directly sign a token for test user
    // Calling login endpoint is more of an integration test for login itself.
    // For unit testing subscriptions, directly signing a token is more isolated.

    // Option 1: Directly sign a token (simpler for isolated testing)
    token = jwt.sign({ userId: testUserId, email: testUserEmail }, 'your_very_secret_key_that_should_be_in_env_var', { expiresIn: '1h' });

    // Option 2: Call login endpoint (if you want to also test login integration here)
    // This requires the login endpoint to work with the mocked db.
    // db.get.mockImplementation((sql, params, callback) => {
    //   if (params.includes(testUserEmail)) {
    //     callback(null, { id: testUserId, email: testUserEmail, password: 'hashedPassword' });
    //   } else {
    //     callback(null, null);
    //   }
    // });
    // const loginRes = await request(app)
    //   .post('/api/auth/login')
    //   .send({ email: testUserEmail, password: 'password' });
    // token = loginRes.body.token;
  });

  beforeEach(() => {
    jest.clearAllMocks(); // Clear mock usage counts before each test
  });

  describe('POST /api/subscriptions', () => {
    it('should create a new subscription for the authenticated user', async () => {
      db.run.mockImplementationOnce((sql, params, callback) => {
        // Params should include [testUserId, name, category, ...]
        expect(params[0]).toBe(testUserId);
        callback.call({ lastID: 100 }, null); // Simulate insert, provide lastID
      });

      const res = await request(app)
        .post('/api/subscriptions')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Netflix', category: 'Entertainment', billingCycle: 'Monthly', nextPaymentDate: '2024-08-01', amount: 15.99 });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'Subscription created');
      expect(res.body).toHaveProperty('id', 100);
      expect(res.body).toHaveProperty('userId', testUserId);
      expect(db.run).toHaveBeenCalledTimes(1);
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app)
        .post('/api/subscriptions')
        .send({ name: 'Netflix', category: 'Entertainment', billingCycle: 'Monthly', nextPaymentDate: '2024-08-01', amount: 15.99 });
      expect(res.statusCode).toEqual(401);
    });
  });

  describe('GET /api/subscriptions', () => {
    it('should fetch subscriptions for the authenticated user', async () => {
      const mockSubs = [{ id: 1, userId: testUserId, name: 'Spotify' }];
      db.all.mockImplementationOnce((sql, params, callback) => {
        expect(params[0]).toBe(testUserId);
        callback(null, mockSubs);
      });

      const res = await request(app)
        .get('/api/subscriptions')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockSubs);
      expect(db.all).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/subscriptions/:id', () => {
    it('should fetch a specific subscription for the authenticated user', async () => {
        const mockSub = { id: 1, userId: testUserId, name: 'SpecificSub' };
        db.get.mockImplementationOnce((sql, params, callback) => {
            expect(params[0]).toBe("1"); // id from URL is a string
            expect(params[1]).toBe(testUserId); // authenticated user's ID
            callback(null, mockSub);
        });

        const res = await request(app)
            .get('/api/subscriptions/1')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(mockSub);
    });

    it('should return 404 if subscription not found or not owned by user', async () => {
        db.get.mockImplementationOnce((sql, params, callback) => {
            callback(null, null); // Simulate not found
        });
        const res = await request(app)
            .get('/api/subscriptions/999')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(404);
    });
  });

  describe('PUT /api/subscriptions/:id', () => {
    it('should update a subscription for the authenticated user', async () => {
        db.run.mockImplementationOnce((sql, paramsCallback, callback) => {
            // SQL: UPDATE subscriptions SET name = ? WHERE id = ? AND userId = ?
            // paramsCallback should be [newName, id, testUserId]
            expect(paramsCallback[paramsCallback.length - 1]).toBe(testUserId); // userId
            expect(paramsCallback[paramsCallback.length - 2]).toBe("1"); // id (params are stringified by supertest/bodyparser if not numbers)
            callback.call({ changes: 1 }, null); // Simulate 1 row updated
        });

        const res = await request(app)
            .put('/api/subscriptions/1')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Updated Netflix Name' });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Subscription updated successfully');
    });
     it('should return 404 when trying to update a non-existent or non-owned subscription', async () => {
        db.run.mockImplementationOnce((sql, params, callback) => {
            callback.call({ changes: 0 }, null); // Simulate no rows updated
        });
        const res = await request(app)
            .put('/api/subscriptions/999')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Trying to update' });
        expect(res.statusCode).toEqual(404);
    });
  });

  describe('DELETE /api/subscriptions/:id', () => {
    it('should delete a subscription for the authenticated user', async () => {
        db.run.mockImplementationOnce((sql, params, callback) => {
            expect(params[0]).toBe("1"); // id
            expect(params[1]).toBe(testUserId); // userId
            callback.call({ changes: 1 }, null); // Simulate 1 row deleted
        });
        const res = await request(app)
            .delete('/api/subscriptions/1')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Subscription deleted successfully');
    });
    it('should return 404 when trying to delete a non-existent or non-owned subscription', async () => {
        db.run.mockImplementationOnce((sql, params, callback) => {
            callback.call({ changes: 0 }, null); // Simulate no rows deleted
        });
        const res = await request(app)
            .delete('/api/subscriptions/999')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(404);
    });
  });
});
