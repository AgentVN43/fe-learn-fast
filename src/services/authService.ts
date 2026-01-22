import type { AuthResponse, User } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const AUTH_TOKEN_KEY = "auth_token";
const AUTH_USER_KEY = "auth_user";

// ============= API Call Helper =============
async function apiCall<T>(
  endpoint: string,
  config: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(config.headers
      ? Object.fromEntries(
          Array.isArray(config.headers)
            ? config.headers
            : Object.entries(config.headers as Record<string, string>)
        )
      : {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  console.log("📡 Auth API Request:", { url, token: !!token });

  const response = await fetch(url, {
    ...config,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("❌ Auth API Error:", {
      status: response.status,
      message: errorData.message,
    });
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  return response.json() as T;
}

// ============= Local Storage Helpers =============
const storage = {
  saveAuth: (token: string, user: User) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  },

  getToken: (): string | null => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  getUser: (): User | null => {
    const user = localStorage.getItem(AUTH_USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
  },

  logout: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  },

  clear: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  },
};

// ============= Auth Service =============
export const authService = {
  // Login
  login: async (
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    return apiCall<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  // Register
  register: async (
    email: string,
    password: string,
    name: string,
    role: "Admin" | "Assistant"
  ): Promise<AuthResponse> => {
    return apiCall<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name, role }),
    });
  },

  // Get current user
  me: async (): Promise<{ success: boolean; user: User }> => {
    return apiCall("/auth/me", { method: "GET" });
  },

  // Logout
  logout: () => {
    storage.logout();
  },

  // Save auth (after login/register)
  saveAuth: storage.saveAuth,

  // Get stored token
  getToken: storage.getToken,

  // Get stored user
  getUser: storage.getUser,

  // Check if authenticated
  isAuthenticated: storage.isAuthenticated,

  // Clear all auth data
  clear: storage.clear,
};

// ============= User Service =============
export const userService = {
  // Get all users (Admin only)
  getAllUsers: async (page = 1, limit = 20, isActive?: boolean) => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    if (isActive !== undefined) {
      params.append("isActive", isActive.toString());
    }
    return apiCall(`/user?${params.toString()}`, { method: "GET" });
  },

  // Get user by ID
  getUserById: async (id: string): Promise<{ success: boolean; data: User }> => {
    return apiCall(`/user/${id}`, { method: "GET" });
  },

  // Create user (Admin only)
  createUser: async (
    email: string,
    password: string,
    name: string,
    role: "Admin" | "Assistant"
  ) => {
    return apiCall("/user", {
      method: "POST",
      body: JSON.stringify({ email, password, name, role }),
    });
  },

  // Update user
  updateUser: async (
    id: string,
    updates: Partial<User>
  ): Promise<{ success: boolean; data: User }> => {
    return apiCall(`/user/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  // Deactivate user
  deactivateUser: async (id: string) => {
    return apiCall(`/user/${id}/deactivate`, { method: "POST" });
  },

  // Reactivate user (Admin only)
  reactivateUser: async (id: string) => {
    return apiCall(`/user/${id}/reactivate`, { method: "POST" });
  },

  // Delete user (Admin only)
  deleteUser: async (id: string) => {
    return apiCall(`/user/${id}`, { method: "DELETE" });
  },
};
