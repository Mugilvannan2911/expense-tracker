const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { authenticate } = require('../middlewares/authMiddleware');

router.use(authenticate);

router.get('/', expenseController.getExpenses);
router.post('/', expenseController.addExpense);
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;
