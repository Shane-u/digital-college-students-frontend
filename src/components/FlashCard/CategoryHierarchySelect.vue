<template>
  <div class="category-hierarchy-select">
    <!-- 头部 -->
    <div class="hierarchy-header">
      <div class="header-left">
        <button class="back-btn" @click="handleBack">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          取消并返回暂存区
        </button>
        <h2 class="page-title">选择归档层级</h2>
      </div>
      <button 
        class="confirm-btn"
        :disabled="!canConfirm"
        @click="handleConfirm"
      >
        完成并入库
      </button>
    </div>

    <!-- 内容区域 -->
    <div class="hierarchy-content">
      <!-- 所属课程（L2） -->
      <section class="hierarchy-section">
        <h3 class="section-title">所属课程</h3>
        <div class="course-grid">
          <button 
            v-for="course in filteredCourses" 
            :key="course.id"
            :class="['course-card', { active: selectedL2?.id === course.id }]"
            @click="handleSelectL2(course)"
          >
            <span class="course-name">{{ course.label || course.name }}</span>
          </button>
          <button 
            class="course-card add-course-card"
            @click="showAddDialog('L2')"
          >
            <span class="course-name">+ 增加其他课程</span>
          </button>
        </div>
      </section>

      <!-- 选择大类（L3） -->
      <section 
        :class="['hierarchy-section', { disabled: !selectedL2 }]"
      >
        <h3 class="section-title">选择大类</h3>
        <div class="category-tags">
          <button 
            v-for="category in selectedL2?.children || []"
            :key="category.id"
            :class="['category-tag', { active: selectedL3?.id === category.id }]"
            @click="handleSelectL3(category)"
          >
            {{ category.label || category.name }}
          </button>
          <button 
            class="category-tag add-tag"
            @click="showAddDialog('L3')"
          >
            + 增加分类
          </button>
        </div>
      </section>

      <!-- 选择小类（L4，可选） -->
      <section 
        v-if="selectedL3 && selectedL3.children && selectedL3.children.length > 0"
        class="hierarchy-section"
      >
        <h3 class="section-title">选择小类（可选）</h3>
        <div class="category-tags">
          <button 
            v-for="subCategory in selectedL3.children"
            :key="subCategory.id"
            :class="['category-tag', { active: selectedL4?.id === subCategory.id }]"
            @click="handleSelectL4(subCategory)"
          >
            {{ subCategory.label || subCategory.name }}
          </button>
          <button 
            class="category-tag add-tag"
            @click="showAddDialog('L4')"
          >
            + 增加分类
          </button>
        </div>
      </section>
    </div>

    <!-- 底部路径显示 -->
    <div class="hierarchy-footer">
      <div class="path-info">
        <span class="path-label">当前归档路径</span>
        <div class="path-value">{{ currentPath }}</div>
      </div>
    </div>

    <!-- 添加分类对话框 -->
    <div v-if="showAddModal" class="add-modal-overlay" @click.self="closeAddDialog">
      <div class="add-modal">
        <h3 class="modal-title">{{ addingLevel === 'L2' ? '新增课程' : '新增自定义分类' }}</h3>
        <input 
          ref="addInputRef"
          v-model="newCategoryName"
          class="modal-input"
          :placeholder="addingLevel === 'L2' ? '课程名称' : '分类名称'"
          @keyup.enter="handleAddCategory"
        />
        <div class="modal-actions">
          <button class="modal-btn cancel-btn" @click="closeAddDialog">取消</button>
          <button class="modal-btn confirm-btn" @click="handleAddCategory">确认</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  card: {
    type: Object,
    default: null
  },
  categoryTree: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['confirm', 'back'])

// 课程列表：移除内置“其他课程”，只保留“+ 增加其他课程”按钮入口
const filteredCourses = computed(() =>
  (props.categoryTree || []).filter(c => (c?.label || c?.name) !== '其他课程')
)

const selectedL2 = ref(null)
const selectedL3 = ref(null)
const selectedL4 = ref(null)

const showAddModal = ref(false)
const addingLevel = ref(null) // 'L2' | 'L3' | 'L4'
const newCategoryName = ref('')
const addInputRef = ref(null)

// 计算当前路径
const currentPath = computed(() => {
  const parts = ['根']
  if (selectedL2.value) parts.push(selectedL2.value.label || selectedL2.value.name)
  if (selectedL3.value) parts.push(selectedL3.value.label || selectedL3.value.name)
  if (selectedL4.value) parts.push(selectedL4.value.label || selectedL4.value.name)
  return parts.join(' / ')
})

// 是否可以确认（至少需要选择到 L3）
const canConfirm = computed(() => {
  return selectedL2.value && selectedL3.value
})

// 选择 L2（课程）
const handleSelectL2 = (course) => {
  selectedL2.value = course
  selectedL3.value = null
  selectedL4.value = null
}

// 选择 L3（大类）
const handleSelectL3 = (category) => {
  selectedL3.value = category
  selectedL4.value = null
}

// 选择 L4（小类）
const handleSelectL4 = (subCategory) => {
  selectedL4.value = subCategory
}

// 显示添加对话框
const showAddDialog = (level) => {
  addingLevel.value = level
  showAddModal.value = true
  newCategoryName.value = ''
  nextTick(() => {
    if (addInputRef.value) {
      addInputRef.value.focus()
    }
  })
}

// 关闭添加对话框
const closeAddDialog = () => {
  showAddModal.value = false
  addingLevel.value = null
  newCategoryName.value = ''
}

