<template>
  <div class="flashcard-graph-page">
    <!-- 视图状态：TEMP_ZONE | GRAPH | REVIEW | EDIT | COMPARE -->
    <!-- 暂存区 -->
    <FlashcardTempZone 
      v-if="viewState === 'TEMP_ZONE'"
      :flashcards="tempZoneFlashcards"
      @confirm-save="handleConfirmSave"
      @preview="handlePreview"
      @delete="handleDeleteTemp"
      @card-click="handleCardClick"
    />
    
    <!-- 图谱（key 确保有 nodes 时重新挂载并渲染） -->
    <FlashcardGraph 
      v-else-if="viewState === 'GRAPH'"
      :key="'graph-' + (graphData.nodes?.length || 0)"
      :flashcards="savedFlashcards"
      :graph-nodes="graphData.nodes"
      :graph-links="graphData.links"
      :user-id="currentUserId"
      @node-click="handleNodeClick"
      @go-to-temp="viewState = 'TEMP_ZONE'"
      @compare="viewState = 'COMPARE'"
      @refresh="loadSavedFlashcards"
    />
    
    <!-- 复习 -->
    <FlashcardReview 
      v-else-if="viewState === 'REVIEW'"
      :card="currentCard"
      :total-cards="reviewCards.length"
      :current-index="currentReviewIndex"
      @back="viewState = 'GRAPH'"
      @review="handleReview"
      @next="handleNextReview"
    />
    
    <!-- 编辑 -->
    <FlashcardEdit 
      v-else-if="viewState === 'EDIT'"
      :card="currentCard"
      @back="viewState = 'GRAPH'"
      @saved="handleSaved"
      @deleted="handleDeleted"
    />
    
    <!-- 对比 -->
    <CompareView 
      v-else-if="viewState === 'COMPARE'"
      :flashcards="savedFlashcards"
      @close="viewState = 'GRAPH'"
      @node-click="handleNodeClick"
      @go-to-temp="viewState = 'TEMP_ZONE'"
    />
    
    <!-- 层级标签选择页面 -->
    <CategoryHierarchySelect
      v-else-if="viewState === 'CATEGORY_SELECT'"
      :card="pendingSaveCard"
      :category-tree="categoryTree"
      @confirm="handleCategoryHierarchyConfirm"
      @back="handleCategoryHierarchyBack"
    />
    
    <!-- 分类选择对话框（保留作为备用） -->
    <CategorySelectDialog
      v-model="showCategoryDialog"
      :card="pendingSaveCard"
      :category-tree="categoryTree"
      @confirm="handleCategoryConfirm"
    />
    
    <!-- 预览弹窗 -->
    <div v-if="showPreviewModal" class="preview-modal-overlay" @click="closePreviewModal">
      <div class="preview-modal-content" @click.stop>
        <div class="preview-modal-header">
          <h2 class="preview-modal-title">{{ previewCard?.title || '闪卡预览' }}</h2>
          <button class="preview-close-btn" @click="closePreviewModal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="preview-modal-body">
          <div 
            class="preview-content markdown-content" 
            v-html="getPreviewContent(previewCard)"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FlashcardTempZone from '../components/FlashCard/FlashcardTempZone.vue'
import FlashcardGraph from '../components/FlashCard/FlashcardGraph.vue'
import FlashcardReview from '../components/FlashCard/FlashcardReview.vue'
import FlashcardEdit from '../components/FlashCard/FlashcardEdit.vue'
import CompareView from '../components/FlashCard/CompareView.vue'
import CategorySelectDialog from '../components/FlashCard/CategorySelectDialog.vue'
import CategoryHierarchySelect from '../components/FlashCard/CategoryHierarchySelect.vue'
import { flashCardApi } from '../api/flashCard'
import { getMyProfile } from '../api/user'
import { ElMessage, ElDialog } from 'element-plus'
import { sanitizeHtml } from '../utils/sanitizeHtml'
import { renderMarkdownToHtml } from '../utils/markdownRender'

const route = useRoute()
const router = useRouter()

