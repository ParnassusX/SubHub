const express = require('express');
const database = require('./database.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = process.env.PORT || 3001; // Keep PORT here, server.js will use it via app.listen
const JWT_SECRET = 'your_very_secret_key_that_should_be_in_env_var'; // IMPORTANT: Use environment variable in production

app.use(express.json());

// --- Authentication ---
app.post('/api/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds = 10
    const sql = `INSERT INTO users (email, password) VALUES (?,?)`;
    database.db.run(sql, [email, hashedPassword], function(err) {
      if (err) {
        // Check for unique constraint error (SQLite code for unique constraint is SQLITE_CONSTRAINT_UNIQUE)
        if (err.message.includes('UNIQUE constraint failed: users.email')) {
             return res.status(409).json({ message: 'Email already exists' });
        }
        return res.status(500).json({ message: 'Error creating user', error: err.message });
      }
      // Return user info (excluding password) or just a success message
      res.status(201).json({ message: 'User created successfully', userId: this.lastID, email: email });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during password hashing', error: error.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const sql = "SELECT * FROM users WHERE email = ?";
  database.db.get(sql, [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Error logging in', error: err.message });
    }
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials (user not found)' });
    }

    try {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials (password mismatch)' });
      }

      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ message: 'Logged in successfully', token: token, userId: user.id, email: user.email });

    } catch (error) {
      res.status(500).json({ message: 'Server error during password comparison', error: error.message });
    }
  });
});

// --- Middleware to verify JWT ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) return res.sendStatus(401); // if there isn't any token

  jwt.verify(token, JWT_SECRET, (err, userPayload) => { // Renamed 'user' to 'userPayload' to avoid conflict with req.user
    if (err) return res.sendStatus(403); // if token is no longer valid
    req.user = userPayload; // Add user payload to request object
    next(); // pass the execution to the downstream middlewares
  });
};

// --- Subscriptions CRUD (now protected and using authenticated user) ---
// All routes starting with '/api/subscriptions' will use authenticateToken middleware
app.post('/api/subscriptions', authenticateToken, (req, res) => {
  const userId = req.user.userId; // Use userId from JWT payload
  const { name, category, billingCycle, nextPaymentDate, amount } = req.body;
  if (!name || !category || !billingCycle || !nextPaymentDate || amount === undefined) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  const sql = `INSERT INTO subscriptions (userId, name, category, billingCycle, nextPaymentDate, amount) VALUES (?,?,?,?,?,?)`;
  const params = [userId, name, category, billingCycle, nextPaymentDate, amount];
  database.db.run(sql, params, function(err) {
    if (err) { return res.status(500).json({ message: 'Error creating subscription', error: err.message }); }
    res.status(201).json({ message: 'Subscription created', id: this.lastID, userId, name, category, billingCycle, nextPaymentDate, amount });
  });
});

app.get('/api/subscriptions', authenticateToken, (req, res) => {
  const userId = req.user.userId; // Use userId from JWT payload
  const sql = "SELECT * FROM subscriptions WHERE userId = ?";
  database.db.all(sql, [userId], (err, rows) => {
    if (err) { return res.status(500).json({ message: 'Error fetching subscriptions', error: err.message }); }
    res.json(rows);
  });
});

app.get('/api/subscriptions/:id', authenticateToken, (req, res) => {
  const userId = req.user.userId; // Use userId from JWT payload
  const { id } = req.params;
  const sql = "SELECT * FROM subscriptions WHERE id = ? AND userId = ?";
  database.db.get(sql, [id, userId], (err, row) => {
    if (err) { return res.status(500).json({ message: 'Error fetching subscription', error: err.message }); }
    if (row) { res.json(row); }
    else { res.status(404).json({ message: 'Subscription not found or not owned by user' }); } // Updated message
  });
});

app.put('/api/subscriptions/:id', authenticateToken, (req, res) => {
  const userId = req.user.userId; // Use userId from JWT payload
  const { id } = req.params;
  const { name, category, billingCycle, nextPaymentDate, amount } = req.body;
  // Corrected validation: ensure at least one field is being updated
  if (name === undefined && category === undefined && billingCycle === undefined && nextPaymentDate === undefined && amount === undefined) {
    return res.status(400).json({ message: 'No fields provided for update' });
  }
  const fields = []; const params = [];
  if (name !== undefined) { fields.push("name = ?"); params.push(name); }
  if (category !== undefined) { fields.push("category = ?"); params.push(category); }
  if (billingCycle !== undefined) { fields.push("billingCycle = ?"); params.push(billingCycle); }
  if (nextPaymentDate !== undefined) { fields.push("nextPaymentDate = ?"); params.push(nextPaymentDate); }
  if (amount !== undefined) { fields.push("amount = ?"); params.push(amount); }
  if (fields.length === 0) { return res.status(400).json({ message: "No valid fields to update." }); }
  params.push(id); params.push(userId); // Ensure userId is used in the WHERE clause
  const sql = `UPDATE subscriptions SET ${fields.join(", ")} WHERE id = ? AND userId = ?`;
  database.db.run(sql, params, function(err) {
    if (err) { return res.status(500).json({ message: 'Error updating subscription', error: err.message }); }
    if (this.changes === 0) { return res.status(404).json({ message: 'Subscription not found, not owned by user, or no changes made' }); } // Updated message
    res.json({ message: 'Subscription updated successfully', id: id });
  });
});

app.delete('/api/subscriptions/:id', authenticateToken, (req, res) => {
  const userId = req.user.userId; // Use userId from JWT payload
  const { id } = req.params;
  const sql = 'DELETE FROM subscriptions WHERE id = ? AND userId = ?';
  database.db.run(sql, [id, userId], function(err) {
    if (err) { return res.status(500).json({ message: 'Error deleting subscription', error: err.message }); }
    if (this.changes === 0) { return res.status(404).json({ message: 'Subscription not found or not owned by user' }); } // Updated message
    res.json({ message: 'Subscription deleted successfully', id: id });
  });
});

module.exports = app; // Export the app instance for testing or for server.js to use
