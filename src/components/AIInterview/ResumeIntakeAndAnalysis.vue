<template>
  <section class="ai-section">
    <div class="section-header">
      <div class="section-header-left">
        <h2 class="section-title">一、准备你的简历</h2>
        <p class="section-subtitle">
          上传或一键调用平台简历，马上生成建议与问题清单。
        </p>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">上传简历</h3>
          <p class="card-desc">
            推荐直接使用「平台简历」，可以保持信息一致、减少重复上传。
          </p>
        </div>

        <div class="options">
          <label class="option" :class="{ active: modelSource === 'PLATFORM' }">
            <input v-model="modelSource" class="radio" type="radio" value="PLATFORM" />
            <div class="option-body">
              <div class="option-title-row">
                <span class="option-main">使用平台中已编辑的简历</span>
                <span class="badge">推荐</span>
              </div>

              <p v-if="hasPlatformResume" class="resume-source-status">
                已检测到平台简历，将使用最新版本。
              </p>
              <p v-else class="resume-source-status warn">
                当前还没有简历，建议先去简历制作里补充。
              </p>
              <button type="button" class="link" @click.stop="$emit('resume')">去查看 / 编辑平台简历</button>
            </div>
          </label>

          <label class="option" :class="{ active: modelSource === 'UPLOAD' }">
            <input v-model="modelSource" class="radio" type="radio" value="UPLOAD" />
            <div class="option-body">
              <div class="option-title-row">
                <span class="option-main">上传本地简历文件</span>
              </div>
              <p class="option-sub">
                支持 PDF / Word / Markdown 等常见格式，仅用于本地分析，不会对外泄露。
              </p>

              <div class="upload">
                <div class="upload-main">
                  <span class="upload-icon">⬆️</span>
                  <div class="upload-text">
                    <span class="upload-title">拖拽文件到这里，或点击选择</span>
                    <span class="upload-sub">{{ selectedFileName || '单个文件不超过 10MB' }}</span>
                  </div>
                </div>
                <div class="upload-actions">
                  <button type="button" class="upload-btn" @click="openFilePicker">选择文件</button>
                  <span class="upload-tip">支持：.pdf / .docx / .md</span>
                </div>
                <input
                  ref="fileInputRef"
                  type="file"
                  class="hidden"
                  accept=".pdf,.doc,.docx,.md,.txt"
                  @change="handleFileChange"
                />
              </div>
            </div>
          </label>
        </div>

        <div class="summary">
          <div class="summary-label">当前选择：</div>
          <div class="summary-main">
            <span v-if="modelSource === 'PLATFORM'">平台简历（将自动拉取你在本平台中保存的最新简历版本）</span>
            <span v-else-if="selectedFileName">本地文件：{{ selectedFileName }}</span>
            <span v-else class="summary-placeholder">尚未选择文件，请先选择简历来源</span>
          </div>
        </div>

        <div class="actions">
          <button type="button" class="btn-primary" :disabled="!canAnalyze" @click="analyze">
            开始分析简历
          </button>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">简历分析结果</h3>
        </div>

        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <div class="loading-text">正在模拟分析你的简历结构与内容...</div>
        </div>

        <div v-else-if="result" class="result">
          <div class="pill-row">
            <span class="pill">匹配岗位建议</span>
            <span class="pill subtle" v-if="modelSource === 'PLATFORM'">来源：平台简历</span>
          </div>

          <ul class="list">
            <li v-for="(item, idx) in result.matchingSuggestions" :key="idx" class="item">
              <div class="item-tag">{{ item.tag }}</div>
              <div class="item-main">
                <div class="item-title">{{ item.title }}</div>
                <div class="item-body">{{ item.desc }}</div>
              </div>
            </li>
          </ul>

          <div class="divider"></div>

          <div class="pill-row">
            <span class="pill danger">简历问题清单</span>
            <span class="subhint">这些问题也会在后续面试环节被重点追问。</span>
          </div>

          <ul class="questions">
            <li v-for="(q, idx) in result.resumeQuestions" :key="idx" class="q-item">
              <span class="q-index">Q{{ idx + 1 }}</span>
              <div class="q-main">
                <div class="q-title">{{ q.question }}</div>
                <div class="q-hint">{{ q.hint }}</div>
              </div>
            </li>
          </ul>

          <div class="next">
            <div class="next-main">
              <div class="next-title">下一步：开启模拟面试</div>
              <div class="next-desc">分析结果会自动同步到面试环节中，用于生成针对性的提问与评价。</div>
            </div>
            <button type="button" class="btn-secondary next-btn" @click="$emit('gotoInterview')">
              去选择面试方式
            </button>
          </div>
        </div>

        <div v-else class="empty">
          <div class="empty-icon">✨</div>
          <p class="empty-title">还没有简历分析结果</p>
          <p class="empty-desc">
            先在左侧选择简历来源并点击「开始分析简历」，这里会为你生成个性化的岗位建议与问题清单。
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'

