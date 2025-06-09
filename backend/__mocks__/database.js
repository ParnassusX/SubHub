// backend/__mocks__/database.js
const mockDb = {
  run: jest.fn((sql, params, callback) => callback(null)), // Default success
  get: jest.fn((sql, params, callback) => callback(null, null)), // Default not found
  all: jest.fn((sql, params, callback) => callback(null, [])), // Default empty array
};

const initDb = jest.fn((callback) => callback(null)); // Mock initDb

module.exports = {
  db: mockDb,
  initDb,
};
