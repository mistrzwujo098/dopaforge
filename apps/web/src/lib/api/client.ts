import { createSupabaseBrowser } from '../supabase-browser';
import type { Database } from '@dopaforge/db';

type Tables = Database['public']['Tables'];

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

class ApiClient {
  private supabase = createSupabaseBrowser();

  // Error handler
  private handleError(error: any): ApiError {
    if (error.message) {
      return {
        message: error.message,
        code: error.code || 'UNKNOWN_ERROR',
        status: error.status || 500,
      };
    }
    return {
      message: 'Wystąpił nieoczekiwany błąd',
      code: 'UNKNOWN_ERROR',
      status: 500,
    };
  }

  // Tasks API
  async getTasks(userId: string): Promise<ApiResponse<Tables['micro_tasks']['Row'][]>> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data, error } = await this.supabase
        .from('micro_tasks')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', today.toISOString())
        .order('display_order', { ascending: true });

      if (error) throw error;
      return { data: data || [] };
    } catch (error) {
      return { error: this.handleError(error) };
    }
  }

  async createTask(task: Tables['micro_tasks']['Insert']): Promise<ApiResponse<Tables['micro_tasks']['Row']>> {
    try {
      const { data, error } = await this.supabase
        .from('micro_tasks')
        .insert(task)
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (error) {
      return { error: this.handleError(error) };
    }
  }

  async updateTask(id: string, update: Tables['micro_tasks']['Update']): Promise<ApiResponse<Tables['micro_tasks']['Row']>> {
    try {
      const { data, error } = await this.supabase
        .from('micro_tasks')
        .update(update)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (error) {
      return { error: this.handleError(error) };
    }
  }

  async deleteTask(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await this.supabase
        .from('micro_tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { data: undefined };
    } catch (error) {
      return { error: this.handleError(error) };
    }
  }

  // User Profile API
  async getUserProfile(userId: string): Promise<ApiResponse<Tables['user_profiles']['Row']>> {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return { data: data || null };
    } catch (error) {
      return { error: this.handleError(error) };
    }
  }

  async updateUserProfile(userId: string, update: Tables['user_profiles']['Update']): Promise<ApiResponse<Tables['user_profiles']['Row']>> {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .update(update)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (error) {
      return { error: this.handleError(error) };
    }
  }

  // Rewards API
  async getUserRewards(userId: string): Promise<ApiResponse<Tables['rewards']['Row'][]>> {
    try {
      const { data, error } = await this.supabase
        .from('rewards')
        .select('*')
        .eq('user_id', userId)
        .order('granted_at', { ascending: false });

      if (error) throw error;
      return { data: data || [] };
    } catch (error) {
      return { error: this.handleError(error) };
    }
  }

  // Badges API
  async getUserBadges(userId: string): Promise<ApiResponse<Tables['user_badges']['Row'][]>> {
    try {
      const { data, error } = await this.supabase
        .from('user_badges')
        .select('*, badges(*)')
        .eq('user_id', userId)
        .order('granted_at', { ascending: false });

      if (error) throw error;
      return { data: data || [] };
    } catch (error) {
      return { error: this.handleError(error) };
    }
  }

  // Lootbox API
  async spinLootbox(userId: string): Promise<ApiResponse<{ type: string; payload: any }>> {
    try {
      // This would call a server function or API endpoint
      // For now, return a mock response
      const rewards = [
        { type: 'xp', payload: { amount: 50 } },
        { type: 'badge', payload: { code: 'lucky' } },
        { type: 'powerup', payload: { type: '2x_xp', duration: 3600 } },
      ];
      
      const reward = rewards[Math.floor(Math.random() * rewards.length)];
      return { data: reward };
    } catch (error) {
      return { error: this.handleError(error) };
    }
  }
}

// Singleton instance
export const apiClient = new ApiClient();

// Hooks for React components
export function useApiClient() {
  return apiClient;
}