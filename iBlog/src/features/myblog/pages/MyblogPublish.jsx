// src/features/myblog/pages/MyblogPublish.jsx
import MyblogHeader from "../components/MyblogHeader";
import { useForm } from "react-hook-form";
import { useState, useEffect, useRef } from "react"; // 新增 useRef
import { useNavigate, useSearchParams } from "react-router-dom";
import s from "../styles/myblog-publish.module.css";
import RichEditor from "../../../components/RichEditor";

const CATEGORY_OPTIONS = [
  "前端开发",
  "后端开发",
  "技术杂谈",
  "学习笔记",
  "生活分享"
];

export default function MyblogPublish() {
  const navigate = useNavigate();
  const [coverUrl, setCoverUrl] = useState('');
  const [searchParams] = useSearchParams();
  const articleId = searchParams.get('id');
  const fileInputRef = useRef(null); // 新增：文件输入引用
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [content, setContent] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [coverPreview, setCoverPreview] = useState(''); // 新增：本地预览图
  const [isUploading, setIsUploading] = useState(false); // 新增：上传状态

  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm({
    defaultValues: {
      title: "",
      category: "前端开发",
      tags: ""
    }
  });

  const watchedFields = watch();

  // 在 MyblogPublish.jsx 中修改 useEffect 部分
useEffect(() => {
  const urlArticleId = searchParams.get("id");
  console.log('🔍 从URL获取的文章ID:', urlArticleId);
  
  if (urlArticleId && urlArticleId !== 'undefined') {
    setIsEditMode(true);
    setIsLoading(true);
    setSubmitError(""); // 清除错误信息
    fetchArticleData(urlArticleId);
  } else {
    console.log('ℹ️ 新建文章模式，无ID参数');
    setIsLoading(false);
  }
}, [searchParams]);

// 修改 fetchArticleData 函数，添加更详细的错误处理
const fetchArticleData = async (id) => {
  // 验证ID是否有效
  if (!id || id === 'undefined' || id === 'null') {
    console.error('❌ 无效的文章ID:', id);
    setSubmitError('无效的文章ID');
    setIsLoading(false);
    return;
  }

  try {
    console.log('📝 开始加载文章数据，ID:', id);
    const token = localStorage.getItem('token');
    
    if (!token) {
      setSubmitError('用户未登录');
      setIsLoading(false);
      return;
    }

    const response = await fetch(`http://localhost:4000/api/articles/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📝 文章数据响应状态:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('📝 文章数据API响应:', result);
      
      if (result.success && result.article) {
        const article = result.article;
        console.log('📝 加载到的文章数据:', {
          id: article.articleId,
          title: article.articleTitle,
          category: article.articleCategory,
          topics: article.articleTopics,
          contentLength: article.articleContent?.length,
          cover: article.articleCover,
          status: article.articleStatus
        });
        
        // 设置表单值
        setValue('title', article.articleTitle || '');
        setValue('category', article.articleCategory || '前端开发');
        
        // 处理标签
        if (article.articleTopics && Array.isArray(article.articleTopics)) {
          setValue('tags', article.articleTopics.join(', '));
        } else {
          setValue('tags', '');
        }
        
        // 设置内容和封面
        setContent(article.articleContent || '');
        
        // 设置封面预览
        if (article.articleCover) {
          const fullCoverUrl = `http://localhost:4000${article.articleCover}`;
          setCoverUrl(article.articleCover);
          setCoverPreview(fullCoverUrl);
          console.log('✅ 设置封面预览:', fullCoverUrl);
        }
        
        console.log('✅ 文章数据加载完成');
      } else {
        console.error('❌ 文章数据加载失败:', result.message);
        setSubmitError('加载文章失败: ' + (result.message || '未知错误'));
      }
    } else {
      const errorText = await response.text();
      console.error('❌ HTTP错误:', response.status, errorText);
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // 如果不是JSON，使用原始文本
        errorMessage = errorText || errorMessage;
      }
      setSubmitError('加载文章失败: ' + errorMessage);
    }
  } catch (error) {
    console.error('❌ 加载文章数据失败:', error);
    setSubmitError('加载文章失败: ' + error.message);
  } finally {
    setIsLoading(false);
  }
};

  const formatTags = (tagsStr) => {
    if (!tagsStr) return [];
    return tagsStr
      .split(",")
      .map(tag => tag.trim())
      .filter(tag => tag)
      .slice(0, 5);
  };

  const isFormValidForDraft = () => {
    const hasTitle = watchedFields.title && watchedFields.title.trim().length > 0;
    return hasTitle;
  };

  const isFormValidForPublish = () => {
    const hasTitle = watchedFields.title && watchedFields.title.trim().length > 0;
    const hasContent = content && content.trim().length > 0;
    const hasCategory = watchedFields.category && watchedFields.category.trim().length > 0;
    
    return hasTitle && hasContent && hasCategory;
  };

  const handleContentChange = (newContent) => {
    setContent(newContent);
  };

  // 新增：处理本地图片预览
  const handleLocalPreview = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setCoverPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // 修改：增强封面图上传功能
  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setSubmitError('请选择图片文件');
      return;
    }

    // 验证文件大小 (限制为5MB)
    if (file.size > 5 * 1024 * 1024) {
      setSubmitError('图片大小不能超过5MB');
      return;
    }

    // 先显示本地预览
    handleLocalPreview(file);

    // 上传到服务器
    setIsUploading(true);
    setSubmitError('');

    const formData = new FormData();
    formData.append('cover', file);

    try {
      const res = await fetch('http://localhost:4000/api/upload/cover', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setCoverUrl(data.url);
        setSubmitError(''); // 清除错误信息
        console.log('✅ 封面图上传成功:', data.url);
      } else {
        setSubmitError('上传失败: ' + (data.message || '未知错误'));
        // 上传失败时保留本地预览但标记为未保存
        setCoverPreview(coverPreview); // 保持本地预览
      }
    } catch (err) {
      console.error('上传封面失败:', err);
      setSubmitError('上传失败，请检查网络连接');
      // 上传失败时保留本地预览
      setCoverPreview(coverPreview);
    } finally {
      setIsUploading(false);
    }
  };

  // 新增：移除封面图
  const handleRemoveCover = () => {
    setCoverUrl('');
    setCoverPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 新增：触发文件选择
  const handleSelectCover = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const prepareArticleData = (data, status) => {
    return {
      articleTitle: data.title?.trim() || '',
      articleCover: coverUrl || '',
      articleContent: content || '',
      articleCategory: data.category || '前端开发',
      articleTopics: formatTags(data.tags || ''),
      articleStatus: status
    };
  };

  const onSubmit = async (data, status = 'published') => {
    try {
      setIsSubmitting(true);
      setSubmitError("");

      console.log(`📝 提交数据:`, { 
        isEditMode, 
        articleId, 
        status, 
        title: data.title,
        contentLength: content?.length 
      });

      // 发布时需要验证内容，草稿不需要
      if (status === 'published' && (!content || content.trim().length === 0)) {
        setSubmitError("文章内容不能为空");
        setIsSubmitting(false);
        return;
      }

      // 使用修复后的数据准备函数
      const articleData = prepareArticleData(data, status);
      console.log(`📝 ${status === 'published' ? '发布' : '保存草稿'}文章数据:`, articleData);

      const token = localStorage.getItem('token');
      if (!token) {
        setSubmitError("用户未登录");
        setIsSubmitting(false);
        return;
      }

      let response;
      let url;

      if (isEditMode && articleId) {
        // 更新现有文章
        url = `http://localhost:4000/api/articles/${articleId}`;
        response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(articleData)
        });
      } else {
        // 创建新文章
        url = 'http://localhost:4000/api/articles';
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(articleData)
        });
      }

      const result = await response.json();
      console.log('API响应:', result);

      if (!response.ok || !result.success) {
        throw new Error(result.message || `${status === 'published' ? '发布' : '保存'}失败`);
      }

      console.log(`✅ 文章${status === 'published' ? '发布' : '保存草稿'}成功:`, result);
      
      if (status === 'published') {
        reset();
        setContent('');
        navigate("/myblog");
      } else {
        // 保存草稿后留在编辑页面
        setSubmitError("草稿保存成功！");
        setIsEditMode(true);
        // 如果是新创建的草稿，更新URL
        if (!isEditMode && result.article) {
          navigate(`/myblog/publish?id=${result.article.articleId}`, { replace: true });
        }
      }
    } catch (err) {
      console.error(`❌ ${status === 'published' ? '发布' : '保存'}失败:`, err);
      setSubmitError(
        err.message || `${status === 'published' ? '发布' : '保存'}失败，请稍后重试`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSaveDraft = (data) => {
    console.log('💾 保存草稿:', data);
    onSubmit(data, 'draft');
  };

  const onPublish = (data) => {
    console.log('🚀 发布文章:', data);
    onSubmit(data, 'published');
  };

  // 显示加载状态
  if (isLoading) {
    return (
      <div className={s.wrapper}>
        <MyblogHeader />
        <div className={s.publishContainer}>
          <div className={s.loading}>加载文章中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={s.wrapper}>
      <MyblogHeader />

      <div className={s.publishContainer}>
        <h2 className={s.pageTitle}>
          {isEditMode ? '编辑文章' : '发布新博客'}
          {isEditMode && <span className={s.draftNotice}>(编辑模式)</span>}
        </h2>

        {submitError && (
          <div className={submitError.includes('成功') ? s.successMsg : s.errorMsg}>
            {submitError}
          </div>
        )}

        <form 
          className={s.publishForm}
          onSubmit={handleSubmit(onPublish)}
        >
          {/* 文章标题 */}
          <div className={s.formGroup}>
            <label htmlFor="title" className={s.formLabel}>
              文章标题 <span className={s.required}>*</span>
            </label>
            <input
              type="text"
              id="title"
              className={`${s.formInput} ${errors.title ? s.inputError : ""}`}
              {...register("title", {
                required: "标题不能为空",
                maxLength: {
                  value: 100,
                  message: "标题不能超过100个字符"
                },
                validate: {
                  notEmpty: value => {
                    return value && value.trim().length > 0 || "标题不能为空";
                  }
                }
              })}
              placeholder="请输入文章标题"
            />
            {errors.title && <div className={s.errorTip}>{errors.title.message}</div>}
          </div>

          {/* 封面图上传 - 增强版 */}
          <div className={s.formGroup}>
            <label className={s.formLabel}>封面图</label>
            
            {/* 隐藏的文件输入 */}
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleCoverUpload}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
            
            {/* 封面预览区域 */}
            <div className={s.coverPreviewArea}>
              {coverPreview ? (
                <div className={s.coverPreviewWithActions}>
                  <img
                    src={coverPreview}
                    alt="封面预览"
                    className={s.coverPreviewImage}
                  />
                  <div className={s.coverActions}>
                    <button 
                      type="button" 
                      className={s.coverActionBtn}
                      onClick={handleSelectCover}
                      disabled={isUploading}
                    >
                      {isUploading ? '上传中...' : '更换图片'}
                    </button>
                    <button 
                      type="button" 
                      className={`${s.coverActionBtn} ${s.removeBtn}`}
                      onClick={handleRemoveCover}
                      disabled={isUploading}
                    >
                      移除
                    </button>
                  </div>
                  {coverUrl && (
                    <div className={s.coverStatus}>✅ 已保存到服务器</div>
                  )}
                  {!coverUrl && coverPreview && (
                    <div className={s.coverStatus}>⚠️ 仅本地预览，请保存文章</div>
                  )}
                </div>
              ) : (
                <div 
                  className={s.coverUploadPlaceholder}
                  onClick={handleSelectCover}
                >
                  <div className={s.uploadIcon}>📷</div>
                  <div className={s.uploadText}>点击选择封面图片</div>
                  <div className={s.uploadTip}>支持 JPG、PNG 格式，最大 5MB</div>
                </div>
              )}
            </div>
            
            {isUploading && (
              <div className={s.uploadingTip}>🔄 正在上传封面图...</div>
            )}
          </div>

          {/* 文章内容 */}
          <div className={s.formGroup}>
            <label className={s.formLabel}>
              文章内容 <span className={s.required}>*</span>
            </label>
            <RichEditor 
              value={content} 
              onChange={handleContentChange} 
              key={articleId || 'new'}
            />
            
            {!content && (
              <div className={s.tipText}>请输入文章正文内容（草稿可为空）</div>
            )}
            {content && (
              <div className={s.successTip}>✓ 内容已输入 ({content.length} 字符)</div>
            )}
          </div>

          {/* 分类和标签 */}
          <div className={s.formRow}>
            <div className={`${s.formGroup} ${s.formGroupHalf}`}>
              <label htmlFor="category" className={s.formLabel}>
                文章分类 <span className={s.required}>*</span>
              </label>
              <select
                id="category"
                className={s.formSelect}
                {...register("category", { 
                  required: "请选择分类"
                })}
              >
                {CATEGORY_OPTIONS.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && <div className={s.errorTip}>{errors.category.message}</div>}
            </div>

            <div className={`${s.formGroup} ${s.formGroupHalf}`}>
              <label htmlFor="tags" className={s.formLabel}>
                文章标签
              </label>
              <input
                type="text"
                id="tags"
                className={s.formInput}
                {...register("tags")}
                placeholder="例如：React,Node.js,JavaScript"
              />
              <div className={s.tipText}>最多支持5个标签，用逗号分隔</div>
            </div>
          </div>

          {/* 提交按钮 */}
          <div className={s.submitGroup}>
            <button
              type="button"
              className={s.cancelBtn}
              onClick={() => navigate("/myblog")}
              disabled={isSubmitting}
            >
              取消
            </button>
            <div className={s.actionButtons}>
              <button
                type="button"
                className={s.draftBtn}
                onClick={handleSubmit(onSaveDraft)}
                disabled={isSubmitting || !isFormValidForDraft()}
              >
                {isSubmitting ? "保存中..." : "保存为草稿"}
              </button>
              <button
                type="submit"
                className={s.publishBtn}
                disabled={isSubmitting || !isFormValidForPublish()}
              >
                {isSubmitting ? "发布中..." : "发布博客"}
              </button>
            </div>
            <div className={s.validationTips}>
              {!isFormValidForDraft() && (
                <div className={s.validationTip}>
                  💡 输入标题后即可保存为草稿
                </div>
              )}
              {isFormValidForDraft() && !isFormValidForPublish() && (
                <div className={s.draftTip}>
                  ✅ 可以保存为草稿，发布需要填写完整内容
                </div>
              )}
              {isFormValidForPublish() && (
                <div className={s.successTip}>
                  ✅ 可以发布文章
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}