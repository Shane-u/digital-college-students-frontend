<template>
  <div class="flashcard-review-container">
    <div class="review-header">
      <button class="back-btn" @click="handleBack">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        返回
      </button>
      <h2 class="review-title">闪卡复习</h2>
      <div class="review-progress">
        {{ currentIndex + 1 }} / {{ totalCards }}
      </div>
    </div>

    <div v-if="currentCard" class="review-content">
      <!-- 题目区域（挖空显示） -->
      <div class="question-area">
        <div class="question-label">题目</div>
        <div class="question-text" v-html="renderQuestion(currentCard)"></div>
      </div>

      <!-- 答案区域（默认隐藏，点击显示） -->
      <div class="answer-area" :class="{ 'revealed': showAnswer }">
        <div class="answer-label">答案</div>
        <div class="answer-text" v-html="renderAnswer(currentCard)"></div>
      </div>

      <!-- 显示答案按钮 -->
      <button 
        v-if="!showAnswer" 
        class="reveal-btn"
        @click="showAnswer = true"
      >
        显示答案
      </button>

      <!-- 难度选择按钮（显示答案后） -->
      <div v-if="showAnswer" class="difficulty-buttons">
        <button class="difficulty-btn restart" @click="handleReview(1)">
          <span class="difficulty-label">重来</span>
          <span class="difficulty-time">&lt;1分钟</span>
        </button>
        <button class="difficulty-btn hard" @click="handleReview(2)">
          <span class="difficulty-label">困难</span>
          <span class="difficulty-time">6分钟</span>
        </button>
        <button class="difficulty-btn good" @click="handleReview(3)">
          <span class="difficulty-label">良好</span>
          <span class="difficulty-time">10分钟</span>
        </button>
        <button class="difficulty-btn easy" @click="handleReview(4)">
          <span class="difficulty-label">简单</span>
          <span class="difficulty-time">4天</span>
        </button>
      </div>
    </div>

    <!-- 语音复盘按钮 -->
    <div class="audio-controls">
      <button 
        class="audio-btn"
        @click="toggleAudio"
        :disabled="!currentCard"
      >
        <svg v-if="!isPlaying" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="6" y="4" width="4" height="16" />
          <rect x="14" y="4" width="4" height="16" />
        </svg>
        {{ isPlaying ? '暂停' : '语音复盘' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { sanitizeHtml } from '../../utils/sanitizeHtml'
import { flashCardApi } from '../../api/flashCard'

const props = defineProps({
  card: {
    type: Object,
    required: true
  },
  totalCards: {
    type: Number,
    default: 1
  },
  currentIndex: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['back', 'review', 'next'])

const showAnswer = ref(false)
const isPlaying = ref(false)
let audioInstance = null

// 渲染题目（挖空处理）
const renderQuestion = (card) => {
  if (!card) return ''
  // 如果content包含挖空标记（如 [填空] 或 {{}}），提取题目部分
  const content = card.content || ''
  // 简单处理：如果有明确的题目/答案分隔，提取题目
  // 这里可以根据实际数据格式调整
  return sanitizeHtml(content.split('---')[0] || content)
}

// 渲染答案
const renderAnswer = (card) => {
  if (!card) return ''
  const content = card.content || ''
  const answer = card.answer || content.split('---')[1] || ''
  return sanitizeHtml(answer)
}

// 复习处理
const handleReview = async (difficultyLevel) => {
  try {
    await flashCardApi.review(props.card.id, difficultyLevel)
    showAnswer.value = false
    emit('review', difficultyLevel)
    emit('next')
  } catch (error) {
    console.error('复习提交失败:', error)
  }
}

// 返回
const handleBack = () => {
  emit('back')
}

// 语音复盘
const toggleAudio = () => {
  if (isPlaying.value) {
    // 停止播放
    if (audioInstance) {
      audioInstance.pause()
      audioInstance = null
    }
    isPlaying.value = false
  } else {
    // 开始播放（使用Web Speech API或TTS）
    const text = `${renderQuestion(props.card)} ${renderAnswer(props.card)}`
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'zh-CN'
      utterance.rate = 0.9
      utterance.onend = () => {
        isPlaying.value = false
      }
      speechSynthesis.speak(utterance)
      audioInstance = utterance
      isPlaying.value = true
    }
  }
}

// 监听卡片变化，重置答案显示状态
watch(() => props.card, () => {
  showAnswer.value = false
  if (audioInstance) {
    speechSynthesis.cancel()
    audioInstance = null
  }
  isPlaying.value = false
})
</script>

<style scoped>
.flashcard-review-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px;
  min-height: 100vh;
  background: #f8fafc;
}

.review-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.back-btn {
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

.review-title {
  font-size: 24px;
  font-weight: 900;
  color: #1e293b;
  margin: 0;
}

.review-progress {
  font-size: 14px;
  font-weight: 700;
  color: #64748b;
}

.review-content {
  background: white;
  border-radius: 24px;
  padding: 48px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
}

.question-area,
.answer-area {
  margin-bottom: 32px;
}

.question-label,
.answer-label {
  font-size: 12px;
  font-weight: 900;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 16px;
}

.question-text,
.answer-text {
  font-size: 18px;
  line-height: 1.8;
  color: #1e293b;
}

.answer-area {
  opacity: 0;
  max-height: 0;
  overflow: hidden;
  transition: all 0.3s ease;
}

.answer-area.revealed {
  opacity: 1;
  max-height: 1000px;
}

.reveal-btn {
  width: 100%;
  padding: 16px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.reveal-btn:hover {
  background: #4338ca;
}

.difficulty-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 24px;
}

.difficulty-btn {
  padding: 16px;
  border-radius: 16px;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
  font-weight: 700;
}

.difficulty-btn.restart {
  background: #fef2f2;
  color: #dc2626;
}

.difficulty-btn.restart:hover {
  background: #fee2e2;
}

.difficulty-btn.hard {
  background: #fef3c7;
  color: #d97706;
}

.difficulty-btn.hard:hover {
  background: #fde68a;
}

.difficulty-btn.good {
  background: #dbeafe;
  color: #2563eb;
}

.difficulty-btn.good:hover {
  background: #bfdbfe;
}

.difficulty-btn.easy {
  background: #dcfce7;
  color: #16a34a;
}

.difficulty-btn.easy:hover {
  background: #bbf7d0;
}

.difficulty-label {
  font-size: 14px;
}

.difficulty-time {
  font-size: 12px;
  opacity: 0.8;
}

.audio-controls {
  display: flex;
  justify-content: center;
}

.audio-btn {
  padding: 12px 24px;
  background: white;
  border: 2px solid #4f46e5;
  border-radius: 16px;
  color: #4f46e5;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.audio-btn:hover:not(:disabled) {
  background: #4f46e5;
  color: white;
}

.audio-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

