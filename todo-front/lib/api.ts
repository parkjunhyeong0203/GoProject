import { Todo, ApiConfig, Priority, Category } from './types';
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

/**
 * 백엔드 Go/GORM 응답 객체를 프론트엔드 Todo 형식으로 정규화하는 헬퍼 함수
 * - 백엔드의 gorm.Model ID(대문자 'ID') 또는 소문자 'id'를 안전하게 문자열로 변환
 * - 백엔드에서 { message, data: todo } 형태로 넘겨주더라도 안전하게 언패킹
 */
export const normalizeTodo = (raw: any): Todo => {
  if (!raw) {
    return {
      id: Date.now().toString(),
      title: '',
      completed: false,
      priority: 'medium',
      category: 'work',
      dueDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  // 백엔드 model.go에서 gorm.Model의 ID는 대문자 'ID'로 직렬화될 수 있고,
  // UserID가 json:"id"로 나갈 수도 있으므로 실제 Todo의 PK인 ID(대문자)를 우선 확인
  const rawId = raw.ID !== undefined && raw.ID !== null
    ? raw.ID
    : raw.id !== undefined && raw.id !== null
    ? raw.id
    : Date.now();

  return {
    id: String(rawId),
    title: raw.title || '',
    description: raw.description || '',
    completed: Boolean(raw.completed),
    priority: (raw.priority as Priority) || 'medium',
    category: (raw.category as Category) || 'work',
    dueDate: raw.dueDate || raw.due_date || new Date().toISOString().split('T')[0],
    createdAt: raw.createdAt || raw.CreatedAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || raw.UpdatedAt || new Date().toISOString(),
  };
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
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      
      // 백엔드는 { count: len(todos), data: todos } 또는 [ ... ] 로 응답
      const list: any[] = Array.isArray(data)
        ? data
        : Array.isArray(data.data)
        ? data.data
        : Array.isArray(data.todos)
        ? data.todos
        : [];
      return list.map(normalizeTodo);
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
      // 백엔드 TodoInfo struct 필드에 맞춰 전송
      const payload = {
        title: todo.title,
        description: todo.description || '',
        priority: todo.priority || 'medium',
        completed: todo.completed ?? false,
        category: todo.category || 'work',
        dueDate: todo.dueDate || new Date().toISOString().split('T')[0],
      };

      const res = await fetchWithAuth(`${config.baseUrl}${config.todosEndpoint}`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || errJson.message || 'Failed to create todo on backend');
      }
      const data = await res.json();
      // 백엔드는 { message: "Todo save success", data: todo } 형태로 응답
      const rawTodo = data.data || data.todo || data;
      return normalizeTodo(rawTodo);
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
    const index = current.findIndex(t => String(t.id) === String(id));

    const updatedItem = {
      ...(index !== -1 ? current[index] : {}),
      ...updates,
      id: String(id),
      updatedAt: new Date().toISOString(),
    } as Todo;

    if (config.useMock) {
      if (index !== -1) {
        current[index] = updatedItem;
        saveStoredTodos(current);
      }
      return updatedItem;
    }

    try {
      // 백엔드 TodoInfo에 맞는 필드만 추출하여 전송
      const payload: Record<string, any> = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.completed !== undefined) payload.completed = updates.completed;
      if (updates.priority !== undefined) payload.priority = updates.priority;
      if (updates.category !== undefined) payload.category = updates.category;
      if (updates.dueDate !== undefined) payload.dueDate = updates.dueDate;

      const res = await fetchWithAuth(`${config.baseUrl}${config.todosEndpoint}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || errJson.message || 'Failed to update todo on backend');
      }
      const data = await res.json();
      // 백엔드는 { message: "Todo update success", data: todo } 형태로 응답
      const rawTodo = data.data || data.todo || data;
      return normalizeTodo(rawTodo);
    } catch (err) {
      console.warn('Backend API failed, updating locally:', err);
      if (index !== -1) {
        current[index] = updatedItem;
        saveStoredTodos(current);
      }
      return updatedItem;
    }
  },

  // Delete Todo
  async deleteTodo(id: string): Promise<boolean> {
    const config = getStoredApiConfig();
    if (config.useMock) {
      const current = getStoredTodos();
      const filtered = current.filter(t => String(t.id) !== String(id));
      saveStoredTodos(filtered);
      return true;
    }

    try {
      const res = await fetchWithAuth(`${config.baseUrl}${config.todosEndpoint}/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || errJson.message || 'Failed to delete todo on backend');
      }
      const current = getStoredTodos();
      saveStoredTodos(current.filter(t => String(t.id) !== String(id)));
      return true;
    } catch (err) {
      console.warn('Backend API failed, deleting locally:', err);
      const current = getStoredTodos();
      saveStoredTodos(current.filter(t => String(t.id) !== String(id)));
      return true;
    }
  },

  // Login
  async login(username: string, password: string): Promise<{ token: string; user: any }> {
    const config = getStoredApiConfig();
    if (config.useMock) {
      // Mock login for frontend testing
      const fakeToken = `mock-jwt-token-${Date.now()}-${btoa(username)}`;
      const fakeUser = { id: '1', username, email: `${username}@example.com` };
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
        throw new Error(errorData.error || errorData.message || '로그인 실패');
      }
      const data = await res.json();
      return {
        token: data.token || data.accessToken,
        user: {
          id: String(data.user?.id || '1'),
          username: data.user?.username || data.user?.User_name || username,
          email: data.user?.email || `${username}@example.com`,
        },
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
      const fakeUser = { id: '1', username, email };
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
        throw new Error(errorData.error || errorData.message || '회원가입 실패');
      }
      const data = await res.json();
      return {
        token: data.token || data.accessToken,
        user: {
          id: String(data.user?.id || '1'),
          username: data.user?.username || data.user?.User_name || username,
          email: data.user?.email || email,
        },
      };
    } catch (err: any) {
      throw new Error(err.message || '회원가입 중 오류가 발생했습니다.');
    }
  },
};
