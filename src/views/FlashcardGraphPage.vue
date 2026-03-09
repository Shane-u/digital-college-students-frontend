<template>
  <div class="flashcard-graph-page">
    <button v-if="viewState !== 'COMPARE'" class="flashcard-back-button" type="button" @click="goBack">
      返回
    </button>
    <!-- 全局加载态：避免刷新时闪现错误视图 -->
    <div v-if="pageLoading" class="flashcard-page-loading">
      <div class="flashcard-page-loading-inner">
        <div class="flashcard-page-spinner"></div>
        <div class="flashcard-page-loading-text">正在加载闪卡数据...</div>
      </div>
    </div>
    
    <template v-else>
      <!-- 视图状态：TEMP_ZONE | GRAPH | REVIEW | EDIT | COMPARE -->
      <!-- 暂存区 -->
      <FlashcardTempZone 
        v-if="viewState === 'TEMP_ZONE'"
        :flashcards="tempZoneFlashcards"
        @confirm-save="handleConfirmSave"
        @preview="handlePreview"
        @delete="handleDeleteTemp"
        @card-click="handleCardClick"
        @back-to-graph="handleBackToGraph"
      />
      
      <!-- 图谱（key 确保有 nodes 时重新挂载并渲染） -->
      <FlashcardGraph 
        v-else-if="viewState === 'GRAPH'"
        :key="'graph-' + (graphData.nodes?.length || 0)"
        :flashcards="savedFlashcards"
        :graph-nodes="graphData.nodes"
        :graph-links="graphData.links"
        :user-id="currentUserId"
        :user-avatar="currentUserAvatar"
        :user-nickname="currentUserNickname"
        :highlight-ids="highlightIds"
        @node-click="handleNodeClick"
        @go-to-temp="goToTemp"
        @compare="viewState = 'COMPARE'"
        @refresh="loadSavedFlashcards"
        @search="handleGraphSearch"
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
        :graph-nodes="graphData.nodes"
        :graph-links="graphData.links"
        :user-id="currentUserId"
        :highlight-ids="highlightIds"
        @close="viewState = 'GRAPH'"
        @node-click="handleNodeClick"
        @go-to-temp="goToTemp"
      />
      
      <!-- 层级标签选择页面 -->
      <CategoryHierarchySelect
        v-else-if="viewState === 'CATEGORY_SELECT'"
        :card="pendingSaveCard"
        :category-tree="categoryTree"
        @confirm="handleCategoryHierarchyConfirm"
        @back="handleCategoryHierarchyBack"
      />
    </template>
    
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
import { normalizeProfile } from '../utils/profile'

const route = useRoute()
const router = useRouter()

// 视图状态：TEMP_ZONE（暂存区）| GRAPH（图谱）| REVIEW（复习）| EDIT（编辑）| COMPARE（对比）| CATEGORY_SELECT（层级标签选择）
// 初始状态根据当前路由同步决定，避免刷新 /flashcard-temp 时先闪一下图谱视图
const initialView =
  (route.path === '/flashcard-temp' || route.query.view === 'temp')
    ? 'TEMP_ZONE'
    : 'GRAPH'
