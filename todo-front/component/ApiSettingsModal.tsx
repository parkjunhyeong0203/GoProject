'use client';

import React, { useState } from 'react';
import { X, Server, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { ApiConfig } from '../lib/types';
import { apiService } from '../lib/api';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ApiConfig;
  onSaveConfig: (newConfig: ApiConfig) => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [baseUrl, setBaseUrl] = useState(config.baseUrl);
  const [useMock, setUseMock] = useState(config.useMock);
  const [todosEndpoint, setTodosEndpoint] = useState(config.todosEndpoint);
  const [authLoginEndpoint, setAuthLoginEndpoint] = useState(config.authLoginEndpoint);
  const [authRegisterEndpoint, setAuthRegisterEndpoint] = useState(config.authRegisterEndpoint);

  const [testingPing, setTestingPing] = useState(false);
  const [pingStatus, setPingStatus] = useState<'none' | 'success' | 'failed'>('none');

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTestingPing(true);
    setPingStatus('none');
    const ok = await apiService.checkBackendHealth(baseUrl);
    setTestingPing(false);
    setPingStatus(ok ? 'success' : 'failed');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      baseUrl: baseUrl.trim(),
      useMock,
      todosEndpoint: todosEndpoint.trim(),
      authLoginEndpoint: authLoginEndpoint.trim(),
      authRegisterEndpoint: authRegisterEndpoint.trim(),
    });
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-modal)',
          border: '1px solid var(--border-default)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={18} style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              백엔드 API 연결 설정
            </h2>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSave} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Mode Switch Card */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                {useMock ? 'Mock API 모드 활성' : 'Live Go Backend API 연동'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {useMock ? '서버 없이 브라우저 로컬 데이터로 동작합니다' : '실제 Go REST API 서버와 직접 통신합니다'}
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '6px' }}>
              <input
                type="checkbox"
                checked={!useMock}
                onChange={e => setUseMock(!e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--primary)' }}
              />
              <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Live 연동</span>
            </label>
          </div>

          {/* Base URL */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              서버 호스트 URL
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="form-input"
                value={baseUrl}
                onChange={e => setBaseUrl(e.target.value)}
                placeholder="http://localhost:8080"
              />
              <button
                type="button"
                onClick={handleTestConnection}
                className="btn-secondary"
                disabled={testingPing}
                style={{ whiteSpace: 'nowrap', padding: '0 12px', fontSize: '0.8rem' }}
              >
                <RefreshCw size={13} className={testingPing ? 'animate-spin' : ''} />
                <span>테스트</span>
              </button>
            </div>

            {pingStatus === 'success' && (
              <div style={{ color: 'var(--accent-success)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                <CheckCircle2 size={13} />
                <span>백엔드 서버와 통신할 수 있습니다.</span>
              </div>
            )}
            {pingStatus === 'failed' && (
              <div style={{ color: 'var(--accent-danger)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                <AlertCircle size={13} />
                <span>서버에 연결할 수 없습니다. 포트(8080)와 실행 여부를 확인하세요.</span>
              </div>
            )}
          </div>

          {/* Endpoints */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
            <span style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              엔드포인트 경로
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>할 일 엔드포인트</span>
                <input
                  type="text"
                  className="form-input"
                  value={todosEndpoint}
                  onChange={e => setTodosEndpoint(e.target.value)}
                  style={{ marginTop: '2px', padding: '6px 10px', fontSize: '0.825rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>로그인</span>
                  <input
                    type="text"
                    className="form-input"
                    value={authLoginEndpoint}
                    onChange={e => setAuthLoginEndpoint(e.target.value)}
                    style={{ marginTop: '2px', padding: '6px 10px', fontSize: '0.825rem' }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>회원가입</span>
                  <input
                    type="text"
                    className="form-input"
                    value={authRegisterEndpoint}
                    onChange={e => setAuthRegisterEndpoint(e.target.value)}
                    style={{ marginTop: '2px', padding: '6px 10px', fontSize: '0.825rem' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '8px',
              paddingTop: '12px',
              borderTop: '1px solid var(--border-subtle)',
              marginTop: '4px',
            }}
          >
            <button type="button" onClick={onClose} className="btn-secondary">
              취소
            </button>
            <button type="submit" className="btn-primary">
              설정 저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
