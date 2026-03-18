const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const auth = require('../middleware/auth');

// Generate quotation number
const generateQuotationNumber = () => {
  return 'QT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
};


//Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Please provide email, password, and name.' });
    }

    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      [email, hashedPassword, name]
    );

    const token = jwt.sign(
      { id: result.insertId, email },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: result.insertId, email, name }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    const [users] = await db.query('SELECT id, email, password, name FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});


//Get current user 
router.get('/me', auth, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, email, name, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(users[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
module.exports.generateQuotationNumber = generateQuotationNumber;
