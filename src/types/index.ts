// Auth Types
export type UserRole = "Admin" | "Assistant";

export interface User {
  id?: string;
  _id?: string;
  email: string;
  name: string;
  role: UserRole;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
  token: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

// StudySet Types
export interface Flashcard {
  id?: string;
  _id?: string;
  term: string;
  definition: string;
  image?: string | null;
  difficulty?: "easy" | "medium" | "hard";
  position?: number;
}

export interface StudySet {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  userId: string;
  flashcardCount: number;
  likes: number;
  isPublic: boolean;
  tags: string[];
  studyCount: number;
  isArchived: boolean;
  archivedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  flashcards?: Flashcard[];
  user?: {
    name: string;
    email: string;
    _id?: string;
  };
}

export interface StudySetFormData {
  title: string;
  description: string;
  isPublic: boolean;
  tags: string[];
  flashcards?: Flashcard[];
}

export interface StudySetsResponse {
  data: StudySet[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Movie & Actress Types
export interface Movie {
  _id?: string;
  id?: string;
  title: string;
  poster: string;
  url: string;
  actressIds: string[];
}

export interface Actress {
  _id: string;
  name: string;
  avatar: string;
  movieCount?: number;
  movies?: Movie[];
}
