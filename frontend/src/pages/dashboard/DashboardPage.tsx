import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context';
import { expenseApi, type Expense } from '../../features/dashboard/api/expenseApi';
import expenseCoin from '../../assets/expense-coin.svg';

const CATEGORIES = [
  'Food & Dining',
  'Shopping',
  'Housing & Rent',
  'Transportation',
  'Entertainment',
  'Utilities & Bills',
  'Healthcare',
  'Investments',
  'General',
];

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Form State for new expense
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState('Food & Dining');
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formError, setFormError] = useState('');

  const loadExpenses = useCallback(async () => {
    setError('');
    try {
      const response = await expenseApi.getExpenses();
      if (response && response.data) {
        setExpenses(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load expenses');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    expenseApi.getExpenses()
      .then((response) => {
        if (isMounted && response?.data) {
          setExpenses(response.data);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load expenses');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newTitle.trim()) {
      setFormError('Please enter an expense title.');
      return;
    }

    const parsedAmount = parseFloat(newAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError('Please enter a valid positive amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await expenseApi.createExpense({
        title: newTitle.trim(),
        amount: parsedAmount,
        category: newCategory,
        expense_date: newDate,
      });

      if (response && response.data) {
        setExpenses((prev) => [response.data, ...prev]);
        setIsModalOpen(false);
        setNewTitle('');
        setNewAmount('');
        setNewCategory('Food & Dining');
        setNewDate(new Date().toISOString().split('T')[0]);
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id: number | string) => {
    try {
      await expenseApi.deleteExpense(id);
      setExpenses((prev) => prev.filter((exp) => exp.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete expense');
    }
  };

  // Real Backend Metrics calculation
  const totalSpent = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

  // Real current month spending calculated from actual expense records
  const now = new Date();
  const thisMonthExpenses = expenses.filter((exp) => {
    const d = new Date(exp.expense_date || exp.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const thisMonthSpent = thisMonthExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

  // Real Top Category calculation from actual expense records
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    const cat = e.category || 'General';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + (e.amount || 0);
  });
  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const topCategory = sortedCategories[0]?.[0] || 'No entries';
  const topCategoryAmount = sortedCategories[0]?.[1] || 0;
  const topCategoryPercentage = totalSpent > 0 ? Math.round((topCategoryAmount / totalSpent) * 100) : 0;

  // Real Average per Expense
  const averageSpent = expenses.length > 0 ? totalSpent / expenses.length : 0;

  // Filtered transactions
  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch = exp.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || exp.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen w-full bg-[#070b14] text-slate-100 relative overflow-x-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Background ambient lighting */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -left-40 w-140 h-140 rounded-full ambient-glow-green blur-3xl opacity-40 animate-pulse-glow" />
        <div className="absolute top-1/3 -right-40 w-145 h-145 rounded-full ambient-glow-amber blur-3xl opacity-30" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-1.5 flex items-center justify-center shadow-lg shadow-emerald-950/30">
              <img src={expenseCoin} alt="ExpenseTracker Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-white block leading-none">
                Expense<span className="text-emerald-400">Tracker</span>
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                Personal Finance Hub
              </span>
            </div>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-4">
            {/* User chip */}
            <div className="hidden sm:flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800">
              <div className="w-7 h-7 rounded-full bg-linear-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-xs font-bold text-white uppercase shadow-md">
                {user?.username?.charAt(0) || 'U'}
              </div>
              <div className="text-left leading-tight">
                <div className="text-xs font-bold text-white capitalize">{user?.username || 'User'}</div>
                <div className="text-[10px] text-slate-400 truncate max-w-36">{user?.email || ''}</div>
              </div>
            </div>

            {/* Logout button */}
            <button
              id="btn-logout"
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900/80 hover:bg-rose-500/15 text-slate-300 hover:text-rose-300 border border-slate-800 hover:border-rose-500/30 transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Workspace */}
      <main className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-linear-to-r from-emerald-950/40 via-slate-900/60 to-slate-900/40 border border-emerald-500/20 p-6 sm:p-8 rounded-3xl backdrop-blur-xl shadow-2xl">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Financial Overview
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, <span className="text-emerald-400 capitalize">{user?.username}</span>!
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Track your spending patterns, analyze budget targets, and keep full control of your cash flow.
            </p>
          </div>

          <button
            id="btn-open-add-expense"
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="self-start md:self-auto inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-linear-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-400 hover:shadow-emerald-500/40 transition-all duration-300 active:scale-95 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span>Log New Expense</span>
          </button>
        </div>

        {/* Real Metrics Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Metric 1: Total Recorded Spend */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-xl backdrop-blur-xl relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
              <span>Total Recorded Spend</span>
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </span>
            </div>
            <div className="text-2xl xl:text-3xl font-black text-white">
              ₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5 font-medium">
              <span className="text-emerald-400 font-bold">{expenses.length}</span> total transactions in database
            </div>
          </div>

          {/* Metric 2: This Month's Spend */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-xl backdrop-blur-xl relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
              <span>This Month's Spending</span>
              <span className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </span>
            </div>
            <div className="text-2xl xl:text-3xl font-black text-white">
              ₹{thisMonthSpent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-400 mt-2 font-medium">
              <span className="text-teal-400 font-bold">{thisMonthExpenses.length}</span> entries this calendar month
            </div>
          </div>

          {/* Metric 3: Top Category */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-xl backdrop-blur-xl relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
              <span>Top Category</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400">
                {topCategoryPercentage}%
              </span>
            </div>
            <div className="text-xl xl:text-2xl font-black text-white truncate mb-1">
              {topCategory}
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              ₹{topCategoryAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} total spent
            </div>
          </div>

          {/* Metric 4: Average per Expense */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-xl backdrop-blur-xl relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
              <span>Avg. Ticket Size</span>
              <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </div>
            <div className="text-2xl xl:text-3xl font-black text-white">
              ₹{averageSpent.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div className="text-[11px] text-slate-400 mt-2 font-medium">
              Average spent per transaction
            </div>
          </div>
        </div>

        {/* Expense History Section */}
        <section className="bg-slate-900/60 border border-slate-800/90 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          {/* Section Header with Search and Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Recent Transactions</h2>
              <p className="text-xs text-slate-400 mt-0.5">Real-time ledger of recorded expenses</p>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Category Filter */}
              <select
                id="filter-category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Search input */}
              <div className="relative">
                <input
                  id="search-expenses"
                  type="text"
                  placeholder="Search expenses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-56 bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <svg
                  className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between mb-4">
              <span>{error}</span>
              <button
                type="button"
                onClick={loadExpenses}
                className="underline font-bold text-rose-400 hover:text-rose-300 cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading Skeleton State */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 rounded-2xl bg-slate-800/40 animate-pulse" />
              ))}
            </div>
          ) : filteredExpenses.length === 0 ? (
            /* Empty State */
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center mx-auto mb-4 text-slate-400">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-white mb-1">No expenses recorded yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
                {searchQuery || selectedCategory !== 'all'
                  ? 'No transactions matched your search or category filter.'
                  : 'Start tracking your spending by adding your very first expense entry.'}
              </p>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold transition-all border border-emerald-500/30 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add First Expense</span>
              </button>
            </div>
          ) : (
            /* Transactions Table / List */
            <div className="divide-y divide-slate-800/60">
              {filteredExpenses.map((exp) => {
                const formattedDate = new Date(exp.expense_date || exp.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });

                return (
                  <div
                    key={exp.id}
                    className="py-4 flex items-center justify-between gap-4 group hover:bg-slate-800/20 px-3 -mx-3 rounded-2xl transition-colors"
                  >
                    {/* Title & Category Badge */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-white text-sm truncate">{exp.title}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400/90 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                            {exp.category}
                          </span>
                          <span className="text-[11px] text-slate-400">{formattedDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Amount & Delete */}
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div className="font-black text-white text-base">
                          -₹{Number(exp.amount).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteExpense(exp.id)}
                        title="Delete expense"
                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Log New Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Log New Expense</h3>
                <p className="text-xs text-slate-400 mt-0.5">Record a debit transaction to your account</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateExpense} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {formError}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="expense-title">
                  Expense Title
                </label>
                <input
                  id="expense-title"
                  type="text"
                  placeholder="e.g., Grocery at Supermarket"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="expense-amount">
                  Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    ₹
                  </span>
                  <input
                    id="expense-amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="expense-category">
                  Category
                </label>
                <select
                  id="expense-category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="expense-date">
                  Expense Date
                </label>
                <input
                  id="expense-date"
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-expense"
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
