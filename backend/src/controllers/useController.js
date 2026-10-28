const prisma = require('../config/prisma');

const getUsers = async (req, res) => {
    try {
        const userId = req.user?.id;
        const whereClause = userId ? { user_id: parseInt(userId, 10) } : {};

        const results = await prisma.expense.findMany({
            where: whereClause,
            orderBy: {
                expense_date: 'desc'
            }
        });

        res.json({
            status: 'success',
            message: 'Expenses fetched successfully',
            data: results
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Error fetching expenses from the database',
            error: err.message
        });
    }
};

const createUser = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.user_id;
        const { title, amount, category, expense_date } = req.body;

        if (!userId) {
            return res.status(400).json({
                status: 'error',
                message: 'User ID is required to log an expense'
            });
        }

        if (!title || amount === undefined || isNaN(parseFloat(amount))) {
            return res.status(400).json({
                status: 'error',
                message: 'Title and a valid numeric amount are required'
            });
        }

        const newExpense = await prisma.expense.create({
            data: {
                user_id: parseInt(userId, 10),
                title,
                amount: parseFloat(amount),
                category: category || 'General',
                expense_date: expense_date ? new Date(expense_date) : new Date()
            }
        });

        res.status(201).json({
            status: 'success',
            message: 'Expense created successfully',
            data: newExpense
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Error creating expense',
            error: err.message
        });
    }
};

const deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.expense.delete({
            where: { id: parseInt(id, 10) }
        });
        res.json({
            status: 'success',
            message: 'Expense deleted successfully'
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Error deleting expense',
            error: err.message
        });
    }
};

module.exports = { getUsers, createUser, deleteExpense };
