'use client';

import React, { useState } from 'react';
import { X, Server, CheckCircle2, AlertCircle, RefreshCw, Save } from 'lucide-react';
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
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="glass-panel animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '28px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-glow)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Server size={22} color="var(--accent-primary)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              Go 백엔드 REST API 연동 설정
            </h2>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Mode Switch Card */}
          <div
            style={{
              padding: '14px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>통신 모드 선택</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {useMock ? 'Mock API 모드 (백엔드 없이 프론트 단독 동작)' : 'Live Go Backend API 직접 통신 모드'}
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
              <input
                type="checkbox"
                checked={!useMock}
                onChange={e => setUseMock(!e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Real API</span>
            </label>
          </div>

          {/* Base URL Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Go 백엔드 서버 URL (Base URL)
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
                style={{ whiteSpace: 'nowrap', padding: '0 14px' }}
              >
                <RefreshCw size={15} className={testingPing ? 'animate-spin' : ''} />
                <span>연결 테스트</span>
              </button>
            </div>
            {pingStatus === 'success' && (
              <div style={{ color: 'var(--accent-emerald)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                <CheckCircle2 size={14} />
                <span>백엔드 서버에 성공적으로 연결되었습니다!</span>
              </div>
            )}
            {pingStatus === 'failed' && (
              <div style={{ color: 'var(--accent-rose)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                <AlertCircle size={14} />
                <span>서버 응답 없음. 백엔드(http://localhost:8080)가 켜져 있는지 확인하세요.</span>
              </div>
            )}
          </div>

          {/* Endpoint Customization */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px', marginTop: '4px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>
              API 엔드포인트 경로 매핑
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>할 일 REST API (Todos Endpoint)</label>
                <input
                  type="text"
                  className="form-input"
                  value={todosEndpoint}
                  onChange={e => setTodosEndpoint(e.target.value)}
                  placeholder="/todos 또는 /students"
                  style={{ marginTop: '2px', padding: '8px 12px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>로그인 Endpoint</label>
                  <input
                    type="text"
                    className="form-input"
                    value={authLoginEndpoint}
                    onChange={e => setAuthLoginEndpoint(e.target.value)}
                    placeholder="/auth/login"
                    style={{ marginTop: '2px', padding: '8px 12px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>회원가입 Endpoint</label>
                  <input
                    type="text"
                    className="form-input"
                    value={authRegisterEndpoint}
                    onChange={e => setAuthRegisterEndpoint(e.target.value)}
                    placeholder="/auth/register"
                    style={{ marginTop: '2px', padding: '8px 12px' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              취소
            </button>
            <button type="submit" className="btn-primary">
              <Save size={16} />
              <span>설정 저장</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
