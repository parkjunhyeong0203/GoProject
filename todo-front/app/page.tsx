'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../component/Navbar';
import { TodoCard } from '../component/TodoCard';
import { TodoModal } from '../component/TodoModal';
import { TodoStats } from '../component/TodoStats';
import { CalendarView } from '../component/CalendarView';
import { AuthModal } from '../component/AuthModal';
import { ApiSettingsModal } from '../component/ApiSettingsModal';
import {
  Todo,
  ViewMode,
  FilterPriority,
  FilterCategory,
  FilterStatus,
  ApiConfig,
  AuthState,
} from '../lib/types';
import { apiService } from '../lib/api';
import {
  getStoredApiConfig,
  saveStoredApiConfig,
  getStoredToken,
  setStoredToken,
  getStoredUser,
  setStoredUser,
} from '../lib/storage';
import { Plus, Search, X, RefreshCw, CheckCircle2, Inbox } from 'lucide-react';

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [loading, setLoading] = useState<boolean>(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<FilterPriority>('all');
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'dueDate' | 'priority'>('dueDate');

  // Modals States
  const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [auth, setAuth] = useState<AuthState>({
    token: null,
    user: null,
    isAuthenticated: false,
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiConfig, setApiConfig] = useState<ApiConfig>({
    baseUrl: 'http://localhost:8080',
    useMock: false,
    todosEndpoint: '/todos',
    authLoginEndpoint: '/auth/login',
    authRegisterEndpoint: '/auth/register',
  });

  // Initial Load
  useEffect(() => {
    const config = getStoredApiConfig();
    setApiConfig(config);

    const token = getStoredToken();
    const user = getStoredUser();
    if (token && user) {
      setAuth({ token, user, isAuthenticated: true });
    }

    // Check system preference for theme or saved theme
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }

    loadTodos();
  }, []);

  const loadTodos = async () => {
    setLoading(true);
    try {
      const data = await apiService.getTodos();
      setTodos(data);
    } catch (e) {
      console.error('Failed to load todos:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  // Auth Handlers
  const handleAuthSuccess = (token: string, user: any) => {
    setStoredToken(token);
    setStoredUser(user);
    setAuth({ token, user, isAuthenticated: true });
    setTimeout(() => {
      loadTodos();
    }, 100);
  };

  const handleLogout = () => {
    setStoredToken(null);
    setStoredUser(null);
    setAuth({ token: null, user: null, isAuthenticated: false });
    setTodos([]);
  };

  // API Config Save Handler
  const handleSaveApiConfig = (newConfig: ApiConfig) => {
    setApiConfig(newConfig);
    saveStoredApiConfig(newConfig);
    loadTodos();
  };

  // Todo CRUD Handlers
  const handleCreateOrUpdateTodo = async (todoData: Partial<Todo>) => {
    if (!apiConfig.useMock && !auth.isAuthenticated) {
      alert('백엔드와 통신하려면 먼저 로그인을 해주세요.');
      setIsAuthModalOpen(true);
      return;
    }

    if (editingTodo) {
      // Edit mode
      const updated = await apiService.updateTodo(editingTodo.id, todoData);
      setTodos(prev => prev.map(t => (String(t.id) === String(editingTodo.id) ? updated : t)));
    } else {
      // Create mode
      const created = await apiService.createTodo({
        title: todoData.title || '',
        description: todoData.description || '',
        priority: todoData.priority || 'medium',
        category: todoData.category || 'work',
        dueDate: todoData.dueDate || new Date().toISOString().split('T')[0],
        completed: false,
      });
      setTodos(prev => [created, ...prev]);
    }
  };

  const handleToggleComplete = async (id: string) => {
    if (!apiConfig.useMock && !auth.isAuthenticated) {
      alert('백엔드와 통신하려면 먼저 로그인을 해주세요.');
      setIsAuthModalOpen(true);
      return;
    }
    const target = todos.find(t => String(t.id) === String(id));
    if (!target) return;
    const updated = await apiService.updateTodo(id, { completed: !target.completed });
    setTodos(prev => prev.map(t => (String(t.id) === String(id) ? updated : t)));
  };

  const handleDeleteTodo = async (id: string) => {
    if (!apiConfig.useMock && !auth.isAuthenticated) {
      alert('백엔드와 통신하려면 먼저 로그인을 해주세요.');
      setIsAuthModalOpen(true);
      return;
    }
    if (confirm('이 할 일을 삭제하시겠습니까?')) {
      await apiService.deleteTodo(id);
      setTodos(prev => prev.filter(t => String(t.id) !== String(id)));
    }
  };

  const handleOpenAddModal = (initialDate?: string) => {
    setEditingTodo(initialDate ? ({ dueDate: initialDate } as Todo) : null);
    setIsTodoModalOpen(true);
  };

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setIsTodoModalOpen(true);
  };

  // Filter & Search & Sort Logic
  const filteredTodos = useMemo(() => {
    return todos
      .filter(todo => {
        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = todo.title.toLowerCase().includes(q);
          const matchDesc = todo.description?.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc) return false;
        }

        // Status Filter
        if (statusFilter === 'active' && todo.completed) return false;
        if (statusFilter === 'completed' && !todo.completed) return false;

        // Priority Filter
        if (priorityFilter !== 'all' && todo.priority !== priorityFilter) return false;

        // Category Filter
        if (categoryFilter !== 'all' && todo.category !== categoryFilter) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'dueDate') {
          return new Date(a.dueDate || '9999').getTime() - new Date(b.dueDate || '9999').getTime();
        }
        if (sortBy === 'priority') {
          const pOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
          return pOrder[a.priority] - pOrder[b.priority];
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [todos, searchQuery, statusFilter, priorityFilter, categoryFilter, sortBy]);

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '80px' }}>
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        apiConfig={apiConfig}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        auth={auth}
        onLogout={handleLogout}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Main Container */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        {/* Dashboard View & Todo View common stats header */}
        {currentView === 'dashboard' && <TodoStats todos={todos} />}

        {/* View 1 & 2: Dashboard / Todos List View */}
        {currentView !== 'calendar' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Clean Action & Filter Toolbar */}
            <div
              className="card"
              style={{
                padding: '12px 16px',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              {/* Left: Search input */}
              <div style={{ position: 'relative', width: '280px' }}>
                <Search
                  size={14}
                  style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="제목이나 설명 검색..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '32px', paddingRight: searchQuery ? '30px' : '10px' }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '9px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Center / Right: Filters & Action Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                {/* Status Segmented Buttons */}
                <div className="segment-group" style={{ height: '34px', alignItems: 'center' }}>
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`segment-item ${statusFilter === 'all' ? 'active' : ''}`}
                    style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                  >
                    전체
                  </button>
                  <button
                    onClick={() => setStatusFilter('active')}
                    className={`segment-item ${statusFilter === 'active' ? 'active' : ''}`}
                    style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                  >
                    진행 중
                  </button>
                  <button
                    onClick={() => setStatusFilter('completed')}
                    className={`segment-item ${statusFilter === 'completed' ? 'active' : ''}`}
                    style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                  >
                    완료됨
                  </button>
                </div>

                {/* Priority Filter */}
                <select
                  className="form-select"
                  value={priorityFilter}
                  onChange={e => setPriorityFilter(e.target.value as FilterPriority)}
                  style={{ height: '34px', padding: '4px 10px', fontSize: '0.8rem' }}
                >
                  <option value="all">우선순위: 전체</option>
                  <option value="urgent">긴급</option>
                  <option value="high">높음</option>
                  <option value="medium">보통</option>
                  <option value="low">낮음</option>
                </select>

                {/* Category Filter */}
                <select
                  className="form-select"
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value as FilterCategory)}
                  style={{ height: '34px', padding: '4px 10px', fontSize: '0.8rem' }}
                >
                  <option value="all">카테고리: 전체</option>
                  <option value="work">업무</option>
                  <option value="personal">개인</option>
                  <option value="study">공부</option>
                  <option value="health">건강</option>
                  <option value="finance">금융</option>
                  <option value="other">기타</option>
                </select>

                {/* Sort Option */}
                <select
                  className="form-select"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  style={{ height: '34px', padding: '4px 10px', fontSize: '0.8rem' }}
                >
                  <option value="dueDate">정렬: 마감일순</option>
                  <option value="priority">정렬: 우선순위순</option>
                  <option value="createdAt">정렬: 등록순</option>
                </select>

                {/* Refresh */}
                <button
                  onClick={loadTodos}
                  className="btn-icon"
                  title="새로고침"
                  style={{ height: '34px', width: '34px' }}
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>

                {/* Add Todo Button */}
                <button
                  onClick={() => handleOpenAddModal()}
                  className="btn-primary"
                  style={{ height: '34px', padding: '0 12px' }}
                >
                  <Plus size={15} />
                  <span>할 일 추가</span>
                </button>
              </div>
            </div>

            {/* Todo Items Grid */}
            {loading ? (
              <div
                className="card"
                style={{
                  textAlign: 'center',
                  padding: '50px 0',
                  color: 'var(--text-muted)',
                }}
              >
                <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px auto' }} />
                <p style={{ fontSize: '0.85rem' }}>목록을 불러오는 중...</p>
              </div>
            ) : filteredTodos.length === 0 ? (
              <div
                className="card"
                style={{
                  textAlign: 'center',
                  padding: '56px 20px',
                  color: 'var(--text-muted)',
                }}
              >
                <Inbox size={36} style={{ margin: '0 auto 12px auto', opacity: 0.3 }} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  등록된 할 일이 없습니다
                </h3>
                <p style={{ fontSize: '0.825rem', marginBottom: '16px' }}>
                  {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all'
                    ? '검색 조건과 일치하는 항목이 없습니다.'
                    : '새로운 할 일을 추가하고 생산성을 높여보세요.'}
                </p>
                <button onClick={() => handleOpenAddModal()} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
                  <Plus size={13} />
                  <span>할 일 만들기</span>
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '12px',
                }}
              >
                {filteredTodos.map(todo => (
                  <TodoCard
                    key={todo.id}
                    todo={todo}
                    onToggleComplete={handleToggleComplete}
                    onEdit={handleEditTodo}
                    onDelete={handleDeleteTodo}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* View 3: Calendar View */}
        {currentView === 'calendar' && (
          <CalendarView
            todos={todos}
            onSelectDate={dateStr => console.log('Selected date:', dateStr)}
            onAddTodoForDate={dateStr => handleOpenAddModal(dateStr)}
            onToggleComplete={handleToggleComplete}
          />
        )}
      </main>

      {/* Modals */}
      <TodoModal
        isOpen={isTodoModalOpen}
        onClose={() => setIsTodoModalOpen(false)}
        onSave={handleCreateOrUpdateTodo}
        initialData={editingTodo}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <ApiSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={apiConfig}
        onSaveConfig={handleSaveApiConfig}
      />
    </div>
  );
}
