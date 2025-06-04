const express = require('express');
const database = require('./database.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = process.env.PORT || 3001;
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

// --- Middleware to verify JWT (placeholder for now, will be used later) ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) return res.sendStatus(401); // if there isn't any token

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // if token is no longer valid
    req.user = user; // Add user payload to request object
    next(); // pass the execution to the downstream middlewares
  });
};

// --- Subscriptions CRUD (modified to use req.user.userId from JWT if available, else placeholder) ---
// For now, we'll keep placeholderUserId for simplicity until frontend sends tokens.
// In a subsequent step, we will replace placeholderUserId with req.user.userId from the authenticateToken middleware.
const placeholderUserId = 1;


app.post('/api/subscriptions', (req, res) => {
  // const userId = req.user ? req.user.userId : placeholderUserId; // Example for future use
  const userId = placeholderUserId;
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

app.get('/api/subscriptions', (req, res) => {
  // const userId = req.user ? req.user.userId : placeholderUserId;
  const userId = placeholderUserId;
  const sql = "SELECT * FROM subscriptions WHERE userId = ?";
  database.db.all(sql, [userId], (err, rows) => {
    if (err) { return res.status(500).json({ message: 'Error fetching subscriptions', error: err.message }); }
    res.json(rows);
  });
});

app.get('/api/subscriptions/:id', (req, res) => {
  // const userId = req.user ? req.user.userId : placeholderUserId;
  const userId = placeholderUserId;
  const { id } = req.params;
  const sql = "SELECT * FROM subscriptions WHERE id = ? AND userId = ?";
  database.db.get(sql, [id, userId], (err, row) => {
    if (err) { return res.status(500).json({ message: 'Error fetching subscription', error: err.message }); }
    if (row) { res.json(row); }
    else { res.status(404).json({ message: 'Subscription not found' }); }
  });
});

app.put('/api/subscriptions/:id', (req, res) => {
  // const userId = req.user ? req.user.userId : placeholderUserId;
  const userId = placeholderUserId;
  const { id } = req.params;
  const { name, category, billingCycle, nextPaymentDate, amount } = req.body;
  if (!name && !category && !billingCycle && !nextPaymentDate && amount === undefined) {
    return res.status(400).json({ message: 'No fields provided for update' });
  }
  const fields = []; const params = [];
  if (name !== undefined) { fields.push("name = ?"); params.push(name); }
  if (category !== undefined) { fields.push("category = ?"); params.push(category); }
  if (billingCycle !== undefined) { fields.push("billingCycle = ?"); params.push(billingCycle); }
  if (nextPaymentDate !== undefined) { fields.push("nextPaymentDate = ?"); params.push(nextPaymentDate); }
  if (amount !== undefined) { fields.push("amount = ?"); params.push(amount); }
  if (fields.length === 0) { return res.status(400).json({ message: "No valid fields to update." }); }
  params.push(id); params.push(userId);
  const sql = `UPDATE subscriptions SET ${fields.join(", ")} WHERE id = ? AND userId = ?`;
  database.db.run(sql, params, function(err) {
    if (err) { return res.status(500).json({ message: 'Error updating subscription', error: err.message }); }
    if (this.changes === 0) { return res.status(404).json({ message: 'Subscription not found or no changes made' }); }
    res.json({ message: 'Subscription updated successfully', id: id });
  });
});

app.delete('/api/subscriptions/:id', (req, res) => {
  // const userId = req.user ? req.user.userId : placeholderUserId;
  const userId = placeholderUserId;
  const { id } = req.params;
  const sql = 'DELETE FROM subscriptions WHERE id = ? AND userId = ?';
  database.db.run(sql, [id, userId], function(err) {
    if (err) { return res.status(500).json({ message: 'Error deleting subscription', error: err.message }); }
    if (this.changes === 0) { return res.status(404).json({ message: 'Subscription not found' }); }
    res.json({ message: 'Subscription deleted successfully', id: id });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  database.initDb((err) => {
    if (err) { console.error("Failed to initialize database:", err); }
    else { console.log("Database initialized successfully."); }
  });
});