// 视图状态：TEMP_ZONE（暂存区）| GRAPH（图谱）| REVIEW（复习）| EDIT（编辑）| COMPARE（对比）| CATEGORY_SELECT（层级标签选择）
const viewState = ref('GRAPH')
const tempZoneFlashcards = ref([])
const savedFlashcards = ref([])
const currentCard = ref(null)
const reviewCards = ref([])
const currentReviewIndex = ref(0)
const showCategoryDialog = ref(false)
const pendingSaveCard = ref(null)
const categoryTree = ref([])
const showPreviewModal = ref(false)
const previewCard = ref(null)
// Neo4j 代理返回的原始 nodes/links，用于图谱直接渲染（避免只认 Flashcard 导致 data:[]）
const graphData = ref({ nodes: [], links: [] })
// 当前用户 ID，用于 Neo4j 图谱编辑/删除时指定数据库
const currentUserId = ref(null)

// 检查是否有正在生成的闪卡
const hasGeneratingCards = computed(() => {
  return tempZoneFlashcards.value.some(card => card.isGenerating)
})

// 检查是否是首次生成后进入
const isFirstTimeAfterGenerate = computed(() => {
  // 从localStorage检查是否有标记
  const flag = localStorage.getItem('flashcard_first_generate')
  return flag === 'true'
})

// 初始化视图状态
const initViewState = () => {
  // 如果路由显式指定了视图（例如 ?view=temp），优先使用
  const viewFromQuery = route.query.view
  if (viewFromQuery === 'temp') {
    viewState.value = 'TEMP_ZONE'
    return
  }
  
  // 检查是否有正在生成的闪卡
  if (hasGeneratingCards.value) {
    viewState.value = 'TEMP_ZONE'
    return
  }
  
  // 检查是否是首次生成后
  if (isFirstTimeAfterGenerate.value) {
    viewState.value = 'TEMP_ZONE'
    localStorage.removeItem('flashcard_first_generate')
    return
  }
  
  // 默认显示图谱
  viewState.value = 'GRAPH'
}

// 加载暂存区数据
const loadTempZone = async () => {
  try {
    const result = await flashCardApi.getTempZoneList()
    // API返回格式可能是数组或 { data: [...] }
    const cards = Array.isArray(result) ? result : (result?.data || [])
    tempZoneFlashcards.value = cards
    
    // 检查生成中的卡片，轮询进度
    const generatingCards = cards.filter(c => c.isGenerating)
    if (generatingCards.length > 0) {
      generatingCards.forEach(card => {
        pollCardProgress(card.id)
      })
    }
  } catch (error) {
    console.error('加载暂存区失败:', error)
    // 如果接口未实现，使用空数组
    tempZoneFlashcards.value = []
  }
}

// 轮询闪卡生成进度
const pollCardProgress = async (cardId) => {
  const maxAttempts = 60 // 最多轮询60次（5分钟）
  let attempts = 0
  
  const poll = async () => {
    if (attempts >= maxAttempts) {
      // 超时，标记为失败
      updateCardProgress(cardId, 100, false, '生成超时')
      return
    }
    
    try {
      const status = await flashCardApi.status(cardId)
      if (status.progress !== undefined) {
        updateCardProgress(cardId, status.progress, status.isGenerating, status.message)
        
        if (status.isGenerating && status.progress < 100) {
          attempts++
          setTimeout(poll, 5000) // 5秒后再次查询
        }
      }
    } catch (error) {
      console.error('查询进度失败:', error)
      attempts++
      if (attempts < maxAttempts) {
        setTimeout(poll, 5000)
      }
    }
  }
  
  poll()
}

// 更新卡片进度
const updateCardProgress = (cardId, progress, isGenerating, message) => {
  const index = tempZoneFlashcards.value.findIndex(c => c.id === cardId)
  if (index !== -1) {
    tempZoneFlashcards.value[index] = {
      ...tempZoneFlashcards.value[index],
      progress,
      isGenerating,
      progressMessage: message
    }
  }
}

