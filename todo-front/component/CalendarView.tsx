'use client';

import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Todo, Priority } from '../lib/types';

interface CalendarViewProps {
  todos: Todo[];
  onSelectDate: (dateStr: string) => void;
  onAddTodoForDate: (dateStr: string) => void;
  onToggleComplete: (id: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  todos,
  onSelectDate,
  onAddTodoForDate,
  onToggleComplete,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월',
  ];

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  // Map todos by date string YYYY-MM-DD
  const todosByDate: Record<string, Todo[]> = {};
  todos.forEach(todo => {
    if (todo.dueDate) {
      if (!todosByDate[todo.dueDate]) todosByDate[todo.dueDate] = [];
      todosByDate[todo.dueDate].push(todo);
    }
  });

  const selectedDateTodos = todosByDate[selectedDateStr] || [];

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'urgent': return 'var(--accent-danger)';
      case 'high': return 'var(--accent-warning)';
      case 'medium': return 'var(--primary)';
      case 'low': return 'var(--text-muted)';
    }
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
        gap: '20px',
        alignItems: 'start',
      }}
    >
      {/* Calendar Grid Container */}
      <div className="card" style={{ padding: '20px' }}>
        {/* Calendar Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {year}년 {monthNames[month]}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={handleToday}
              className="btn-secondary"
              style={{ padding: '5px 12px', fontSize: '0.8rem' }}
            >
              오늘
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <button onClick={handlePrevMonth} className="btn-icon" title="이전 달">
                <ChevronLeft size={16} />
              </button>
              <button onClick={handleNextMonth} className="btn-icon" title="다음 달">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Weekdays Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            textAlign: 'center',
            marginBottom: '8px',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '8px',
          }}
        >
          {weekDays.map((day, idx) => (
            <div
              key={day}
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: idx === 0 ? 'var(--accent-danger)' : idx === 6 ? 'var(--accent-info)' : 'var(--text-muted)',
              }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {/* Empty cells before 1st day */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} style={{ minHeight: '92px', borderRadius: 'var(--radius-sm)' }} />
          ))}

          {/* Actual Month Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const padMonth = String(month + 1).padStart(2, '0');
            const padDay = String(dayNum).padStart(2, '0');
            const dateStr = `${year}-${padMonth}-${padDay}`;
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            const isSelected = dateStr === selectedDateStr;
            const dayTodos = todosByDate[dateStr] || [];

            return (
              <div
                key={dateStr}
                onClick={() => {
                  setSelectedDateStr(dateStr);
                  onSelectDate(dateStr);
                }}
                style={{
                  minHeight: '92px',
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isSelected
                    ? 'var(--primary-light)'
                    : isToday
                    ? 'var(--bg-subtle)'
                    : 'transparent',
                  border: isSelected
                    ? '1px solid var(--border-focus)'
                    : isToday
                    ? '1px solid var(--border-strong)'
                    : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'var(--transition)',
                }}
              >
                {/* Date Number Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span
                    style={{
                      fontSize: '0.825rem',
                      fontWeight: isToday || isSelected ? 700 : 500,
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isToday ? 'var(--primary)' : 'transparent',
                      color: isToday ? 'var(--text-on-accent)' : isSelected ? 'var(--primary)' : 'var(--text-primary)',
                    }}
                  >
                    {dayNum}
                  </span>
                  {dayTodos.length > 0 && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {dayTodos.length}
                    </span>
                  )}
                </div>

                {/* Day's Todos Chips */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
                  {dayTodos.slice(0, 2).map(t => (
                    <div
                      key={t.id}
                      style={{
                        fontSize: '0.7rem',
                        padding: '2px 5px',
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: t.completed ? 'var(--bg-subtle)' : 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        color: t.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                        textDecoration: t.completed ? 'line-through' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <span
                        style={{
                          width: '4px',
                          height: '4px',
                          borderRadius: '50%',
                          backgroundColor: getPriorityColor(t.priority),
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</span>
                    </div>
                  ))}
                  {dayTodos.length > 2 && (
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', paddingLeft: '4px' }}>
                      +{dayTodos.length - 2}개 더보기
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Detail Panel */}
      <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '12px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {selectedDateStr} 일정
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              총 {selectedDateTodos.length}개의 할 일
            </p>
          </div>
          <button
            onClick={() => onAddTodoForDate(selectedDateStr)}
            className="btn-primary"
            style={{ padding: '6px 10px', fontSize: '0.75rem' }}
          >
            <Plus size={13} />
            <span>추가</span>
          </button>
        </div>

        {selectedDateTodos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 10px', color: 'var(--text-muted)' }}>
            <CalendarIcon size={28} style={{ marginBottom: '8px', opacity: 0.3 }} />
            <p style={{ fontSize: '0.825rem' }}>등록된 일정이 없습니다.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '520px' }}>
            {selectedDateTodos.map(todo => (
              <div
                key={todo.id}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                  <button
                    onClick={() => onToggleComplete(todo.id)}
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: 'var(--radius-xs)',
                      border: todo.completed
                        ? '1.5px solid var(--accent-success)'
                        : '1.5px solid var(--border-strong)',
                      backgroundColor: todo.completed ? 'var(--accent-success)' : 'transparent',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      padding: 0,
                      flexShrink: 0,
                    }}
                  >
                    {todo.completed && <Check size={10} strokeWidth={3} color="#ffffff" />}
                  </button>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        textDecoration: todo.completed ? 'line-through' : 'none',
                        color: todo.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {todo.title}
                    </div>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-muted)',
                    flexShrink: 0,
                  }}
                >
                  {todo.category}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
