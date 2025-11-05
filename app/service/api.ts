import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

// Create Supabase client instance
const supabase: SupabaseClient = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

// Base API URL for Supabase Edge Functions
const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-4ca6791f`;

// Generic API response interface
interface ApiResponse<Data = unknown> {
  success?: boolean;
  error?: string;
  data?: Data;
  [key: string]: unknown;
}

class ApiService {
  // Generic request method
  private async makeRequest<Data = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Data> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: accessToken
            ? `Bearer ${accessToken}`
            : `Bearer ${publicAnonKey}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return (await response.json()) as Data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // 🔐 Authentication
  async register(userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<ApiResponse> {
    return this.makeRequest<ApiResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<{ success: boolean; session: Session | null; user: User | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword(credentials);
      if (error) throw new Error(error.message);

      return { success: true, session: data.session, user: data.user };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user ?? null;
  }

  // 📦 Initialize data
  async initializeData(): Promise<ApiResponse> {
    return this.makeRequest<ApiResponse>('/init-data', { method: 'POST' });
  }

  // 📍 Locations
  async getLocations(): Promise<{ locations: unknown[] }> {
    return this.makeRequest<{ locations: unknown[] }>('/locations');
  }

  // 🏪 Shops
  async getShopsByLocation(locationId: string): Promise<{ shops: unknown[] }> {
    return this.makeRequest<{ shops: unknown[] }>(`/shops/${locationId}`);
  }

  // 🛍️ Products
  async getProductsByShop(shopId: string): Promise<{ products: unknown[] }> {
    return this.makeRequest<{ products: unknown[] }>(`/products/${shopId}`);
  }

  // 🧾 Orders
  async createOrder(orderData: Record<string, unknown>): Promise<{ success: boolean; order: unknown }> {
    return this.makeRequest<{ success: boolean; order: unknown }>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getUserOrders(): Promise<{ orders: unknown[] }> {
    return this.makeRequest<{ orders: unknown[] }>('/orders');
  }

  // 👤 Profile
  async getUserProfile(): Promise<{ user: unknown }> {
    return this.makeRequest<{ user: unknown }>('/profile');
  }
}

// ✅ Export a single instance
export const apiService = new ApiService();