// 加载已保存的闪卡（并行请求用户信息和图谱数据，提升响应速度）
const loadSavedFlashcards = async () => {
  try {
    // 并行请求：先不传 userId 快速显示图谱，用户信息返回后再更新
    const [userResult, listResult] = await Promise.allSettled([
      getMyProfile().catch(() => null),
      flashCardApi.getGraphData({})
    ])
    
    // 处理用户信息
    let userId = null
    if (userResult.status === 'fulfilled' && userResult.value) {
      userId = userResult.value?.id ?? userResult.value?.userId ?? null
      currentUserId.value = userId
    }
    
    // 处理图谱数据
    if (listResult.status === 'fulfilled') {
      const list = listResult.value
      if (list && Array.isArray(list.nodes) && Array.isArray(list.links)) {
        graphData.value = { nodes: list.nodes, links: list.links }
        savedFlashcards.value = list.cards || []
      } else {
        graphData.value = { nodes: [], links: [] }
        savedFlashcards.value = Array.isArray(list) ? list : []
      }
      
      // 如果用户信息已返回且有 userId，且之前未传 userId，则重新加载一次（可选，避免重复请求）
      // 这里先不重新加载，因为图谱已显示，用户信息主要用于编辑/删除时的权限
    } else {
      // 如果图谱请求失败，尝试用 userId 再请求一次（如果用户信息已返回）
      if (userId) {
        try {
          const list = await flashCardApi.getGraphData({ userId })
          if (list && Array.isArray(list.nodes) && Array.isArray(list.links)) {
            graphData.value = { nodes: list.nodes, links: list.links }
            savedFlashcards.value = list.cards || []
          } else {
            graphData.value = { nodes: [], links: [] }
            savedFlashcards.value = Array.isArray(list) ? list : []
          }
        } catch (e) {
          console.error('使用 userId 重新加载图谱失败:', e)
        }
      }
    }
  } catch (error) {
    console.error('加载闪卡图谱失败:', error)
    savedFlashcards.value = []
    graphData.value = { nodes: [], links: [] }
  }
}

// 确认保存（需要选择分类）- 进入层级标签选择页面
const handleConfirmSave = async (card) => {
  // 加载分类树
  if (categoryTree.value.length === 0) {
    try {
      const tree = await flashCardApi.getCategoryTree()
      // API 返回可能是 { data: [...] } 或直接是数组
      // getCategoryTree 已经处理了 fallback，如果接口不存在会返回默认分类树
      categoryTree.value = Array.isArray(tree) ? tree : (tree?.data || tree?.tree || [])
      
      // 确保有数据
      if (categoryTree.value.length === 0) {
        console.warn('分类树为空，使用空数组')
      }
    } catch (error) {
      console.error('加载分类树失败:', error)
      // 如果 API 层也没有 fallback，至少让用户能看到页面（空分类树）
      categoryTree.value = []
      ElMessage.warning('分类树加载失败，请稍后重试')
    }
  }
  
  pendingSaveCard.value = card
  // 进入层级标签选择页面
  viewState.value = 'CATEGORY_SELECT'
}

// 层级标签选择确认（子组件 emit 传：pathStr, categoryPath；兼容只传一个对象的情况）
const handleCategoryHierarchyConfirm = async (...args) => {
  if (!pendingSaveCard.value) return
  
  let path = ''
  let pathArr = []
  if (args.length >= 2) {
    path = typeof args[0] === 'string' ? args[0].trim() : ''
    pathArr = Array.isArray(args[1]) ? args[1] : []
  } else if (args.length === 1 && args[0] && typeof args[0] === 'object') {
    const o = args[0]
    path = (o.categoryPathString ?? o['层级标签路径'] ?? o.archivePath ?? o.hierarchyPath ?? '').trim()
    pathArr = Array.isArray(o.categoryPath) ? o.categoryPath : []
  }
  if (!path && pathArr.length > 0) path = pathArr.join(' / ')

  try {
    await saveCardWithCategory(pendingSaveCard.value, pathArr, path)
    viewState.value = 'GRAPH'
    pendingSaveCard.value = null
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error(error?.message || '保存失败，请重试')
  }
}

// 层级标签选择返回
const handleCategoryHierarchyBack = () => {
  viewState.value = 'TEMP_ZONE'
  pendingSaveCard.value = null
}

// 分类确认（保留作为备用）
const handleCategoryConfirm = (categoryPath) => {
  if (pendingSaveCard.value) {
    saveCardWithCategory(pendingSaveCard.value, categoryPath)
    showCategoryDialog.value = false
    pendingSaveCard.value = null
  }
}