// 添加新分类
const handleAddCategory = () => {
  if (!newCategoryName.value.trim()) return
  
  const newCategory = {
    id: `custom-${Date.now()}`,
    label: newCategoryName.value.trim(),
    name: newCategoryName.value.trim(),
    children: []
  }
  
  if (addingLevel.value === 'L2') {
    // 添加到课程列表（需要访问 categoryTree，但它是 prop，不能直接修改）
    // 这里只能添加到本地状态，实际保存需要父组件处理
    // 暂时先选中新添加的课程
    selectedL2.value = newCategory
    selectedL3.value = null
    selectedL4.value = null
  } else if (addingLevel.value === 'L3' && selectedL2.value) {
    // 添加到 L2 的 children
    if (!selectedL2.value.children) {
      selectedL2.value.children = []
    }
    selectedL2.value.children.push(newCategory)
    selectedL3.value = newCategory
  } else if (addingLevel.value === 'L4' && selectedL3.value) {
    // 添加到 L3 的 children
    if (!selectedL3.value.children) {
      selectedL3.value.children = []
    }
    selectedL3.value.children.push(newCategory)
    selectedL4.value = newCategory
  }
  
  closeAddDialog()
}

// 确认保存：当前归档路径 = 层级标签路径，必须传给后端
const handleConfirm = () => {
  if (!canConfirm.value) return
  
  const categoryPath = []
  if (selectedL2.value) categoryPath.push(selectedL2.value.id)
  if (selectedL3.value) categoryPath.push(selectedL3.value.id)
  if (selectedL4.value) categoryPath.push(selectedL4.value.id)
  
  // 当前归档路径 = 层级标签路径，用 label/name 拼成 "根 / Web课程 / 后端开发 / Python"
  const pathStr = currentPath.value
  const pathToSend = (pathStr && pathStr.trim()) || categoryPath.join(' / ') || ''
  if (!pathToSend) return
  
  // 同时传字符串和数组，父组件用 ...args 兼容
  emit('confirm', pathToSend.trim(), categoryPath)
}

// 返回
const handleBack = () => {
  emit('back')
}
</script>

<style scoped>
.category-hierarchy-select {
  min-height: 100vh;
  width: 100%;
  max-width: 1000px;
  background: white;
  display: flex;
  flex-direction: column;
  padding: 48px;
  margin: 0 auto;
}

.hierarchy-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 48px;
  padding-bottom: 32px;
  border-bottom: 1px solid #f1f5f9;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 900;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 0;
  transition: color 0.2s;
}

.back-btn:hover {
  color: #64748b;
}

.page-title {
  font-size: 32px;
  font-weight: 900;
  color: #1e293b;
  margin: 0;
}

.confirm-btn {
  padding: 16px 40px;
  background: #4f46e5;
  color: white;
  font-size: 16px;
  font-weight: 900;
  border-radius: 16px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
}

.confirm-btn:hover:not(:disabled) {
  background: #4338ca;
  box-shadow: 0 6px 16px rgba(79, 70, 229, 0.3);
}

.confirm-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  box-shadow: none;
}

.hierarchy-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 48px;
}

.hierarchy-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hierarchy-section.disabled {
  opacity: 0.2;
  pointer-events: none;
  filter: grayscale(100%);
}

.section-title {
  font-size: 12px;
  font-weight: 900;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0;
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.course-card {
  padding: 24px;
  border-radius: 16px;
  border: 2px solid #f1f5f9;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.course-card:hover {
  border-color: #e2e8f0;
  background: #f1f5f9;
}

.course-card.active {
  border-color: #4f46e5;
  background: rgba(79, 70, 229, 0.05);
}

.course-card.add-course-card {
  border-style: dashed;
  border-color: #e2e8f0;
  background: white;
}

.course-card.add-course-card:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.course-name {
  font-size: 16px;
  font-weight: 900;
  color: #1e293b;
}

.course-card.add-course-card .course-name {
  color: #cbd5e1;
}

.course-card.add-course-card:hover .course-name {
  color: #94a3b8;
}

.category-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.category-tag {
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 900;
  border: 2px solid #f1f5f9;
  background: white;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
}

.category-tag:hover {
  border-color: #e2e8f0;
  background: #f8fafc;
}

.category-tag.active {
  background: #4f46e5;
  color: white;
  border-color: #4f46e5;
}

.category-tag.add-tag {
  border-style: dashed;
  border-color: #e2e8f0;
  color: #cbd5e1;
}

.category-tag.add-tag:hover {
  border-color: #cbd5e1;
  color: #94a3b8;
}

.hierarchy-footer {
  margin-top: 80px;
  padding: 32px;
  background: #1e293b;
  border-radius: 24px;
  color: white;
}

.path-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.path-label {
  font-size: 10px;
  font-weight: 700;
  color: #818cf8;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.path-value {
  font-size: 20px;
  font-weight: 900;
  color: white;
}

/* 添加分类对话框 */
.add-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.2s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.add-modal {
  background: white;
  padding: 40px;
  border-radius: 24px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-title {
  font-size: 20px;
  font-weight: 900;
  color: #1e293b;
  margin: 0 0 24px 0;
}

.modal-input {
  width: 100%;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: none;
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 24px;
  outline: none;
}

.modal-input:focus {
  background: #f1f5f9;
}

.modal-actions {
  display: flex;
  gap: 16px;
}

.modal-btn {
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: transparent;
  color: #94a3b8;
}

.cancel-btn:hover {
  color: #64748b;
}

.modal-btn.confirm-btn {
  background: #1e293b;
  color: white;
}

.modal-btn.confirm-btn:hover {
  background: #334155;
}
</style>
