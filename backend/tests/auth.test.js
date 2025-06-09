// backend/tests/auth.test.js
const request = require('supertest');
// Important: We need to get the app from index.js, but index.js starts the server.
// For testing, it's better if index.js EXPORTS the app without starting it,
// and a separate server.js imports app and starts it.
// For now, we'll try to work with the current structure, but this might need refactoring.
// Let's assume index.js is modified to export app for testing or supertest handles it.
// If index.js directly calls app.listen(), supertest usually manages this by starting
// the server on an ephemeral port.

jest.mock('../database'); // Explicitly mock database
// Mock bcrypt for faster tests (optional, but good practice)
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true)
}));

const app = require('../index'); // Assuming index.js exports app or supertest handles it
const { db } = require('../database'); // This will be the mocked version

describe('Auth Endpoints', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Reset bcrypt compare mock to default true for login tests, can be overridden
    require('bcryptjs').compare.mockResolvedValue(true);
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new user successfully', async () => {
      db.run.mockImplementationOnce((sql, params, callback) => {
        // Simulate database assigning an ID
        callback.call({ lastID: 1 }, null);
      });

      const res = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'User created successfully');
      expect(res.body).toHaveProperty('userId', 1);
      expect(db.run).toHaveBeenCalledTimes(1);
      expect(require('bcryptjs').hash).toHaveBeenCalledWith('password123', 10);
    });

    it('should return 409 if email already exists', async () => {
      db.run.mockImplementationOnce((sql, params, callback) => {
        const err = new Error('UNIQUE constraint failed: users.email');
        callback(err);
      });

      const res = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'existing@example.com', password: 'password123' });

      expect(res.statusCode).toEqual(409);
      expect(res.body).toHaveProperty('message', 'Email already exists');
    });

    it('should return 400 if email or password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'test@example.com' }); // Missing password
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Email and password are required');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully and return a token', async () => {
      const mockUser = { id: 1, email: 'test@example.com', password: 'hashedPassword' };
      db.get.mockImplementationOnce((sql, params, callback) => callback(null, mockUser));

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Logged in successfully');
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('userId', 1);
      expect(require('bcryptjs').compare).toHaveBeenCalledWith('password123', 'hashedPassword');
    });

    it('should return 401 for non-existent user', async () => {
      db.get.mockImplementationOnce((sql, params, callback) => callback(null, null)); // User not found

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'unknown@example.com', password: 'password123' });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message', 'Invalid credentials (user not found)');
    });

    it('should return 401 for password mismatch', async () => {
      const mockUser = { id: 1, email: 'test@example.com', password: 'hashedPassword' };
      db.get.mockImplementationOnce((sql, params, callback) => callback(null, mockUser));
      require('bcryptjs').compare.mockResolvedValueOnce(false); // Simulate password mismatch

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message', 'Invalid credentials (password mismatch)');
    });
  });
});
