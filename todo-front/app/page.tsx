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
import { Plus, Search, Filter, SortAsc, LayoutGrid, CheckSquare, Sparkles, RefreshCw } from 'lucide-react';

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
    useMock: true,
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
    document.documentElement.setAttribute('data-theme', next);
  };

  // Auth Handlers
  const handleAuthSuccess = (token: string, user: any) => {
    setStoredToken(token);
    setStoredUser(user);
    setAuth({ token, user, isAuthenticated: true });
  };

  const handleLogout = () => {
    setStoredToken(null);
    setStoredUser(null);
    setAuth({ token: null, user: null, isAuthenticated: false });
  };

  // API Config Save Handler
  const handleSaveApiConfig = (newConfig: ApiConfig) => {
    setApiConfig(newConfig);
    saveStoredApiConfig(newConfig);
    loadTodos();
  };

  // Todo CRUD Handlers
  const handleCreateOrUpdateTodo = async (todoData: Partial<Todo>) => {
    if (editingTodo) {
      // Edit mode
      const updated = await apiService.updateTodo(editingTodo.id, todoData);
      setTodos(prev => prev.map(t => (t.id === editingTodo.id ? updated : t)));
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
    const target = todos.find(t => t.id === id);
    if (!target) return;
    const updated = await apiService.updateTodo(id, { completed: !target.completed });
    setTodos(prev => prev.map(t => (t.id === id ? updated : t)));
  };

  const handleDeleteTodo = async (id: string) => {
    if (confirm('정말로 이 할 일을 삭제하시겠습니까?')) {
      await apiService.deleteTodo(id);
      setTodos(prev => prev.filter(t => t.id !== id));
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
        // createdAt
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [todos, searchQuery, statusFilter, priorityFilter, categoryFilter, sortBy]);

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '60px' }}>
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
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        {/* Dashboard View & Todo View common stats header */}
        {currentView !== 'calendar' && <TodoStats todos={todos} />}

        {/* View 1: Dashboard / Todos List View */}
        {currentView !== 'calendar' && (
          <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
            {/* Action Bar: Search, Filters, Add Button */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                marginBottom: '20px',
              }}
            >
              {/* Search Box */}
              <div style={{ position: 'relative', flex: '1 1 260px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="할 일 제목, 설명 검색..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '38px' }}
                />
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
                {/* Status Filter */}
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as FilterStatus)}
                  style={{ width: 'auto', padding: '8px 12px', fontSize: '0.85rem' }}
                >
                  <option value="all">전체 상태</option>
                  <option value="active">진행 중</option>
                  <option value="completed">완료됨</option>
                </select>

                {/* Priority Filter */}
                <select
                  className="form-select"
                  value={priorityFilter}
                  onChange={e => setPriorityFilter(e.target.value as FilterPriority)}
                  style={{ width: 'auto', padding: '8px 12px', fontSize: '0.85rem' }}
                >
                  <option value="all">전체 우선순위</option>
                  <option value="urgent">🔥 긴급</option>
                  <option value="high">⚡ 높음</option>
                  <option value="medium">🔷 보통</option>
                  <option value="low">🌱 낮음</option>
                </select>

                {/* Category Filter */}
                <select
                  className="form-select"
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value as FilterCategory)}
                  style={{ width: 'auto', padding: '8px 12px', fontSize: '0.85rem' }}
                >
                  <option value="all">전체 카테고리</option>
                  <option value="work">💼 업무</option>
                  <option value="personal">👤 개인</option>
                  <option value="study">📚 공부</option>
                  <option value="health">💪 건강</option>
                  <option value="finance">💰 금융</option>
                  <option value="other">📌 기타</option>
                </select>

                {/* Sort Option */}
                <select
                  className="form-select"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  style={{ width: 'auto', padding: '8px 12px', fontSize: '0.85rem' }}
                >
                  <option value="dueDate">📅 마감일순 정렬</option>
                  <option value="priority">🔥 우선순위순 정렬</option>
                  <option value="createdAt">🕒 최신 등록순 정렬</option>
                </select>

                {/* Refresh Button */}
                <button onClick={loadTodos} className="btn-icon" title="새로고침">
                  <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>

                {/* Create Todo Button */}
                <button onClick={() => handleOpenAddModal()} className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.88rem' }}>
                  <Plus size={18} />
                  <span>할 일 추가</span>
                </button>
              </div>
            </div>

            {/* Todo Items Grid */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                <RefreshCw size={32} className="animate-spin" style={{ marginBottom: '12px' }} />
                <p>일정을 불러오는 중입니다...</p>
              </div>
            ) : filteredTodos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                <CheckSquare size={48} style={{ marginBottom: '12px', opacity: 0.4 }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  해당하는 할 일이 없습니다.
                </h3>
                <p style={{ fontSize: '0.88rem' }}>
                  검색 조건이나 필터를 변경하거나 새로운 할 일을 추가해 보세요!
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
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

        {/* View 2: Calendar View */}
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
