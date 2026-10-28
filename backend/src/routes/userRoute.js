const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { getUsers, createUser, deleteExpense } = require('../controllers/useController');

const router = express.Router();

// Fetch expenses for logged-in user
router.get('/', authMiddleware, getUsers);

// Create new expense for logged-in user
router.post('/create', authMiddleware, createUser);

// Delete an expense
router.delete('/:id', authMiddleware, deleteExpense);

module.exports = router;