const props = defineProps({
  resumeSource: { type: String, default: 'PLATFORM' },
  analysisResult: { type: Object, default: null },
})

const emit = defineEmits(['update:resumeSource', 'analysis', 'resume', 'gotoInterview'])

const fileInputRef = ref(null)
const selectedFileName = ref('')
const loading = ref(false)
const result = ref(props.analysisResult)
const platformResume = ref(null)

const modelSource = computed({
  get: () => props.resumeSource,
  set: (val) => emit('update:resumeSource', val),
})

const hasPlatformResume = computed(() => !!platformResume.value)

watch(
  () => props.analysisResult,
  (val) => {
    result.value = val
  }
)

const canAnalyze = computed(() => {
  if (modelSource.value === 'PLATFORM') return true
  return Boolean(selectedFileName.value)
})

const openFilePicker = () => {
  fileInputRef.value?.click?.()
}

const handleFileChange = (event) => {
  const files = event?.target?.files
  if (!files || !files.length) {
    selectedFileName.value = ''
    return
  }
  selectedFileName.value = files[0].name
}

const loadPlatformResume = () => {
  try {
    const raw = localStorage.getItem('resumeData')
    if (!raw) {
      platformResume.value = null
      return
    }
    const data = JSON.parse(raw)
    platformResume.value = data && typeof data === 'object' ? data : null
  } catch {
    platformResume.value = null
  }
}

const analyze = () => {
  if (!canAnalyze.value || loading.value) return
  loading.value = true
  result.value = null
  setTimeout(() => {
    const payload = {
      matchingSuggestions: [
        {
          tag: '后端 / 全栈',
          title: '以工程实践为主的后端 / 全栈岗位',
          desc: '你的项目经历中包含多次从 0 到 1 的服务端功能搭建，适合 Java / Go / Node.js 等工程实践导向的后端或全栈岗位。',
        },
        {
          tag: '校招 / 实习',
          title: '技术基础扎实的校招 / 实习岗位',
          desc: '课程 / 竞赛中有数据结构、算法和系统设计相关内容，适合技术基础要求较高的校园招聘或暑期实习岗位。',
        },
      ],
      resumeQuestions: [
        {
          question: '某个项目中你的「核心贡献」具体是什么？如何量化你带来的价值？',
          hint: '建议准备 1～2 句 STAR 描述，对应清晰的指标（如性能、用户数、缺陷率、交付时间）。',
        },
        {
          question: '目前简历中的技术栈罗列较多，有哪些是你真正「敢在简历上负责」的？',
          hint: '可以按熟练度分层，明确「熟练 / 了解」的边界，避免面试时被反复追问基础细节。',
        },
        {
          question: '是否有一段经历可以完整展示你的「问题拆解 → 方案权衡 → 落地执行」能力？',
          hint: '可以从课程设计、实验项目或实习中选取一个典型例子，提前整理好逻辑闭环。',
        },
      ],
    }
    const wrapped = {
      ...payload,
      source: modelSource.value,
      uploadedFileName: selectedFileName.value || '',
      platformResume: modelSource.value === 'PLATFORM' ? platformResume.value : null,
    }
    result.value = wrapped
    loading.value = false
    emit('analysis', wrapped)
  }, 900)
}

onMounted(() => {
  loadPlatformResume()
  window.addEventListener('storage', loadPlatformResume)
})
</script>

<style scoped>
.ai-section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 20px;
  font-weight: 800;
  color: #111827;
  margin: 0;
}

.section-subtitle {
  font-size: 13px;
  color: #6b7280;
  margin: 4px 0 0;
}


.grid {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(0, 1.35fr);
  gap: 20px;
}

.card {
  background: #ffffff;
  border-radius: 20px;
  padding: 18px 18px 20px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(226, 232, 240, 0.9);
}

.card-header {
  margin-bottom: 12px;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}


.options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option {
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  padding: 10px 10px 12px;
  background: #f9fafb;
  display: flex;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    background-color 0.18s ease,
    transform 0.18s ease;
}

.option.active {
  background: #ffffff;
  border-color: rgba(129, 140, 248, 0.9);
  box-shadow: 0 12px 32px rgba(129, 140, 248, 0.28);
  transform: translateY(-1px);
}

.radio {
  margin-right: 8px;
  margin-top: 6px;
}

.option-body {
  flex: 1;
  min-width: 0;
}

