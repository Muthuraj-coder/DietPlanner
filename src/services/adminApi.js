const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const DEFAULT_ADMIN_KEY = import.meta.env.VITE_ADMIN_API_KEY || 'admin-demo-key';

const hasWindow = typeof window !== 'undefined';

class AdminApiService {
  constructor() {
    const storedKey = hasWindow ? window.localStorage.getItem('adminKey') : null;
    const isAuthenticated = hasWindow ? window.localStorage.getItem('isAdminAuthenticated') === 'true' : false;
    this.adminKey = isAuthenticated ? storedKey : null;
  }

  getDefaultKey() {
    return DEFAULT_ADMIN_KEY;
  }

  setAdminKey(key = DEFAULT_ADMIN_KEY) {
    this.adminKey = key;
    if (hasWindow) {
      window.localStorage.setItem('adminKey', key);
    }
  }

  clearAdminSession() {
    this.adminKey = null;
    if (hasWindow) {
      window.localStorage.removeItem('adminKey');
      window.localStorage.removeItem('isAdminAuthenticated');
    }
  }

  isAuthenticated() {
    return Boolean(this.adminKey);
  }

  async makeRequest(endpoint, options = {}) {
    if (!this.adminKey) {
      throw new Error('Admin session not initialized');
    }

    const headers = {
      'Content-Type': 'application/json',
      'x-admin-key': this.adminKey,
      ...(options.headers || {}),
    };

    const config = {
      ...options,
      headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || 'Admin request failed');
    }

    return data;
  }

  async getUsers(searchTerm = '') {
    const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
    return this.makeRequest(`/admin/users${query}`, {
      method: 'GET',
    });
  }

  async getUserDetails(userId) {
    return this.makeRequest(`/admin/users/${userId}`, {
      method: 'GET',
    });
  }

  async updateUser(userId, payload) {
    return this.makeRequest(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteUser(userId) {
    return this.makeRequest(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async updateMealEntry(userId, mealPlanId, mealId, payload) {
    return this.makeRequest(`/admin/users/${userId}/meal-plans/${mealPlanId}/meals/${mealId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteMealEntry(userId, mealPlanId, mealId) {
    return this.makeRequest(`/admin/users/${userId}/meal-plans/${mealPlanId}/meals/${mealId}`, {
      method: 'DELETE',
    });
  }
}

const adminApi = new AdminApiService();

export default adminApi;

