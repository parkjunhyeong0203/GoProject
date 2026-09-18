'use client';

import React from 'react';
import { CheckCircle2, ListTodo, Flame, Star, TrendingUp } from 'lucide-react';
import { Todo } from '../lib/types';

interface TodoStatsProps {
  todos: Todo[];
}

export const TodoStats: React.FC<TodoStatsProps> = ({ todos }) => {
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const starred = todos.filter(t => t.starred).length;
  const urgentOrHigh = todos.filter(t => !t.completed && (t.priority === 'urgent' || t.priority === 'high')).length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const dueToday = todos.filter(t => !t.completed && t.dueDate === todayStr).length;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}
    >
      {/* Card 1: Completion Progress */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>전체 달성률</span>
          <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)' }}>
            <TrendingUp size={18} color="var(--accent-primary)" />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>{completionRate}%</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>({completed}/{total} 완료)</span>
        </div>
        {/* Progress Bar */}
        <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${completionRate}%`,
              height: '100%',
              background: 'var(--accent-gradient)',
              transition: 'width 0.5s ease-in-out',
            }}
          />
        </div>
      </div>

      {/* Card 2: Due Today */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>오늘의 할 일</span>
          <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.15)' }}>
            <ListTodo size={18} color="var(--accent-blue)" />
          </div>
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>
          {dueToday} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>건 남음</span>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>오늘 마감 예정인 일정</span>
      </div>

      {/* Card 3: Urgent & High Priorities */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>우선순위 항목</span>
          <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.15)' }}>
            <Flame size={18} color="var(--accent-rose)" />
          </div>
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: urgentOrHigh > 0 ? 'var(--accent-rose)' : 'var(--text-primary)' }}>
          {urgentOrHigh} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>건</span>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>긴급 및 높은 우선순위 처리</span>
      </div>

      {/* Card 4: Starred Items */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>중요 보관함</span>
          <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)' }}>
            <Star size={18} color="var(--accent-amber)" />
          </div>
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>
          {starred} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>건</span>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>즐겨찾기 핀 고정 항목</span>
      </div>
    </div>
  );
};
