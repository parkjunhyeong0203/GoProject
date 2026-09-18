import { Todo, ApiConfig } from './types';
import { getStoredTodos, saveStoredTodos, getStoredApiConfig, getStoredToken } from './storage';

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && options.method !== 'GET') {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, { ...options, headers });
  return response;
};

export const apiService = {
  // Check backend health/ping
  async checkBackendHealth(baseUrl: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${baseUrl}/health`, { signal: controller.signal }).catch(() => null);
      clearTimeout(timeoutId);
      return res !== null && (res.status === 200 || res.status === 404);
    } catch {
      return false;
    }
  },

  // Fetch Todos
  async getTodos(): Promise<Todo[]> {
    const config = getStoredApiConfig();
    if (config.useMock) {
      return getStoredTodos();
    }

    try {
      const res = await fetchWithAuth(`${config.baseUrl}${config.todosEndpoint}`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      // If backend returns data array directly or wrapped in { data: [...] }
      const todos: Todo[] = Array.isArray(data) ? data : (data.todos || data.data || []);
      return todos;
    } catch (err) {
      console.warn('Backend API request failed, falling back to local storage mock data:', err);
      return getStoredTodos();
    }
  },

  // Add Todo
  async createTodo(todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): Promise<Todo> {
    const config = getStoredApiConfig();
    const newTodo: Todo = {
      ...todo,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (config.useMock) {
      const current = getStoredTodos();
      const updated = [newTodo, ...current];
      saveStoredTodos(updated);
      return newTodo;
    }

    try {
      const res = await fetchWithAuth(`${config.baseUrl}${config.todosEndpoint}`, {
        method: 'POST',
        body: JSON.stringify(newTodo),
      });
      if (!res.ok) throw new Error('Failed to create todo on backend');
      const data = await res.json();
      return data.todo || data || newTodo;
    } catch (err) {
      console.warn('Backend API failed, saving locally:', err);
      const current = getStoredTodos();
      const updated = [newTodo, ...current];
      saveStoredTodos(updated);
      return newTodo;
    }
  },

  // Update Todo
  async updateTodo(id: string, updates: Partial<Todo>): Promise<Todo> {
    const config = getStoredApiConfig();
    const current = getStoredTodos();
    const index = current.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Todo not found');

    const updatedItem = {
      ...current[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (config.useMock) {
      current[index] = updatedItem;
      saveStoredTodos(current);
      return updatedItem;
    }

    try {
      const res = await fetchWithAuth(`${config.baseUrl}${config.todosEndpoint}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedItem),
      });
      if (!res.ok) throw new Error('Failed to update todo on backend');
      const data = await res.json();
      return data.todo || data || updatedItem;
    } catch (err) {
      console.warn('Backend API failed, updating locally:', err);
      current[index] = updatedItem;
      saveStoredTodos(current);
      return updatedItem;
    }
  },

  // Delete Todo
  async deleteTodo(id: string): Promise<boolean> {
    const config = getStoredApiConfig();
    if (config.useMock) {
      const current = getStoredTodos();
      const filtered = current.filter(t => t.id !== id);
      saveStoredTodos(filtered);
      return true;
    }

    try {
      const res = await fetchWithAuth(`${config.baseUrl}${config.todosEndpoint}/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete todo on backend');
      const current = getStoredTodos();
      saveStoredTodos(current.filter(t => t.id !== id));
      return true;
    } catch (err) {
      console.warn('Backend API failed, deleting locally:', err);
      const current = getStoredTodos();
      saveStoredTodos(current.filter(t => t.id !== id));
      return true;
    }
  },

  // Login
  async login(username: string, password: string): Promise<{ token: string; user: any }> {
    const config = getStoredApiConfig();
    if (config.useMock) {
      // Mock login for frontend testing
      const fakeToken = `mock-jwt-token-${Date.now()}-${btoa(username)}`;
      const fakeUser = { id: 'u1', username, email: `${username}@example.com` };
      return { token: fakeToken, user: fakeUser };
    }

    try {
      const res = await fetch(`${config.baseUrl}${config.authLoginEndpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || '로그인 실패');
      }
      const data = await res.json();
      return {
        token: data.token || data.accessToken,
        user: data.user || { id: '1', username, email: `${username}@example.com` },
      };
    } catch (err: any) {
      throw new Error(err.message || '로그인 중 오류가 발생했습니다.');
    }
  },

  // Register
  async register(username: string, email: string, password: string): Promise<{ token: string; user: any }> {
    const config = getStoredApiConfig();
    if (config.useMock) {
      const fakeToken = `mock-jwt-token-${Date.now()}-${btoa(username)}`;
      const fakeUser = { id: 'u1', username, email };
      return { token: fakeToken, user: fakeUser };
    }

    try {
      const res = await fetch(`${config.baseUrl}${config.authRegisterEndpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || '회원가입 실패');
      }
      const data = await res.json();
      return {
        token: data.token || data.accessToken,
        user: data.user || { id: '1', username, email },
      };
    } catch (err: any) {
      throw new Error(err.message || '회원가입 중 오류가 발생했습니다.');
    }
  },
};
