import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/expenses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExpenses(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      await axios.post(`${apiUrl}/expenses`, {
        title, amount: parseFloat(amount), category, date
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTitle('');
      setAmount('');
      fetchExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      await axios.delete(`${apiUrl}/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  const totalExpenses = expenses.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, {localStorage.getItem('username')}!</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
            <DollarSign />
          </div>
          <div className="stat-info">
            <h3>Total Expenses</h3>
            <p>${totalExpenses.toFixed(2)}</p>
          </div>
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
            <TrendingUp />
          </div>
          <div className="stat-info">
            <h3>Transactions</h3>
            <p>{expenses.length}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', height: 'fit-content' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Add New Expense</h3>
          <form onSubmit={handleAddExpense}>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input type="text" className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Amount</label>
              <input type="number" step="0.01" className="input-field" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="input-field" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option>Food</option>
                <option>Transport</option>
                <option>Entertainment</option>
                <option>Utilities</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%' }}>
              <Plus size={20} /> Add Expense
            </button>
          </form>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Recent Expenses</h3>
          {loading ? (
            <p>Loading...</p>
          ) : expenses.length === 0 ? (
            <p>No expenses found. Add some!</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense.id}>
                      <td>{new Date(expense.date).toLocaleDateString()}</td>
                      <td>{expense.title}</td>
                      <td>
                        <span className={`badge ${expense.category === 'Food' ? 'badge-expense' : 'badge-neutral'}`}>
                          {expense.category}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>${parseFloat(expense.amount).toFixed(2)}</td>
                      <td>
                        <button 
                          onClick={() => handleDelete(expense.id)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
