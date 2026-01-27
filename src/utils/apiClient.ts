// Lấy API URL từ runtime, cho phép thay đổi mà không cần rebuild
const getApiBaseUrl = (): string => {
  // 1. Nếu có env variable từ build
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // 2. Nếu server cùng domain, dùng /api relative path
  if (typeof window !== "undefined") {
    // Relative API path (same domain, same protocol)
    return "/api";
  }
  
  // 3. Fallback
  return "http://localhost:5000/api";
};

const API_BASE_URL = getApiBaseUrl();
const AUTH_TOKEN_KEY = "auth_token";

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

  console.log("📡 API Request:", { url, token: !!token, headers });

  const response = await fetch(url, {
    ...config,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("❌ API Error:", { status: response.status, message: errorData.message });
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  return response.json() as T;
}

export { apiCall };