// 保存卡片到数据库（层级标签路径 = 当前归档路径，必须发给后端）
const saveCardWithCategory = async (card, categoryPath, categoryPathString) => {
  const archivePath = String(categoryPathString ?? '').trim() || (categoryPath?.length ? categoryPath.join(' / ') : '')
  if (!archivePath) {
    ElMessage.error('请先选择层级标签（当前归档路径不能为空）')
    throw new Error('层级标签路径不能为空')
  }

  try {
    await flashCardApi.confirmSave({
      id: card.id,
      archivePath,
      categoryPath: categoryPath || []
    })
    ElMessage.success('保存成功')
    await loadTempZone()
    await loadSavedFlashcards()
  } catch (error) {
    console.error('保存失败:', error)
    throw error
  }
}

// 预览
const handlePreview = async (card) => {
  // 如果卡片没有 htmlContent，尝试从接口获取完整数据
  if (!card.htmlContent && !card.content && card.id) {
    try {
      // 优先尝试获取暂存区详情（如果是在暂存区）
      let detail
      if (viewState.value === 'TEMP_ZONE') {
        try {
          detail = await flashCardApi.getTempCardDetail(card.id)
          // API 返回可能是 { data: {...} } 格式
          if (detail && detail.data) {
            detail = detail.data
          }
        } catch (tempError) {
          // 如果暂存区接口失败，尝试普通详情接口
          detail = await flashCardApi.getDetail(card.id)
          if (detail && detail.data) {
            detail = detail.data
          }
        }
      } else {
        detail = await flashCardApi.getDetail(card.id)
        if (detail && detail.data) {
          detail = detail.data
        }
      }
      previewCard.value = detail || card
    } catch (error) {
      console.error('获取闪卡详情失败:', error)
      previewCard.value = card
    }
  } else {
    previewCard.value = card
  }
  showPreviewModal.value = true
}

// 关闭预览弹窗
const closePreviewModal = () => {
  showPreviewModal.value = false
  previewCard.value = null
}

// ESC 键关闭预览弹窗
const handleEscKey = (e) => {
  if (e.key === 'Escape' && showPreviewModal.value) {
    closePreviewModal()
  }
}

// 获取预览内容（始终使用 markdown 渲染，与 AI 回答的渲染逻辑一致）
const getPreviewContent = (card) => {
  if (!card) return ''
  // 优先使用 content 字段渲染 markdown（与 AI 回答一致）
  if (card.content) {
    return renderMarkdownToHtml(card.content)
  }
  // 如果没有 content，但有 htmlContent，也尝试渲染（可能是 markdown 格式的 HTML）
  if (card.htmlContent) {
    // 如果 htmlContent 看起来像是 markdown 文本，则渲染
    // 否则直接使用（已经是渲染好的 HTML）
    const htmlContentStr = String(card.htmlContent)
    // 简单判断：如果包含 markdown 标记（如 #、-、` 等），尝试作为 markdown 渲染
    if (htmlContentStr.includes('#') || htmlContentStr.includes('-') || htmlContentStr.includes('`')) {
      return renderMarkdownToHtml(htmlContentStr)
    }
    return sanitizeHtml(htmlContentStr)
  }
  return ''
}


// 删除暂存区卡片
const handleDeleteTemp = async (id) => {
  try {
    await flashCardApi.deleteTempCard(id)
    ElMessage.success('删除成功')
    await loadTempZone()
  } catch (error) {
    console.error('删除失败:', error)
    ElMessage.error('删除失败，请重试')
  }
}

// 点击卡片
const handleCardClick = (card) => {
  // 如果是生成中，不做处理
  if (card.isGenerating) return
  // 否则可以预览或编辑
  handlePreview(card)
}

// 节点点击（图谱中的节点）
const handleNodeClick = (card, mode) => {
  currentCard.value = card
  if (mode === 'review') {
    reviewCards.value = [card]
    currentReviewIndex.value = 0
    viewState.value = 'REVIEW'
  } else if (mode === 'edit') {
    viewState.value = 'EDIT'
  }
}

// 复习处理
const handleReview = (difficultyLevel) => {
  // 已经在FlashcardReview组件中处理
}

// 下一个复习
const handleNextReview = () => {
  currentReviewIndex.value++
  if (currentReviewIndex.value >= reviewCards.value.length) {
    // 复习完成
    viewState.value = 'GRAPH'
  } else {
    currentCard.value = reviewCards.value[currentReviewIndex.value]
  }
}

