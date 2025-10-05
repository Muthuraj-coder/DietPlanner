// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  // Set token for authenticated requests
  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  // Remove token on logout
  removeToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  // Get headers for API requests
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Make API request
  async makeRequest(endpoint, options = {}) {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const config = {
        headers: this.getHeaders(),
        ...options,
      };

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication methods
  async register(userData) {
    return await this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return await this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async forgotPassword(email) {
    return await this.makeRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(resetToken, newPassword) {
    return await this.makeRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ resetToken, newPassword }),
    });
  }

  async verifyResetToken(resetToken) {
    return await this.makeRequest('/auth/verify-reset-token', {
      method: 'POST',
      body: JSON.stringify({ resetToken }),
    });
  }

  async verifyToken() {
    return await this.makeRequest('/auth/verify', {
      method: 'GET',
    });
  }

  // Profile methods
  async getProfile() {
    return await this.makeRequest('/auth/profile', {
      method: 'GET',
    });
  }

  async updateProfile(profileData) {
    return await this.makeRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Dashboard methods
  async getDashboardStats() {
    return await this.makeRequest('/auth/dashboard-stats', {
      method: 'GET',
    });
  }

  async updateWaterIntake() {
    return await this.makeRequest('/auth/update-water', {
      method: 'POST',
    });
  }

  // Meal plan generation
  async generateMealPlan(profile, edamam) {
    return await this.makeRequest('/mealplan/generate', {
      method: 'POST',
      body: JSON.stringify({ ...profile, ...edamam }),
    });
  }

  // Get today's meal plan
  async getTodayMealPlan() {
    return await this.makeRequest('/mealplan/today', {
      method: 'GET',
    });
  }

  // Complete a meal
  async completeMeal(mealType) {
    return await this.makeRequest('/mealplan/complete-meal', {
      method: 'POST',
      body: JSON.stringify({ mealType }),
    });
  }

  // Check generation status
  async getGenerationStatus() {
    return await this.makeRequest('/mealplan/generation-status', {
      method: 'GET',
    });
  }

  // Health check
  async healthCheck() {
    return await this.makeRequest('/health', {
      method: 'GET',
    });
  }
}

export default new ApiService();
