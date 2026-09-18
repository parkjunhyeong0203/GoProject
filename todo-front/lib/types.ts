export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type Category = 'work' | 'personal' | 'study' | 'health' | 'finance' | 'other';

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  priority: Priority;
  category: Category;
  starred: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface ApiConfig {
  baseUrl: string;
  useMock: boolean;
  todosEndpoint: string; // e.g. '/todos' or '/students'
  authLoginEndpoint: string; // e.g. '/auth/login'
  authRegisterEndpoint: string; // e.g. '/auth/register'
}

export type ViewMode = 'dashboard' | 'todos' | 'calendar' | 'analytics';

export type FilterPriority = 'all' | Priority;
export type FilterCategory = 'all' | Category;
export type FilterStatus = 'all' | 'active' | 'completed' | 'starred';
