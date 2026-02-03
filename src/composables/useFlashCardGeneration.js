import { ref, provide, inject } from 'vue'

const FLASH_CARD_GENERATION_KEY = Symbol('flashCardGeneration')

// 创建全局状态
export function createFlashCardGenerationState() {
  const isGenerating = ref(false)
  const progress = ref(0) // 0-100
  const currentFlashCardId = ref(null)
  const progressMessage = ref('')
  
  const state = {
    isGenerating,
    progress,
    currentFlashCardId,
    progressMessage
  }
  
  provide(FLASH_CARD_GENERATION_KEY, state)
  return state
}

// 使用状态
export function useFlashCardGeneration() {
  const state = inject(FLASH_CARD_GENERATION_KEY)
  if (!state) {
    throw new Error('useFlashCardGeneration must be used within a component that calls createFlashCardGenerationState')
  }
  return state
}
