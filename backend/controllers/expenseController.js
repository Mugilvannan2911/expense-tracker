const pool = require('../config/db');

exports.getExpenses = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC', [req.userId]);
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addExpense = async (req, res) => {
    try {
        const { title, amount, category, date } = req.body;
        const [result] = await pool.query(
            'INSERT INTO expenses (user_id, title, amount, category, date) VALUES (?, ?, ?, ?, ?)',
            [req.userId, title, amount, category, date]
        );
        
        const [newExpense] = await pool.query('SELECT * FROM expenses WHERE id = ?', [result.insertId]);
        res.status(201).json(newExpense[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteExpense = async (req, res) => {
    try {
        await pool.query('DELETE FROM expenses WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
        res.status(200).json({ message: 'Expense deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
