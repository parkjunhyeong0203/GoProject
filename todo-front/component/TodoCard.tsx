'use client';

import React, { useState } from 'react';
import {
  Check,
  Calendar,
  MoreVertical,
  Edit2,
  Trash2,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { Todo, Priority, Category } from '../lib/types';

interface TodoCardProps {
  todo: Todo;
  onToggleComplete: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

const getPriorityConfig = (priority: Priority) => {
  switch (priority) {
    case 'urgent':
      return {
        label: '긴급',
        color: 'var(--accent-danger)',
        bg: 'var(--accent-danger-subtle)',
      };
    case 'high':
      return {
        label: '높음',
        color: 'var(--accent-warning)',
        bg: 'var(--accent-warning-subtle)',
      };
    case 'medium':
      return {
        label: '보통',
        color: 'var(--primary)',
        bg: 'var(--primary-light)',
      };
    case 'low':
      return {
        label: '낮음',
        color: 'var(--text-muted)',
        bg: 'var(--bg-subtle)',
      };
  }
};

const getCategoryLabel = (category: Category) => {
  const map: Record<Category, string> = {
    work: '업무',
    personal: '개인',
    study: '공부',
    health: '건강',
    finance: '금융',
    other: '기타',
  };
  return map[category] || '기타';
};

export const TodoCard: React.FC<TodoCardProps> = ({
  todo,
  onToggleComplete,
  onEdit,
  onDelete,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const priorityConfig = getPriorityConfig(todo.priority);

  // Due Date calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const isOverdue = !todo.completed && todo.dueDate && todo.dueDate < todayStr;
  const isToday = !todo.completed && todo.dueDate && todo.dueDate === todayStr;

  return (
    <div
      className="card-hoverable animate-fade-in"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '140px',
        opacity: todo.completed ? 0.6 : 1,
        position: 'relative',
        backgroundColor: todo.completed ? 'var(--bg-subtle)' : 'var(--bg-surface)',
      }}
    >
      {/* Top Section: Checkbox, Title, and Action Controls */}
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1, minWidth: 0 }}>
            {/* Custom Minimal Checkbox */}
            <button
              onClick={() => onToggleComplete(todo.id)}
              aria-label={todo.completed ? '완료 취소' : '할 일 완료'}
              style={{
                width: '18px',
                height: '18px',
                borderRadius: 'var(--radius-xs)',
                border: todo.completed
                  ? '1.5px solid var(--accent-success)'
                  : '1.5px solid var(--border-strong)',
                backgroundColor: todo.completed ? 'var(--accent-success)' : 'transparent',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                marginTop: '2px',
                padding: 0,
                flexShrink: 0,
                transition: 'var(--transition)',
              }}
            >
              {todo.completed && <Check size={12} strokeWidth={3} color="#ffffff" />}
            </button>

            {/* Title & Description */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3
                style={{
                  fontSize: '0.925rem',
                  fontWeight: 600,
                  lineHeight: 1.4,
                  color: todo.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                  textDecoration: todo.completed ? 'line-through' : 'none',
                  wordBreak: 'break-word',
                }}
              >
                {todo.title}
              </h3>
              {todo.description && (
                <p
                  style={{
                    fontSize: '0.825rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.45,
                    marginTop: '4px',
                    wordBreak: 'break-word',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {todo.description}
                </p>
              )}
            </div>
          </div>

          {/* Quick Action Buttons (Edit & Delete) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              opacity: isHovered ? 1 : 0.4,
              transition: 'opacity 0.15s ease',
            }}
          >
            <button
              onClick={() => onEdit(todo)}
              className="btn-icon"
              title="할 일 수정"
              style={{ padding: '4px', color: 'var(--text-secondary)' }}
            >
              <Edit2 size={13} />
            </button>
            <button
              onClick={() => onDelete(todo.id)}
              className="btn-icon"
              title="할 일 삭제"
              style={{ padding: '4px', color: 'var(--text-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-danger)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Metadata Section: Priority dot, Category, Due date */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '14px',
          paddingTop: '10px',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Priority Tag with Dot */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 7px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: priorityConfig.bg,
              color: priorityConfig.color,
              fontWeight: 500,
            }}
          >
            <span
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                backgroundColor: priorityConfig.color,
              }}
            />
            <span>{priorityConfig.label}</span>
          </span>

          {/* Category Chip */}
          <span
            style={{
              padding: '2px 7px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontWeight: 500,
            }}
          >
            {getCategoryLabel(todo.category)}
          </span>
        </div>

        {/* Due Date Indicator */}
        {todo.dueDate && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              color: isOverdue
                ? 'var(--accent-danger)'
                : isToday
                ? 'var(--accent-warning)'
                : 'var(--text-muted)',
              fontWeight: isOverdue || isToday ? 600 : 400,
            }}
          >
            {isOverdue ? <AlertCircle size={12} /> : <Calendar size={12} />}
            <span>{isToday ? '오늘 마감' : todo.dueDate}</span>
          </div>
        )}
      </div>
    </div>
  );
};
