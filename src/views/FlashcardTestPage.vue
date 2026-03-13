<template>
  <div class="flashcard-test-page">
    <div class="shell">
      <FlashcardTestTopBar
        :title="ctx?.title || '闪卡测试'"
        :saving="saving"
        :submitting="submitting"
        :total-questions="questions.length"
        :answered-questions="answeredCount"
        :question-order="questionStates"
        @back="goBack"
        @save="handleSave"
        @submit="handleSubmit"
        @select-question="scrollToQuestion"
      />
      <div class="q-grid">
        <div v-for="section in sections" :key="section.key" class="section">
          <div class="section-title">{{ section.title }}</div>
          <QuestionCardShell
            ref="questionRefs"
            v-for="q in section.items"
            :key="q.id"
            :index="q.index"
            :type="q.type"
            :title="q.title"
          >
            <ChoiceQuestion
              v-if="q.type === 'choice'"
              v-model="answers[q.id]"
              :options="q.options"
            />
            <BlankQuestion v-else-if="q.type === 'blank'" v-model="answers[q.id]" />
            <CodingQuestion
              v-else-if="q.type === 'coding'"
              v-model="answers[q.id]"
              :language="q.language"
              :placeholder="q.placeholder"
            />
          </QuestionCardShell>
        </div>
      </div>

      <div class="bottom-pad"></div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import FlashcardTestTopBar from '../components/FlashCard/Test/FlashcardTestTopBar.vue'
import QuestionCardShell from '../components/FlashCard/Test/QuestionCardShell.vue'
import ChoiceQuestion from '../components/FlashCard/Test/ChoiceQuestion.vue'
import BlankQuestion from '../components/FlashCard/Test/BlankQuestion.vue'
import CodingQuestion from '../components/FlashCard/Test/CodingQuestion.vue'
import { flashCardTestApi } from '../api/flashCardTest'
import {
  loadFlashcardTestContext,
  loadTestDraft,
  loadTestPaper,
  saveTestDraft,
  saveTestPaper,
  saveTestResult
} from '../utils/flashcardTestStorage'

const route = useRoute()
const router = useRouter()

const saving = ref(false)
const submitting = ref(false)

const flashcardId = computed(() => String(route.params.flashcardId || ''))
const ctx = ref(null)

const answers = reactive({})
const questions = ref([])
const paper = ref(null)
const testId = computed(() => {
  const q = String(route.query?.testId ?? '').trim()
  return q || null
})

const normalizeQuestion = (q) => {
  const rawType = String(q?.questionType || '').toLowerCase()
  const type = rawType === 'choice' ? 'choice' : rawType === 'blank' ? 'blank' : 'coding'
  const options = Array.isArray(q?.options) ? q.options : []
  const optObjs =
    type === 'choice'
      ? options.map((t, i) => ({ key: String.fromCharCode(65 + i), text: String(t ?? '') }))
      : []
  return {
    id: String(q?.id ?? ''),
    backendType: rawType || (type === 'coding' ? 'code' : type),
    type,
    title: String(q?.content ?? ''),
    options: optObjs,
    score: Number(q?.score ?? 0),
    language: 'javascript',
    placeholder: '在这里编写你的代码…'
  }
}

const answeredCount = computed(() => {
  const q = questions.value
  if (!q.length) return 0
  let n = 0
  for (const item of q) {
    const v = answers[item.id]
    if (item.type === 'choice') {
      if (String(v || '').trim()) n++
    } else if (item.type === 'blank') {
      if (String(v || '').trim().length > 0) n++
    } else if (item.type === 'coding') {
      if (String(v || '').trim().length > 0) n++
    }
  }
  return n
})

const questionStates = computed(() =>
  questions.value.map((q, index) => {
    const v = String(answers[q.id] ?? '').trim()
    return { id: q.id, index, answered: v.length > 0 }
  })
)

const sections = computed(() => {
  const buckets = [
    { key: 'choice', title: '一、选择题', items: [] },
    { key: 'blank', title: '二、填空题', items: [] },
    { key: 'coding', title: '三、编程题', items: [] }
  ]
  const map = buckets.reduce((m, s) => {
    m[s.key] = s
    return m
  }, {})
  questions.value.forEach((q, index) => {
    const bucket = map[q.type]
    if (bucket) {
      bucket.items.push({ ...q, index })
    }
  })
  return buckets.filter((b) => b.items.length > 0)
})

