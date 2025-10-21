// src/components/RichEditor.jsx
import React, { useState, useRef, useEffect } from 'react';
import '@wangeditor/editor/dist/css/style.css';
import { Editor, Toolbar } from '@wangeditor/editor-for-react';

const RichEditor = ({ value, onChange }) => {
  const editorRef = useRef(null);
  const [editorInstance, setEditorInstance] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // 编辑器配置
  const editorConfig = {
    placeholder: '请输入文章内容...',
    MENU_CONF: {}
  };

  // 关键修复：在编辑器创建后设置内容
  useEffect(() => {
    if (editorInstance && value !== undefined && value !== null && !isInitialized) {
      console.log('📝 初始化编辑器内容，长度:', value.length);
      try {
        editorInstance.setHtml(value || '');
        setIsInitialized(true);
      } catch (error) {
        console.warn('设置编辑器内容时出错:', error);
      }
    }
  }, [editorInstance, value, isInitialized]);

  // 处理编辑器内容变化
  useEffect(() => {
    if (!editorInstance) return;

    const handleChange = () => {
      try {
        const html = editorInstance.getHtml();
        onChange(html);
      } catch (error) {
        console.warn('获取编辑器内容时出错:', error);
      }
    };

    // 使用防抖避免频繁触发
    let timeoutId;
    const debouncedChange = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleChange, 300);
    };

    editorInstance.on('change', debouncedChange);

    return () => {
      editorInstance.off('change', debouncedChange);
      clearTimeout(timeoutId);
    };
  }, [editorInstance, onChange]);

  // 销毁编辑器
  useEffect(() => {
    return () => {
      if (editorInstance) {
        try {
          editorInstance.destroy();
          setEditorInstance(null);
          setIsInitialized(false);
        } catch (error) {
          console.warn('销毁编辑器时出错:', error);
        }
      }
    };
  }, [editorInstance]);

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: '4px', margin: '10px 0' }}>
      <Toolbar
        editor={editorInstance}
        defaultConfig={{}}
        mode="default"
        style={{ borderBottom: '1px solid #ccc' }}
      />
      <Editor
        ref={editorRef}
        defaultConfig={editorConfig}
        value={value || ''}
        mode="default"
        onCreated={(editor) => {
          console.log('🎉 编辑器创建完成');
          setEditorInstance(editor);
          // 立即设置内容
          if (value) {
            console.log('📝 编辑器创建时设置内容，长度:', value.length);
            editor.setHtml(value);
            setIsInitialized(true);
          }
        }}
        style={{ 
          minHeight: '400px',
          height: '400px'
        }}
      />
    </div>
  );
};

export default RichEditor;