// 保存后
const handleSaved = () => {
  loadSavedFlashcards()
  viewState.value = 'GRAPH'
}

// 删除后
const handleDeleted = () => {
  loadSavedFlashcards()
  viewState.value = 'GRAPH'
}

onMounted(async () => {
  await Promise.all([
    loadTempZone(),
    loadSavedFlashcards()
  ])
  initViewState()
  // 添加 ESC 键监听
  window.addEventListener('keydown', handleEscKey)
})

onUnmounted(() => {
  // 移除 ESC 键监听
  window.removeEventListener('keydown', handleEscKey)
})

// 监听路由变化（从其他页面进入时）
watch(() => route.path, (newPath) => {
  if (newPath === '/flashcard-graph') {
    initViewState()
  }
})
</script>

<style scoped>
.flashcard-graph-page {
  width: 100%;
  min-height: 100vh;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

/* 预览弹窗样式 */
.preview-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.preview-modal-content {
  background: white;
  border-radius: 24px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}

@keyframes slideUp {
  from {
    transform: translateY(40px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.preview-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  border-bottom: 1px solid #f1f5f9;
  flex-shrink: 0;
}

.preview-modal-title {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  line-height: 1.4;
}

.preview-close-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: #f8fafc;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  padding: 0;
}

.preview-close-btn:hover {
  background: #f1f5f9;
  color: #475569;
  transform: scale(1.05);
}

.preview-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 32px;
  background: #fafbfc;
}

.preview-content {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* 使用与 AI 回答相同的 markdown 样式 */
.preview-content.markdown-content {
  font-size: 16px;
  line-height: 1.6;
  color: #1f1f1f;
}

.preview-content.markdown-content :deep(h1) {
  font-size: 1.55rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #1f1f1f;
}

.preview-content.markdown-content :deep(h2) {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: #1f1f1f;
}

.preview-content.markdown-content :deep(h3) {
  font-size: 1.15rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #1f1f1f;
}

.preview-content.markdown-content :deep(p) {
  font-size: 1em;
  margin-bottom: 1rem;
  color: #1f1f1f;
}

.preview-content.markdown-content :deep(ul),
.preview-content.markdown-content :deep(ol) {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.preview-content.markdown-content :deep(li) {
  margin-bottom: 0.25rem;
  font-size: 1em;
  color: #1f1f1f;
}

.preview-content.markdown-content :deep(code) {
  background-color: #f0f4f9;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: monospace;
  font-size: 1em;
}

.preview-content.markdown-content :deep(pre) {
  background-color: #f0f4f9;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 1rem;
}

.preview-content.markdown-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
}

.preview-content.markdown-content :deep(blockquote) {
  border-left: 4px solid #d3e3fd;
  padding-left: 1rem;
  color: #444746;
  font-style: italic;
  margin-bottom: 1rem;
}

.preview-content.markdown-content :deep(table) {
  width: 100%;
  max-width: 100%;
  margin: 1rem 0;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
}

.preview-content.markdown-content :deep(th),
.preview-content.markdown-content :deep(td) {
  padding: 0.75rem 1.25rem;
  border: 1px solid #e2e8f0;
  text-align: left;
  word-wrap: break-word;
  overflow-wrap: break-word;
  box-sizing: border-box;
}

.preview-content.markdown-content :deep(th) {
  background: #f7fafc;
  font-weight: 600;
  font-size: 1.1em;
  color: #2d3748;
}

.preview-content.markdown-content :deep(td) {
  font-size: 1.1em;
}

.preview-content.markdown-content :deep(tr:not(:first-child) td) {
  background: #fff;
}

.preview-content.markdown-content :deep(tr:hover td) {
  background: #f8fafc;
}

.preview-content.markdown-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1rem 0;
}

.preview-content.markdown-content :deep(a) {
  color: #2563EB;
  text-decoration: none;
  font-weight: 500;
}

.preview-content.markdown-content :deep(a:hover) {
  text-decoration: underline;
}

/* 滚动条样式 */
.preview-modal-body::-webkit-scrollbar {
  width: 8px;
}

.preview-modal-body::-webkit-scrollbar-track {
  background: transparent;
}

.preview-modal-body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.preview-modal-body::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>

