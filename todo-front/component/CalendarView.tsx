'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
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

  // Days in month
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDateStr(new Date().toISOString().split('T')[0]);
  };

  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
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

  // Selected Date Todos
  const selectedDateTodos = todosByDate[selectedDateStr] || [];

  const getPriorityDotColor = (priority: Priority) => {
    switch (priority) {
      case 'urgent': return '#f43f5e';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      case 'low': return '#10b981';
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
      {/* Calendar Grid Container */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        {/* Calendar Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CalendarIcon size={24} color="var(--accent-primary)" />
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>
              {year}년 {monthNames[month]}
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={handleToday} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
              오늘
            </button>
            <button onClick={handlePrevMonth} className="btn-icon" title="이전 달">
              <ChevronLeft size={20} />
            </button>
            <button onClick={handleNextMonth} className="btn-icon" title="다음 달">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Days of Week Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '12px' }}>
          {weekDays.map((day, idx) => (
            <div
              key={day}
              style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: idx === 0 ? 'var(--accent-rose)' : idx === 6 ? 'var(--accent-blue)' : 'var(--text-secondary)',
                padding: '8px 0',
              }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Month Days Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
          {/* Empty cells for padding */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} style={{ height: '90px', opacity: 0.2 }} />
          ))}

          {/* Actual days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateObj = new Date(year, month, dayNum);
            const dateStr = dateObj.toISOString().split('T')[0];
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            const isSelected = dateStr === selectedDateStr;
            const dayTodos = todosByDate[dateStr] || [];

            return (
              <div
                key={dayStr(dateStr)}
                onClick={() => {
                  setSelectedDateStr(dateStr);
                  onSelectDate(dateStr);
                }}
                style={{
                  height: '90px',
                  padding: '8px',
                  borderRadius: '12px',
                  background: isSelected
                    ? 'rgba(99, 102, 241, 0.25)'
                    : isToday
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(255, 255, 255, 0.03)',
                  border: isSelected
                    ? '1.5px solid var(--accent-primary)'
                    : isToday
                    ? '1px solid rgba(255, 255, 255, 0.2)'
                    : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: isToday || isSelected ? 700 : 500,
                      color: isToday ? 'var(--accent-primary)' : 'var(--text-primary)',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isToday ? 'rgba(99, 102, 241, 0.2)' : 'none',
                    }}
                  >
                    {dayNum}
                  </span>
                  {dayTodos.length > 0 && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {dayTodos.length}개
                    </span>
                  )}
                </div>

                {/* Todo indicators in cell */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', overflow: 'hidden' }}>
                  {dayTodos.slice(0, 2).map((t) => (
                    <div
                      key={t.id}
                      style={{
                        fontSize: '0.72rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: t.completed ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 23, 42, 0.8)',
                        color: t.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                        textDecoration: t.completed ? 'line-through' : 'none',
                        borderLeft: `3px solid ${getPriorityDotColor(t.priority)}`,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {t.title}
                    </div>
                  ))}
                  {dayTodos.length > 2 && (
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', paddingLeft: '4px' }}>
                      +{dayTodos.length - 2} 더보기
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Detail Sidebar Panel */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              {selectedDateStr} 일정
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              선택한 날짜의 할 일 목록
            </p>
          </div>
          <button
            onClick={() => onAddTodoForDate(selectedDateStr)}
            className="btn-primary"
            style={{ padding: '8px 12px', fontSize: '0.82rem' }}
          >
            <Plus size={15} />
            <span>추가</span>
          </button>
        </div>

        {selectedDateTodos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)' }}>
            <CalendarIcon size={36} style={{ marginBottom: '10px', opacity: 0.5 }} />
            <p style={{ fontSize: '0.9rem' }}>선택한 날짜에 등록된 일정이 없습니다.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '500px' }}>
            {selectedDateTodos.map(todo => (
              <div
                key={todo.id}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                  <button
                    onClick={() => onToggleComplete(todo.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    <CheckCircle2
                      size={18}
                      color={todo.completed ? 'var(--accent-emerald)' : 'var(--text-muted)'}
                    />
                  </button>
                  <div>
                    <div
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        textDecoration: todo.completed ? 'line-through' : 'none',
                        color: todo.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                      }}
                    >
                      {todo.title}
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    background: 'rgba(99, 102, 241, 0.15)',
                    color: '#a5b4fc',
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

function dayStr(s: string) {
  return s;
}
