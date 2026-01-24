import type { Actress, Movie } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Helper: xử lý lỗi và parse JSON
async function api<T>(endpoint: string, config: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...config.headers,
    },
    ...config,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json() as T;
}

// Export các hàm API
export const getMovies = () => api<Movie[]>("/movies");
export const getMoviesById = (id: string) => api<Movie>(`/movies/${id}`);

export const getActresses = () => api<Actress[]>("/actresses");
export const getActressById = (id: string) => api<Actress>(`/actresses/${id}`);
export const voteActress = (id: string) =>
  api<void>(`/actresses/${id}/vote`, { method: "POST" });
export const importMovies = (data: Movie[]) =>
  api<void>("/movies/import", { method: "POST", body: JSON.stringify(data) });
export const importActresses = (data: Actress[]) =>
  api<void>("/actresses/import", {
    method: "POST",
    body: JSON.stringify(data),
  });