.option-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}

.option-main {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(34, 197, 94, 0.12);
  color: #16a34a;
  font-weight: 600;
}


.resume-source-status {
  margin-top: 4px;
  font-size: 11px;
  color: #16a34a;
}

.resume-source-status.warn {
  color: #ea580c;
}

.link {
  margin-top: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid rgba(191, 219, 254, 0.9);
  background: rgba(239, 246, 255, 0.85);
  color: #2563eb;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease;
}

.link:hover {
  background: #dbeafe;
  border-color: #60a5fa;
}

.upload {
  margin-top: 8px;
  padding: 10px 10px 10px;
  border-radius: 14px;
  border: 1px dashed rgba(203, 213, 225, 0.9);
  background: #f9fafb;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.upload-main {
  display: flex;
  align-items: center;
  gap: 10px;
}

.upload-icon {
  width: 26px;
  height: 26px;
  border-radius: 999px;
  background: #111827;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.upload-text {
  display: flex;
  flex-direction: column;
}

.upload-title {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
}

.upload-sub {
  font-size: 11px;
  color: #6b7280;
}

.upload-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 2px;
}

.upload-btn {
  border-radius: 999px;
  padding: 4px 12px;
  border: none;
  background: #111827;
  color: #f9fafb;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.upload-tip {
  font-size: 11px;
  color: #9ca3af;
}

.hidden {
  display: none;
}

.summary {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-top: 12px;
  padding: 10px 10px;
  border-radius: 14px;
  background: #f9fafb;
}

.summary-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
}

.summary-main {
  font-size: 12px;
  color: #111827;
}

.summary-placeholder {
  color: #9ca3af;
}

.actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}


.btn-primary,
.btn-secondary {
  border-radius: 999px;
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  color: #f9fafb;
  box-shadow: 0 14px 30px rgba(79, 70, 229, 0.32);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 18px 40px rgba(79, 70, 229, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.9);
  color: #4b5563;
  border: 1px solid rgba(148, 163, 184, 0.6);
}

.btn-secondary:hover {
  background: #f1f5f9;
  transform: translateY(-1px);
}

.loading {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 12px 14px;
  border-radius: 14px;
  background: #f9fafb;
}

.spinner {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  border: 2px solid rgba(148, 163, 184, 0.4);
  border-top-color: #4f46e5;
  animation: spin 0.7s linear infinite;
}

.loading-text {
  font-size: 13px;
  color: #6b7280;
}

.result {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pill-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pill {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(79, 70, 229, 0.08);
  color: #4f46e5;
  font-weight: 600;
}

.pill.subtle {
  background: rgba(148, 163, 184, 0.08);
  color: #6b7280;
}

.pill.danger {
  background: rgba(220, 38, 38, 0.06);
  color: #b91c1c;
}

.subhint {
  font-size: 11px;
  color: #9ca3af;
}

.list {
  list-style: none;
  margin: 4px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item {
  display: flex;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 14px;
  background: #f9fafb;
}

.item-tag {
  padding: 4px 8px;
  border-radius: 999px;
  background: #111827;
  color: #e5e7eb;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.item-main {
  font-size: 12px;
  color: #111827;
}

.item-title {
  font-weight: 600;
  margin-bottom: 2px;
}

.item-body {
  color: #4b5563;
}

.divider {
  height: 1px;
  margin: 6px 0;
  background: linear-gradient(to right, rgba(226, 232, 240, 0.9), rgba(226, 232, 240, 0));
}

.questions {
  list-style: none;
  padding: 0;
  margin: 4px 0 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.q-item {
  display: flex;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 12px;
  background: #fef2f2;
}

.q-index {
  font-size: 11px;
  font-weight: 700;
  color: #b91c1c;
  margin-top: 2px;
}

.q-main {
  font-size: 12px;
  color: #7f1d1d;
}

.q-title {
  font-weight: 600;
}

.q-hint {
  margin-top: 2px;
}

.next {
  margin-top: 8px;
  padding: 8px 10px;
  border-radius: 14px;
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.next-main {
  font-size: 12px;
  color: #111827;
}

.next-title {
  font-weight: 600;
}

.next-desc {
  color: #6b7280;
}

.next-btn {
  padding-inline: 14px;
}

.empty {
  padding: 22px 12px 18px;
  border-radius: 16px;
  background: linear-gradient(135deg, #eff6ff, #fefce8);
  text-align: left;
}

.empty-icon {
  font-size: 24px;
  margin-bottom: 6px;
}

.empty-title {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.empty-desc {
  font-size: 12px;
  color: #6b7280;
  margin: 4px 0 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 960px) {
  .grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .actions {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

