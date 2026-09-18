'use client';

import React from 'react';
import { LayoutDashboard, CheckSquare, Calendar, Sliders, LogIn, LogOut, User, Server, Moon, Sun, Sparkles } from 'lucide-react';
import { ViewMode, ApiConfig, AuthState } from '../lib/types';

interface NavbarProps {
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;
  apiConfig: ApiConfig;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  auth: AuthState;
  onLogout: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  apiConfig,
  onOpenSettings,
  onOpenAuth,
  auth,
  onLogout,
  theme,
  toggleTheme,
}) => {
  return (
    <header className="glass-panel" style={{
      position: 'sticky',
      top: '12px',
      zIndex: 40,
      margin: '0 24px 24px 24px',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      {/* Brand & Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'var(--accent-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-glow)'
        }}>
          <Sparkles size={22} color="#ffffff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px' }} className="text-gradient">
            Project TDL
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            JWT REST API Todo & Calendar
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '14px' }}>
        <button
          onClick={() => setCurrentView('dashboard')}
          className={currentView === 'dashboard' ? 'btn-primary' : 'btn-secondary'}
          style={{ border: 'none', padding: '8px 16px', borderRadius: '10px', fontSize: '0.88rem' }}
        >
          <LayoutDashboard size={17} />
          <span>대시보드</span>
        </button>
        <button
          onClick={() => setCurrentView('todos')}
          className={currentView === 'todos' ? 'btn-primary' : 'btn-secondary'}
          style={{ border: 'none', padding: '8px 16px', borderRadius: '10px', fontSize: '0.88rem' }}
        >
          <CheckSquare size={17} />
          <span>할 일 (Todos)</span>
        </button>
        <button
          onClick={() => setCurrentView('calendar')}
          className={currentView === 'calendar' ? 'btn-primary' : 'btn-secondary'}
          style={{ border: 'none', padding: '8px 16px', borderRadius: '10px', fontSize: '0.88rem' }}
        >
          <Calendar size={17} />
          <span>캘린더 (Calendar)</span>
        </button>
      </nav>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* API Status Badge */}
        <button
          onClick={onOpenSettings}
          title="백엔드 API 및 통신 설정"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: '20px',
            background: apiConfig.useMock ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            border: `1px solid ${apiConfig.useMock ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
            color: apiConfig.useMock ? '#fbbf24' : '#34d399',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Server size={14} />
          <span>{apiConfig.useMock ? 'Mock API 모드' : 'Go Backend Live'}</span>
          <Sliders size={13} style={{ marginLeft: '2px', opacity: 0.8 }} />
        </button>

        {/* Dark/Light Theme Switch */}
        <button onClick={toggleTheme} className="btn-icon" title="테마 변경">
          {theme === 'dark' ? <Sun size={20} color="#fbbf24" /> : <Moon size={20} color="#6366f1" />}
        </button>

        {/* User Auth */}
        {auth.isAuthenticated && auth.user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '20px',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}>
              <User size={15} color="var(--accent-primary)" />
              <span>{auth.user.username}</span>
            </div>
            <button onClick={onLogout} className="btn-icon" title="로그아웃">
              <LogOut size={18} color="var(--accent-rose)" />
            </button>
          </div>
        ) : (
          <button onClick={onOpenAuth} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            <LogIn size={16} />
            <span>JWT 로그인</span>
          </button>
        )}
      </div>
    </header>
  );
};
