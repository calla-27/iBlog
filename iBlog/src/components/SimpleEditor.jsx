// src/components/SimpleEditor.jsx
import React, { useState, useEffect } from 'react';

const SimpleEditor = ({ value, onChange }) => {
  const [content, setContent] = useState(value || '');

  useEffect(() => {
    setContent(value || '');
  }, [value]);

  const handleChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    onChange(newContent);
  };

  return (
    <div style={{ 
      border: '1px solid #ddd', 
      borderRadius: '4px',
      overflow: 'hidden',
      margin: '10px 0'
    }}>
      <div style={{ 
        padding: '8px 12px', 
        borderBottom: '1px solid #eee', 
        background: '#f8f9fa',
        display: 'flex',
        gap: '8px',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>文章编辑器</span>
        <div style={{ flex: 1 }}></div>
        <span style={{ fontSize: '12px', color: '#999' }}>
          {content.length} 字符
        </span>
      </div>
      <textarea
        value={content}
        onChange={handleChange}
        placeholder="请输入文章内容...（支持Markdown语法）"
        style={{
          width: '100%',
          minHeight: '400px',
          border: 'none',
          padding: '16px',
          resize: 'vertical',
          fontFamily: 'inherit',
          fontSize: '14px',
          lineHeight: '1.6',
          outline: 'none'
        }}
      />
    </div>
  );
};

export default SimpleEditor;