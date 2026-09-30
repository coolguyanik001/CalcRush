export interface AuthResponse {
  success: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    isEmailVerified: boolean;
    isGoogleConnected: boolean;
    createdAt: number;
    updatedAt: number;
  };
  token?: string;
  emailStatus?: 'sent' | 'unconfigured_dev_preview';
  verificationCode?: string;
  resetCode?: string;
  message?: string;
  error?: string;
}

export const authService = {
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to create account.' };
      }
      return data;
    } catch {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Invalid credentials.' };
      }
      return data;
    } catch {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
  },

  async verifyEmail(email: string, code: string): Promise<AuthResponse> {
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Verification failed.' };
      }
      return data;
    } catch {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
  },

  async resendCode(email: string): Promise<AuthResponse> {
    try {
      const res = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to resend verification code.' };
      }
      return data;
    } catch {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
  },

  async forgotPassword(email: string): Promise<AuthResponse> {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Password reset request failed.' };
      }
      return data;
    } catch {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
  },

  async resetPassword(email: string, code: string, newPassword: string): Promise<AuthResponse> {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Password reset failed.' };
      }
      return data;
    } catch {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
  },

  async changePassword(token: string, oldPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to change password.' };
      }
      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
  },

  async updateProfile(token: string, name: string): Promise<AuthResponse> {
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to update profile.' };
      }
      return data;
    } catch {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
  },

  async deleteAccount(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to delete account.' };
      }
      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
  },

  async getGoogleConfig(): Promise<{ enabled: boolean; clientId: string | null }> {
    try {
      const res = await fetch('/api/auth/google/config');
      if (!res.ok) return { enabled: false, clientId: null };
      return await res.json();
    } catch {
      return { enabled: false, clientId: null };
    }
  },

  async loginWithGoogle(credential: string): Promise<AuthResponse> {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Google Sign-In failed.' };
      }
      return data;
    } catch {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
  },

  async pullSync(token: string): Promise<{ success: boolean; data?: any; lastSyncedAt?: number; error?: string }> {
    try {
      const res = await fetch('/api/sync/pull', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const err = await res.json();
        return { success: false, error: err.error || 'Failed to pull cloud sync.' };
      }
      const json = await res.json();
      return { success: true, data: json.data, lastSyncedAt: json.lastSyncedAt };
    } catch {
      return { success: false, error: 'Network offline. Keeping local data safe.' };
    }
  },

  async pushSync(token: string, payload: any): Promise<{ success: boolean; data?: any; lastSyncedAt?: number; error?: string }> {
    try {
      const res = await fetch('/api/sync/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data: payload }),
      });
      if (!res.ok) {
        const err = await res.json();
        return { success: false, error: err.error || 'Failed to push cloud sync.' };
      }
      const json = await res.json();
      return { success: true, data: json.data, lastSyncedAt: json.lastSyncedAt };
    } catch {
      return { success: false, error: 'Network offline. Keeping local data safe.' };
    }
  },
};