const viewState = ref(initialView)
const pageLoading = ref(true)
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
// 当前用户头像/昵称（用于右侧悬挂彩带头像显示）
const currentUserAvatar = ref('')
const currentUserNickname = ref('U')
// 图谱查询命中的闪卡业务 ID 列表，用于前端高亮节点
const highlightIds = ref([])

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
  // 单独的暂存区路由：直接进入暂存区视图
  if (route.path === '/flashcard-temp') {
    viewState.value = 'TEMP_ZONE'
    return
  }
  
  // 如果路由显式指定了视图（例如 ?view=temp），优先使用
  const viewFromQuery = route.query.view
  if (viewFromQuery === 'temp') {
    viewState.value = 'TEMP_ZONE'
    return
  }
  if (viewFromQuery === 'graph') {
    viewState.value = 'GRAPH'
    return
  }

  // 其次：使用上一次停留的视图（刷新后保持在同一个子页面）
  const lastView = localStorage.getItem('flashcard_last_view')
  const allowedViews = ['TEMP_ZONE', 'GRAPH', 'REVIEW', 'EDIT', 'COMPARE', 'CATEGORY_SELECT']
  if (lastView && allowedViews.includes(lastView)) {
    viewState.value = lastView
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
    // 先并行获取用户信息（决定是否走 Neo4j 图谱接口）
    const userResult = await Promise.allSettled([getMyProfile().catch(() => null)])

    let userId = null
    if (userResult[0].status === 'fulfilled' && userResult[0].value) {
      const p = normalizeProfile(userResult[0].value || {})
      userId = userResult[0].value?.id ?? userResult[0].value?.userId ?? null
      currentUserAvatar.value = p.avatar || ''
      currentUserNickname.value = p.nickname || 'U'
    } else {
      currentUserAvatar.value = ''
      currentUserNickname.value = 'U'
    }
    currentUserId.value = userId

    // 有 userId：优先走 Neo4j 代理返回 nodes/links（能渲染完整层级节点）
    // 没有 userId：回退到后端 list（可能只渲染闪卡节点）
    const params = userId != null ? { userId } : {}
    const list = await flashCardApi.getGraphData(params)
    if (list && Array.isArray(list.nodes) && Array.isArray(list.links)) {
      graphData.value = { nodes: list.nodes, links: list.links }
      savedFlashcards.value = list.cards || []
    } else {
      graphData.value = { nodes: [], links: [] }
      savedFlashcards.value = Array.isArray(list) ? list : []
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

// 图谱搜索：对接 Neo4j 闪卡图谱查询接口（/flash-card/neo4j/search）
// 仅在图谱视图下使用，keyword 为空时清除高亮；不重新加载图谱数据
const handleGraphSearch = async (keyword) => {
  const kw = (keyword || '').trim()
  // 没有关键词：清空高亮，保持原图谱
  if (!kw) {
    highlightIds.value = []
    return
  }
  try {
    const list = await flashCardApi.searchInNeo4j({
      type: 'FLASHCARD',
      keyword: kw
    })
    const arr = Array.isArray(list) ? list : (list?.data || [])
    // 记录命中的业务闪卡 ID，用于前端高亮节点（通过节点 properties.id 或 data.id 匹配）
    highlightIds.value = arr
      .map(item => item && (item.id ?? item.flashcardId ?? item.cardId))
      .filter(id => id != null && String(id).trim() !== '')
      .map(id => String(id))
  } catch (error) {
    console.error('图谱搜索失败:', error)
    ElMessage.error(error?.message || '图谱搜索失败，请重试')
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

// 跳转到暂存区视图，并同步路由到 /flashcard-temp
const goToTemp = () => {
  viewState.value = 'TEMP_ZONE'
  if (route.path !== '/flashcard-temp') {
    router.replace({ path: '/flashcard-temp' })
  }
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

// 从暂存页头部“返回图谱页面”按钮返回
const handleBackToGraph = () => {
  viewState.value = 'GRAPH'
  if (route.path !== '/flashcard-graph') {
    router.replace({ path: '/flashcard-graph' })
  }
}

const goBack = () => {
  router.back()
}

onMounted(async () => {
  pageLoading.value = true
  await Promise.all([
    loadTempZone(),
    loadSavedFlashcards()
  ])
  initViewState()
  pageLoading.value = false
  // 添加 ESC 键监听
  window.addEventListener('keydown', handleEscKey)
})

onUnmounted(() => {
  // 移除 ESC 键监听
  window.removeEventListener('keydown', handleEscKey)
})

// 监听路由变化（从其他页面进入时）
watch(() => route.path, (newPath) => {
  if (newPath === '/flashcard-graph' || newPath === '/flashcard-temp') {
    initViewState()
  }
})

// 持久化当前视图状态，刷新后保持在最近一次页面（包括图谱 / 暂存区 / 对比等）
watch(
  viewState,
  (val) => {
    localStorage.setItem('flashcard_last_view', val)
  },
  { immediate: true }
)
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

.flashcard-back-button {
  position: fixed;
  top: 18px;
  left: 24px;
  z-index: 1100;
  padding: 8px 24px;
  border-radius: 999px;
  border: none;
  background: rgba(0, 0, 0, 0.5);
  color: #f9fafb;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.35);
  transition:
    background 0.16s ease,
    transform 0.16s ease,
    box-shadow 0.16s ease;
}

.flashcard-back-button:hover {
  background: #374151;
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.4);
}


.flashcard-page-loading {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.flashcard-page-loading-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #64748b;
  font-size: 14px;
}

.flashcard-page-spinner {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid rgba(148, 163, 184, 0.35);
  border-top-color: #4f46e5;
  animation: flashcard-page-spin 0.7s linear infinite;
}

@keyframes flashcard-page-spin {
  to {
    transform: rotate(360deg);
  }
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