const questionRefs = ref([])

const scrollToQuestion = (index) => {
  const refList = questionRefs.value || []
  const target = refList[index]
  if (!target) return
  const el = target.$el || target
  if (el && el.scrollIntoView) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

onMounted(() => {
  ctx.value = loadFlashcardTestContext(flashcardId.value)
  const draft = loadTestDraft(flashcardId.value)

  // 优先加载接口返回的试卷（生成/重做都会带 testId）
  const tryInit = async () => {
    if (testId.value != null) {
      const cached = loadTestPaper(testId.value)
      if (cached && cached.questions) {
        paper.value = cached
      } else {
        const res = await flashCardTestApi.loadPaper(testId.value)
        paper.value = flashCardTestApi.normalizeTestVO(res)
        saveTestPaper(testId.value, paper.value)
      }
      questions.value = (paper.value?.questions || []).map(normalizeQuestion).filter(q => q.id)
    } else {
      questions.value = []
    }
    // 初始化空答案，保证 v-model 响应式
    questions.value.forEach((q) => {
      if (answers[q.id] == null) answers[q.id] = ''
    })
  }
  tryInit().catch(() => {
    questions.value = []
  })

  if (draft?.answers && typeof draft.answers === 'object') {
    Object.keys(draft.answers).forEach((k) => {
      answers[k] = draft.answers[k]
    })
  }
})

const goBack = () => {
  router.back()
}

const handleSave = async () => {
  try {
    saving.value = true
    saveTestDraft(flashcardId.value, {
      flashcardId: flashcardId.value,
      savedAt: Date.now(),
      answers: { ...answers }
    })
    ElMessage.success('已保存当前作答进度')
  } finally {
    saving.value = false
  }
}

const handleSubmit = async () => {
  const total = questions.value.length
  const answered = answeredCount.value
  if (answered === 0) {
    ElMessage.warning('你还没有作答任何题目哦')
    return
  }
  if (paper.value?.testId == null && testId.value == null) {
    ElMessage.error('当前试卷未加载，请稍后重试')
    return
  }

  const ok = await ElMessageBox.confirm(
    `你已作答 ${answered}/${total} 题，确定要提交吗？`,
    '提交确认',
    {
      confirmButtonText: '提交',
      cancelButtonText: '再检查一下',
      type: 'warning'
    }
  ).catch(() => false)
  if (!ok) return

  try {
    submitting.value = true
    const submitTestId = String(paper.value?.testId ?? testId.value ?? '')
    const payloadAnswers = questions.value.map((q) => ({
      questionId: String(q.id),
      questionType: q.backendType === 'coding' ? 'code' : q.backendType,
      userAnswer: String(answers[q.id] ?? ''),
      userUploadUrl: ''
    }))
    const res = await flashCardTestApi.submit({ testId: submitTestId, answers: payloadAnswers })
    const result = flashCardTestApi.normalizeTestVO(res)

    saveTestResult(flashcardId.value, {
      flashcardId: flashcardId.value,
      submittedAt: Date.now(),
      testId: submitTestId,
      submitId: result?.submitId,
      totalScore: result?.totalScore,
      pass: result?.pass,
      questionResults: result?.questionResults || [],
      answers: { ...answers }
    })

    await router.push({
      name: 'FlashcardTestResult',
      params: { flashcardId: flashcardId.value },
      query: { score: String(result?.totalScore ?? 0), submitId: String(result?.submitId ?? '') }
    })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.flashcard-test-page {
  min-height: 100vh;
  background: #ffffff;
  display: flex;
  justify-content: center;
  padding: 0 16px 40px;
}

.shell {
  width: 100%;
  max-width: 980px;
  padding-top: 18px;
}

.q-grid {
  margin-top: 16px;
  display: grid;
  gap: 14px;
}

.section-title {
  font-size: 15px;
  font-weight: 900;
  color: #111827;
  margin-bottom: 4px;
}

.bottom-pad {
  height: 28px;
}
</style>

