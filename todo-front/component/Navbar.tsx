'use client';

import React from 'react';
import {
  CheckSquare,
  LayoutDashboard,
  Calendar,
  Sliders,
  LogIn,
  LogOut,
  Moon,
  Sun,
  Server,
  Layers,
} from 'lucide-react';
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
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-default)',
        padding: '0 24px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px',
      }}
    >
      {/* Brand & Workspace Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--primary)',
            color: 'var(--text-on-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <CheckSquare size={16} strokeWidth={2.5} />
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>
            Project TDL
          </span>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 500,
              padding: '1px 6px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
            }}
          >
            v1.0
          </span>
        </div>
      </div>

      {/* Navigation Segmented Control */}
      <nav className="segment-group">
        <button
          onClick={() => setCurrentView('dashboard')}
          className={`segment-item ${currentView === 'dashboard' ? 'active' : ''}`}
        >
          <LayoutDashboard size={14} />
          <span>대시보드</span>
        </button>
        <button
          onClick={() => setCurrentView('todos')}
          className={`segment-item ${currentView === 'todos' ? 'active' : ''}`}
        >
          <Layers size={14} />
          <span>목록 보기</span>
        </button>
        <button
          onClick={() => setCurrentView('calendar')}
          className={`segment-item ${currentView === 'calendar' ? 'active' : ''}`}
        >
          <Calendar size={14} />
          <span>캘린더</span>
        </button>
      </nav>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Backend Status Chip */}
        <button
          onClick={onOpenSettings}
          title="백엔드 API 연결 설정 열기"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 10px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: apiConfig.useMock ? 'var(--accent-warning-subtle)' : 'var(--accent-success-subtle)',
            border: `1px solid ${apiConfig.useMock ? 'rgba(245, 158, 11, 0.25)' : 'rgba(16, 185, 129, 0.25)'}`,
            color: apiConfig.useMock ? 'var(--accent-warning)' : 'var(--accent-success)',
            fontSize: '0.75rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'var(--transition)',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: apiConfig.useMock ? 'var(--accent-warning)' : 'var(--accent-success)',
            }}
          />
          <span>{apiConfig.useMock ? 'Mock API' : 'Go Backend Live'}</span>
          <Sliders size={11} style={{ opacity: 0.7, marginLeft: '2px' }} />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="btn-icon"
          title={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
          aria-label="테마 전환"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border-default)', margin: '0 4px' }} />

        {/* User Auth Info */}
        {auth.isAuthenticated && auth.user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 8px 4px 4px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                  color: 'var(--text-on-accent)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {auth.user.username.slice(0, 1).toUpperCase()}
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                {auth.user.username}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="btn-icon"
              title="로그아웃"
              style={{ color: 'var(--text-muted)' }}
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <button onClick={onOpenAuth} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            <LogIn size={13} />
            <span>로그인</span>
          </button>
        )}
      </div>
    </header>
  );
};
