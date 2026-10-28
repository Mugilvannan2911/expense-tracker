import { apiClient } from '../../../shared/api/apiClient';

export interface Expense {
  id: number | string;
  user_id: number | string;
  title: string;
  amount: number;
  category: string;
  expense_date: string;
  created_at: string;
}

export interface ExpensesResponse {
  status: 'success';
  message: string;
  data: Expense[];
}

export interface CreateExpenseResponse {
  status: 'success';
  message: string;
  data: Expense;
}

export interface DeleteExpenseResponse {
  status: 'success';
  message: string;
}

export const expenseApi = {
  /**
   * Fetch all expenses for the current user
   */
  async getExpenses(): Promise<ExpensesResponse> {
    return apiClient<ExpensesResponse>('/api/expense', {
      method: 'GET',
    });
  },

  /**
   * Log a new expense
   */
  async createExpense(data: {
    title: string;
    amount: number;
    category: string;
    expense_date?: string;
  }): Promise<CreateExpenseResponse> {
    return apiClient<CreateExpenseResponse>('/api/expense/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete an expense by ID
   */
  async deleteExpense(id: number | string): Promise<DeleteExpenseResponse> {
    return apiClient<DeleteExpenseResponse>(`/api/expense/${id}`, {
      method: 'DELETE',
    });
  },
};
