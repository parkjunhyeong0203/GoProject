import { Todo, ApiConfig } from './types';

const INITIAL_TODOS: Todo[] = [
  {
    id: '1',
    title: 'Go / Gin 백엔드 JWT 인증 API 구현하기',
    description: '로그인 및 회원가입 엔드포인트와 JWT 미들웨어 검증 작성 완료하기',
    completed: false,
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '18:00',
    priority: 'urgent',
    category: 'study',
    starred: true,
    tags: ['Go', 'Backend', 'JWT'],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: '프론트엔드 UI 대시보드 및 캘린더 연동',
    description: 'React/Next.js 기반 고급 테마 할 일 및 일정 캘린더 화면 구성',
    completed: true,
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '14:00',
    priority: 'high',
    category: 'work',
    starred: true,
    tags: ['Next.js', 'UI', 'Frontend'],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: '매일 30분 운동하기',
    description: '유산소 운동 및 조깅 5km',
    completed: false,
    dueDate: new Date(Date.now() + 86400000 * 1).toISOString().split('T')[0],
    dueTime: '07:30',
    priority: 'medium',
    category: 'health',
    starred: false,
    tags: ['Workout', 'Daily'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'REST API 엔드포인트 통신 테스트',
    description: 'Postman 또는 프론트엔드 연동 테스트를 통해 CRUD API 응답 확인',
    completed: false,
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    dueTime: '16:00',
    priority: 'high',
    category: 'study',
    starred: false,
    tags: ['API', 'Testing'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const DEFAULT_API_CONFIG: ApiConfig = {
  baseUrl: 'http://localhost:8080',
  useMock: true, // Default to mock until user connects real backend
  todosEndpoint: '/todos',
  authLoginEndpoint: '/auth/login',
  authRegisterEndpoint: '/auth/register',
};

export const getStoredTodos = (): Todo[] => {
  if (typeof window === 'undefined') return INITIAL_TODOS;
  const data = localStorage.getItem('project_tdl_todos');
  if (!data) {
    localStorage.setItem('project_tdl_todos', JSON.stringify(INITIAL_TODOS));
    return INITIAL_TODOS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse stored todos:', e);
    return INITIAL_TODOS;
  }
};

export const saveStoredTodos = (todos: Todo[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('project_tdl_todos', JSON.stringify(todos));
};

export const getStoredApiConfig = (): ApiConfig => {
  if (typeof window === 'undefined') return DEFAULT_API_CONFIG;
  const data = localStorage.getItem('project_tdl_api_config');
  if (!data) return DEFAULT_API_CONFIG;
  try {
    return { ...DEFAULT_API_CONFIG, ...JSON.parse(data) };
  } catch (e) {
    return DEFAULT_API_CONFIG;
  }
};

export const saveStoredApiConfig = (config: ApiConfig): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('project_tdl_api_config', JSON.stringify(config));
};

export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('project_tdl_jwt_token');
};

export const setStoredToken = (token: string | null): void => {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('project_tdl_jwt_token', token);
  } else {
    localStorage.removeItem('project_tdl_jwt_token');
  }
};

export const getStoredUser = () => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('project_tdl_user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const setStoredUser = (user: any) => {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem('project_tdl_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('project_tdl_user');
  }
};
