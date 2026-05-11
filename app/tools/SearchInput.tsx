'use client';

import { useState } from 'react';

interface SearchInputProps {
  defaultValue?: string;
}

export function SearchInput({ defaultValue = '' }: SearchInputProps) {
  const [value, setValue] = useState(defaultValue);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const query = value.trim();
      window.location.href = query ? `/tools?q=${encodeURIComponent(query)}` : '/tools';
    }
  };

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#9CA3AF' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="搜索 AI 工具..."
        onKeyDown={handleKeyDown}
        style={{
          width: '100%',
          padding: '9px 12px 9px 40px',
          borderRadius: 8,
          border: '1px solid #E8D5B7',
          background: '#FFFFFF',
          fontSize: 13,
          color: '#1F2937',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}
