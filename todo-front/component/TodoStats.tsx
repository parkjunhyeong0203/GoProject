'use client';

import React from 'react';
import { CheckCircle2, Calendar, AlertTriangle, Layers } from 'lucide-react';
import { Todo } from '../lib/types';

interface TodoStatsProps {
  todos: Todo[];
}

export const TodoStats: React.FC<TodoStatsProps> = ({ todos }) => {
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const urgentOrHigh = todos.filter(t => !t.completed && (t.priority === 'urgent' || t.priority === 'high')).length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const dueToday = todos.filter(t => !t.completed && t.dueDate === todayStr).length;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '12px',
        marginBottom: '24px',
      }}
    >
      {/* Metric 1: Overall Completion */}
      <div className="card" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>전체 달성률</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {completed}/{total} 완료
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.5px' }}>
            {completionRate}%
          </span>
        </div>
        {/* Sleek Progress Bar */}
        <div
          style={{
            width: '100%',
            height: '4px',
            backgroundColor: 'var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
            marginTop: '2px',
          }}
        >
          <div
            style={{
              width: `${completionRate}%`,
              height: '100%',
              backgroundColor: 'var(--accent-success)',
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>

      {/* Metric 2: Due Today */}
      <div className="card" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>오늘 마감</span>
          <Calendar size={15} style={{ color: 'var(--text-muted)' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.5px' }}>
            {dueToday}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>건</span>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>오늘 완료해야 할 항목</span>
      </div>

      {/* Metric 3: Priority Attention */}
      <div className="card" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>우선 처리 필요</span>
          <AlertTriangle
            size={15}
            style={{ color: urgentOrHigh > 0 ? 'var(--accent-danger)' : 'var(--text-muted)' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span
            style={{
              fontSize: '1.6rem',
              fontWeight: 700,
              letterSpacing: '-0.5px',
              color: urgentOrHigh > 0 ? 'var(--accent-danger)' : 'inherit',
            }}
          >
            {urgentOrHigh}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>건</span>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>긴급 및 높음 우선순위</span>
      </div>

      {/* Metric 4: Done Count */}
      <div className="card" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>완료된 항목</span>
          <CheckCircle2 size={15} style={{ color: 'var(--accent-success)' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.5px' }}>
            {completed}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>건</span>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>해결 및 완료 완료됨</span>
      </div>
    </div>
  );
};
