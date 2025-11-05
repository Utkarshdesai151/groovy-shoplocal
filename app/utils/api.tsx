import { projectId, publicAnonKey } from './superbase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-4ca6791f`;

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

class ApiClient {
  private accessToken: string | null = null;

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken || publicAnonKey}`,
        ...options.headers as Record<string, string>
      };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(`API Error (${response.status}):`, data);
        return { error: data.error || 'An error occurred' };
      }

      return { data };
    } catch (error) {
      console.error('Network error:', error);
      return { error: 'Network error occurred' };
    }
  }

  // Auth endpoints
  async register(userData: { email: string; password: string; name: string; phone: string }) {
    return this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async getProfile() {
    return this.makeRequest('/auth/profile');
  }

  // Location endpoints
  async getLocations() {
    return this.makeRequest('/locations');
  }

  // Shop endpoints
  async getShops(location: string) {
    return this.makeRequest(`/shops/${encodeURIComponent(location)}`);
  }

  // Product endpoints
  async getProducts(shopId: string) {
    return this.makeRequest(`/products/${shopId}`);
  }

  // Order endpoints
  async createOrder(orderData: any) {
    return this.makeRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  async getOrders() {
    return this.makeRequest('/orders');
  }

  async getOrder(orderId: string) {
    return this.makeRequest(`/orders/${orderId}`);
  }

  async updateOrderStatus(orderId: string, status: string) {
    return this.makeRequest(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  // Health check
  async healthCheck() {
    return this.makeRequest('/health');
  }
}

export const api = new ApiClient();