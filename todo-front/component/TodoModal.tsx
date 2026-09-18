'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Save, Calendar as CalendarIcon, Clock, Tag, AlertCircle } from 'lucide-react';
import { Todo, Priority, Category } from '../lib/types';

interface TodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (todo: Partial<Todo>) => void;
  initialData?: Todo | null;
}

export const TodoModal: React.FC<TodoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<Category>('work');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [starred, setStarred] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setPriority(initialData.priority);
      setCategory(initialData.category);
      setDueDate(initialData.dueDate || '');
      setDueTime(initialData.dueTime || '');
      setTags(initialData.tags || []);
      setStarred(initialData.starred || false);
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setCategory('work');
      setDueDate(new Date().toISOString().split('T')[0]);
      setDueTime('18:00');
      setTags([]);
      setStarred(false);
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('할 일 제목을 입력해주세요.');
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      priority,
      category,
      dueDate,
      dueTime,
      tags,
      starred,
    });
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'rgba(0, 0, 0, 0.7)',
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
          maxWidth: '540px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-glow)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>
            {initialData ? '할 일 수정하기' : '새 할 일 추가'}
          </h2>
          <button onClick={onClose} className="btn-icon">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: 'var(--accent-rose)',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Title */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              할 일 제목 *
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="예: Go JWT 백엔드 API 라우트 테스트"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              상세 설명
            </label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="세부적인 내용이나 참고 사항을 입력하세요..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{ resize: 'vertical', minHeight: '80px' }}
            />
          </div>

          {/* Category & Priority Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                우선순위
              </label>
              <select
                className="form-select"
                value={priority}
                onChange={e => setPriority(e.target.value as Priority)}
              >
                <option value="urgent">🔥 긴급 (Urgent)</option>
                <option value="high">⚡ 높음 (High)</option>
                <option value="medium">🔷 보통 (Medium)</option>
                <option value="low">🌱 낮음 (Low)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                카테고리
              </label>
              <select
                className="form-select"
                value={category}
                onChange={e => setCategory(e.target.value as Category)}
              >
                <option value="work">💼 업무</option>
                <option value="personal">👤 개인</option>
                <option value="study">📚 공부</option>
                <option value="health">💪 건강</option>
                <option value="finance">💰 금융</option>
                <option value="other">📌 기타</option>
              </select>
            </div>
          </div>

          {/* Due Date & Time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                <CalendarIcon size={14} style={{ display: 'inline', marginRight: '4px' }} />
                마감 일자
              </label>
              <input
                type="date"
                className="form-input"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                <Clock size={14} style={{ display: 'inline', marginRight: '4px' }} />
                마감 시간
              </label>
              <input
                type="time"
                className="form-input"
                value={dueTime}
                onChange={e => setDueTime(e.target.value)}
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              <Tag size={14} style={{ display: 'inline', marginRight: '4px' }} />
              태그 (Enter 키를 눌러 추가)
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="태그 입력 후 Enter..."
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
            />
            {tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                {tags.map((t, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      background: 'rgba(99, 102, 241, 0.18)',
                      color: '#a5b4fc',
                      fontSize: '0.8rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      style={{ background: 'none', border: 'none', color: '#a5b4fc', cursor: 'pointer', padding: 0 }}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              취소
            </button>
            <button type="submit" className="btn-primary">
              {initialData ? <Save size={16} /> : <Plus size={16} />}
              <span>{initialData ? '저장하기' : '생성하기'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
