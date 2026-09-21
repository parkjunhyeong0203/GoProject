'use client';

import React from 'react';
import { CheckCircle2, Circle, Calendar, Edit3, Trash2, AlertCircle } from 'lucide-react';
import { Todo, Priority, Category } from '../lib/types';

interface TodoCardProps {
  todo: Todo;
  onToggleComplete: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

const getPriorityBadge = (priority: Priority) => {
  switch (priority) {
    case 'urgent':
      return { label: '긴급', bg: 'var(--priority-urgent-bg)', color: 'var(--priority-urgent-text)' };
    case 'high':
      return { label: '높음', bg: 'var(--priority-high-bg)', color: 'var(--priority-high-text)' };
    case 'medium':
      return { label: '보통', bg: 'var(--priority-medium-bg)', color: 'var(--priority-medium-text)' };
    case 'low':
      return { label: '낮음', bg: 'var(--priority-low-bg)', color: 'var(--priority-low-text)' };
  }
};

const getCategoryLabel = (category: Category) => {
  const map: Record<Category, string> = {
    work: '💼 업무',
    personal: '👤 개인',
    study: '📚 공부',
    health: '💪 건강',
    finance: '💰 금융',
    other: '📌 기타',
  };
  return map[category] || '📌 기타';
};

export const TodoCard: React.FC<TodoCardProps> = ({
  todo,
  onToggleComplete,
  onEdit,
  onDelete,
}) => {
  const priorityBadge = getPriorityBadge(todo.priority);

  // Check if overdue
  const isOverdue = !todo.completed && todo.dueDate && new Date(todo.dueDate) < new Date(new Date().toDateString());

  return (
    <div
      className="glass-panel-interactive animate-fade-in"
      style={{
        padding: '16px 20px',
        opacity: todo.completed ? 0.65 : 1,
        borderLeft: todo.completed
          ? '4px solid var(--text-muted)'
          : `4px solid ${priorityBadge.color}`,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {/* Top Row: Checkbox, Title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
          <button
            onClick={() => onToggleComplete(todo.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: todo.completed ? 'var(--accent-emerald)' : 'var(--text-muted)',
              marginTop: '2px',
              padding: 0,
              transition: 'transform 0.15s ease',
            }}
          >
            {todo.completed ? <CheckCircle2 size={22} color="var(--accent-emerald)" /> : <Circle size={22} />}
          </button>

          <div style={{ flex: 1 }}>
            <h3
              style={{
                fontSize: '1.05rem',
                fontWeight: 600,
                textDecoration: todo.completed ? 'line-through' : 'none',
                color: todo.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                marginBottom: '4px',
                wordBreak: 'break-word',
              }}
            >
              {todo.title}
            </h3>
            {todo.description && (
              <p
                style={{
                  fontSize: '0.88rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.4,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {todo.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Middle Meta Info: Priority, Category, Due Date, Overdue Notice */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
        {/* Priority Badge */}
        <span
          style={{
            padding: '3px 10px',
            borderRadius: '12px',
            background: priorityBadge.bg,
            color: priorityBadge.color,
            fontWeight: 600,
          }}
        >
          {priorityBadge.label}
        </span>

        {/* Category Badge */}
        <span
          style={{
            padding: '3px 10px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.06)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-color)',
          }}
        >
          {getCategoryLabel(todo.category)}
        </span>

        {/* Due Date */}
        {todo.dueDate && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              color: isOverdue ? 'var(--accent-rose)' : 'var(--text-secondary)',
              fontWeight: isOverdue ? 600 : 400,
            }}
          >
            {isOverdue ? <AlertCircle size={14} color="var(--accent-rose)" /> : <Calendar size={14} />}
            <span>{todo.dueDate}</span>
          </span>
        )}
      </div>

      {/* Bottom Action Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '8px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          paddingTop: '8px',
          marginTop: '4px',
        }}
      >
        <button
          onClick={() => onEdit(todo)}
          className="btn-icon"
          title="수정"
          style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <Edit3 size={15} />
          <span>수정</span>
        </button>
        <button
          onClick={() => onDelete(todo.id)}
          className="btn-icon"
          title="삭제"
          style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-rose)' }}
        >
          <Trash2 size={15} />
          <span>삭제</span>
        </button>
      </div>
    </div>
  );
};
