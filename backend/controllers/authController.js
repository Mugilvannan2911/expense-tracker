const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        
        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
        
        const user = rows[0];
        const passwordIsValid = await bcrypt.compare(password, user.password);
        if (!passwordIsValid) return res.status(401).json({ error: 'Invalid password' });
        
        const token = jwt.sign(
            { id: user.id, username: user.username }, 
            process.env.JWT_SECRET || 'secret', 
            { expiresIn: '24h' }
        );
        res.status(200).json({ token, username: user.username });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Check if user exists
        const [existing] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (existing.length > 0) return res.status(400).json({ error: 'Username already exists' });
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Include email in the insert since your DB requires it
        await pool.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword]);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
