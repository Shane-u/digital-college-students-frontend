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
    
    <!-- 图谱 -->
    <FlashcardGraph 
      v-else-if="viewState === 'GRAPH'"
      :flashcards="savedFlashcards"
      @node-click="handleNodeClick"
      @go-to-temp="viewState = 'TEMP_ZONE'"
      @compare="viewState = 'COMPARE'"
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
    
    <!-- 分类选择对话框 -->
    <CategorySelectDialog
      v-model="showCategoryDialog"
      :card="pendingSaveCard"
      :category-tree="categoryTree"
      @confirm="handleCategoryConfirm"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FlashcardTempZone from '../components/FlashCard/FlashcardTempZone.vue'
import FlashcardGraph from '../components/FlashCard/FlashcardGraph.vue'
import FlashcardReview from '../components/FlashCard/FlashcardReview.vue'
import FlashcardEdit from '../components/FlashCard/FlashcardEdit.vue'
import CompareView from '../components/FlashCard/CompareView.vue'
import CategorySelectDialog from '../components/FlashCard/CategorySelectDialog.vue'
import { flashCardApi } from '../api/flashCard'
import { ElMessage, ElDialog } from 'element-plus'

const route = useRoute()
const router = useRouter()

// 视图状态：TEMP_ZONE（暂存区）| GRAPH（图谱）| REVIEW（复习）| EDIT（编辑）| COMPARE（对比）
const viewState = ref('GRAPH')
const tempZoneFlashcards = ref([])
const savedFlashcards = ref([])
const currentCard = ref(null)
const reviewCards = ref([])
const currentReviewIndex = ref(0)
const showCategoryDialog = ref(false)
const pendingSaveCard = ref(null)
const categoryTree = ref([])

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

// 加载已保存的闪卡（图谱数据）
const loadSavedFlashcards = async () => {
  try {
    const data = await flashCardApi.getGraphData()
    // API返回格式可能是 { flashcards: [...] } 或直接是数组
    savedFlashcards.value = Array.isArray(data) ? data : (data?.flashcards || data?.data || [])
  } catch (error) {
    console.error('加载闪卡图谱失败:', error)
    // 如果接口未实现，使用list接口作为fallback
    try {
      const list = await flashCardApi.list()
      savedFlashcards.value = Array.isArray(list) ? list : (list?.data || [])
    } catch (e) {
      console.error('使用list接口也失败:', e)
    }
  }
}

// 确认保存（需要选择分类）
const handleConfirmSave = async (card) => {
  // 加载分类树
  if (categoryTree.value.length === 0) {
    try {
      const tree = await flashCardApi.getCategoryTree()
      categoryTree.value = tree || []
    } catch (error) {
      console.error('加载分类树失败:', error)
      ElMessage.error('加载分类树失败')
      return
    }
  }
  
  pendingSaveCard.value = card
  showCategoryDialog.value = true
}

// 分类确认
const handleCategoryConfirm = (categoryPath) => {
  if (pendingSaveCard.value) {
    saveCardWithCategory(pendingSaveCard.value, categoryPath)
    showCategoryDialog.value = false
    pendingSaveCard.value = null
  }
}

// 保存卡片到数据库（带分类）
const saveCardWithCategory = async (card, categoryPath) => {
  try {
    await flashCardApi.confirmSave({
      id: card.id,
      categoryPath
    })
    ElMessage.success('保存成功')
    // 重新加载数据
    await loadTempZone()
    await loadSavedFlashcards()
    // 切换到图谱视图
    viewState.value = 'GRAPH'
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败，请重试')
  }
}

// 预览
const handlePreview = (card) => {
  currentCard.value = card
  // TODO: 打开预览对话框
  ElMessage.info('预览功能开发中')
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
  height: 100vh;
  overflow: hidden;
}
</style>

