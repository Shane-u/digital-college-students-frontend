<template>
  <div class="flashcard-edit-container">
    <div class="edit-header">
      <button class="back-btn" @click="handleBack">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        返回
      </button>
      <h2 class="edit-title">编辑闪卡</h2>
      <button class="delete-btn" @click="handleDelete">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
        删除
      </button>
    </div>

    <div class="edit-content">
      <!-- 标题编辑 -->
      <div class="form-group">
        <label class="form-label">标题</label>
        <input 
          v-model="formData.title"
          type="text"
          class="form-input"
          placeholder="请输入闪卡标题"
        />
      </div>

      <!-- 内容编辑 -->
      <div class="form-group">
        <label class="form-label">内容</label>
        <textarea 
          v-model="formData.content"
          class="form-textarea"
          rows="8"
          placeholder="请输入闪卡内容（支持Markdown）"
        ></textarea>
      </div>

      <!-- 标签编辑 -->
      <div class="form-group">
        <label class="form-label">标签</label>
        <div class="tags-input-wrapper">
          <div class="tags-display">
            <span 
              v-for="(tag, index) in formData.tags"
              :key="index"
              class="tag-item"
            >
              {{ tag }}
              <button 
                class="tag-remove"
                @click="removeTag(index)"
              >
                ×
              </button>
            </span>
          </div>
          <input 
            v-model="newTag"
            type="text"
            class="tag-input"
            placeholder="输入标签后按回车添加"
            @keyup.enter="addTag"
          />
        </div>
      </div>

      <!-- 分类层级选择 -->
      <div class="form-group">
        <label class="form-label">分类层级</label>
        <div class="category-selector">
          <div v-if="categoryTree.length === 0" class="category-loading">
            加载分类树中...
          </div>
          <CategoryTree 
            v-else
            :tree="categoryTree"
            :selected-path="formData.categoryPath"
            @select="handleCategorySelect"
          />
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="form-actions">
        <button class="btn btn-cancel" @click="handleBack">取消</button>
        <button class="btn btn-save" @click="handleSave">保存</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { flashCardApi } from '../../api/flashCard'
import CategoryTree from './CategoryTree.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({
  card: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['back', 'saved', 'deleted'])

const formData = ref({
  title: '',
  content: '',
  tags: [],
  categoryPath: []
})

const newTag = ref('')
const categoryTree = ref([])
const loading = ref(false)

// 初始化表单数据
onMounted(async () => {
  formData.value = {
    title: props.card.title || '',
    content: props.card.content || '',
    tags: [...(props.card.tags || [])],
    categoryPath: props.card.categoryPath || []
  }
  
  // 加载分类树
  try {
    const tree = await flashCardApi.getCategoryTree()
    categoryTree.value = tree || []
  } catch (error) {
    console.error('加载分类树失败:', error)
  }
})

// 添加标签
const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !formData.value.tags.includes(tag)) {
    formData.value.tags.push(tag)
    newTag.value = ''
  }
}

// 移除标签
const removeTag = (index) => {
  formData.value.tags.splice(index, 1)
}

// 选择分类
const handleCategorySelect = (path) => {
  formData.value.categoryPath = path
}

// 保存
const handleSave = async () => {
  if (!formData.value.title.trim()) {
    ElMessage.warning('请输入标题')
    return
  }
  
  if (!formData.value.content.trim()) {
    ElMessage.warning('请输入内容')
    return
  }
  
  loading.value = true
  try {
    await flashCardApi.updateWithTags({
      id: props.card.id,
      title: formData.value.title,
      content: formData.value.content,
      tags: formData.value.tags,
      categoryPath: formData.value.categoryPath
    })
    ElMessage.success('保存成功')
    emit('saved', { ...formData.value })
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败，请重试')
  } finally {
    loading.value = false
  }
}

// 删除
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('确定要删除这张闪卡吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await flashCardApi.delete(props.card.id)
    ElMessage.success('删除成功')
    emit('deleted')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败，请重试')
    }
  }
}

// 返回
const handleBack = () => {
  emit('back')
}
</script>

<style scoped>
.flashcard-edit-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 32px;
  min-height: 100vh;
  background: #f8fafc;
}

.edit-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.back-btn,
.delete-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  color: #64748b;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #f8fafc;
  color: #475569;
}

.delete-btn {
  color: #ef4444;
  border-color: #fecaca;
}

.delete-btn:hover {
  background: #fef2f2;
  color: #dc2626;
}

.edit-title {
  font-size: 24px;
  font-weight: 900;
  color: #1e293b;
  margin: 0;
}

.edit-content {
  background: white;
  border-radius: 24px;
  padding: 48px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.form-group {
  margin-bottom: 32px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 700;
  color: #475569;
  margin-bottom: 12px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.2s;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #4f46e5;
}

.form-textarea {
  resize: vertical;
  min-height: 200px;
}

.tags-input-wrapper {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
  min-height: 60px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.tags-display {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #f1f5f9;
  border-radius: 8px;
  font-size: 14px;
  color: #475569;
}

.tag-remove {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  padding: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tag-remove:hover {
  color: #ef4444;
}

.tag-input {
  flex: 1;
  min-width: 200px;
  border: none;
  outline: none;
  padding: 6px;
  font-size: 14px;
}

.category-selector {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
}

.category-loading {
  text-align: center;
  color: #94a3b8;
  padding: 40px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 40px;
  padding-top: 32px;
  border-top: 1px solid #e2e8f0;
}

.btn {
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-cancel {
  background: #f1f5f9;
  color: #64748b;
}

.btn-cancel:hover {
  background: #e2e8f0;
}

.btn-save {
  background: #4f46e5;
  color: white;
}

.btn-save:hover {
  background: #4338ca;
}
</style>

