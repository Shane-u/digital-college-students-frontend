<template>
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">上传简历</h3>
    </div>

    <div class="targets">
      <div class="field2">
        <div class="label2">目标岗位（可选）</div>
        <input
          class="input2"
          :value="targetRole"
          placeholder="例如：前端开发 / Java 后端"
          @input="$emit('update:targetRole', $event.target.value)"
        />
      </div>
      <div class="field2">
        <div class="label2">目标层级（可选）</div>
        <input
          class="input2"
          :value="targetLevel"
          placeholder="例如：校招 / 初级 / 中级"
          @input="$emit('update:targetLevel', $event.target.value)"
        />
      </div>
    </div>

    <div class="options">
      <label class="option" :class="{ active: resumeSource === 'PLATFORM' }">
        <input v-model="resumeSource" class="radio" type="radio" value="PLATFORM" />
        <div class="option-body">
          <div class="option-title-row">
            <span class="option-main">使用平台中已编辑的简历</span>
            <span class="badge">推荐</span>
            <button type="button" class="link link-inline" @click.stop="$emit('resume')">去查看 / 编辑平台简历</button>
          </div>

          <p v-if="!hasPlatformResume" class="resume-source-status warn">当前还没有简历，建议先去简历制作里补充。</p>
        </div>
      </label>

      <label class="option" :class="{ active: resumeSource === 'UPLOAD' }">
        <input v-model="resumeSource" class="radio" type="radio" value="UPLOAD" />
        <div class="option-body">
          <div class="option-title-row">
            <span class="option-main">上传本地简历文件</span>
          </div>
          <p class="option-sub">支持 PDF / Word / Markdown 等常见格式，仅用于本地分析，不会对外泄露。</p>

          <div
            class="upload"
            :class="{ filled: Boolean(selectedFileName) }"
            role="button"
            tabindex="0"
            @click="$emit('pickFile')"
            @keydown.enter.prevent="$emit('pickFile')"
            @keydown.space.prevent="$emit('pickFile')"
          >
            <div class="upload-main">
              <span class="upload-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 15.5V6.5"
                    stroke="currentColor"
                    stroke-width="2.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M8.5 10l3.5-3.5L15.5 10"
                    stroke="currentColor"
                    stroke-width="2.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M6.5 17.5h11"
                    stroke="currentColor"
                    stroke-width="2.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    opacity="0.95"
                  />
                </svg>
              </span>
              <div class="upload-text">
                <span class="upload-title">拖拽文件到这里，或点击选择</span>
                <span class="upload-sub">{{ selectedFileName || '支持：.pdf / .docx / .md' }}</span>
              </div>
            </div>
            <div class="upload-actions">
              <button type="button" class="upload-btn" @click.stop="$emit('pickFile')">选择文件</button>
              <button type="button" class="upload-btn ghost" @click.stop="$emit('history')">历史简历</button>
            </div>
          </div>
        </div>
      </label>
    </div>

    <div class="summary">
      <div class="summary-label">当前选择：</div>
      <div class="summary-main">
        <span v-if="resumeSource === 'PLATFORM'">
          平台简历（将自动拉取你在本平台中保存的最新简历版本）
        </span>
        <span v-else-if="selectedFileName">本地文件：{{ selectedFileName }}</span>
        <span v-else class="summary-placeholder">尚未选择文件，请先选择简历来源</span>
      </div>
    </div>

    <div class="actions">
      <button type="button" class="btn-primary" :disabled="!canAnalyze" @click="$emit('analyze')">
        {{ uploading ? '正在上传...' : '开始分析简历' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  resumeSource: { type: String, default: 'PLATFORM' },
  selectedFileName: { type: String, default: '' },
  hasPlatformResume: { type: Boolean, default: false },
  selectedResumeId: { type: [String, Number], default: null },
  uploading: { type: Boolean, default: false },
  targetRole: { type: String, default: '' },
  targetLevel: { type: String, default: '' },
})

const emit = defineEmits([
  'update:resumeSource',
  'update:targetRole',
  'update:targetLevel',
  'resume',
  'pickFile',
  'history',
  'analyze'
])

const resumeSource = computed({
  get: () => props.resumeSource,
  set: (v) => emit('update:resumeSource', v),
})

const canAnalyze = computed(() => {
  if (props.uploading) return false
  if (props.resumeSource === 'PLATFORM') return props.hasPlatformResume
  return Boolean(props.selectedFileName) || Boolean(props.selectedResumeId)
})
</script>

<style scoped>
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
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.targets {
  display: grid;
  grid-template-columns: minmax(0, 0.5fr);
  gap: 8px;
  margin-bottom: 12px;
}

.field2 {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label2 {
  font-size: 12px;
  font-weight: 800;
  color: #475569;
}

.input2 {
  width: 100%;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: #f9fafb;
  font-size: 13px;
  color: #111827;
  outline: none;
  transition: box-shadow 0.16s ease, border-color 0.16s ease, background-color 0.16s ease;
}

.input2:focus {
  border-color: rgba(79, 70, 229, 0.55);
  background: #ffffff;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.12);
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
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease, transform 0.18s ease;
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
  flex-wrap: wrap;
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

.option-sub {
  margin-top: 4px;
  font-size: 11px;
  color: #6b7280;
  line-height: 1.7;
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
  transition: background-color 0.18s ease, border-color 0.18s ease;
}

.link-inline {
  margin-top: 0;
  margin-left: auto;
  white-space: nowrap;
}

.link:hover {
  background: #dbeafe;
  border-color: #60a5fa;
}

.upload {
  margin-top: 8px;
  padding: 18px 16px 16px;
  border-radius: 18px;
  border: 1.5px dashed rgba(203, 213, 225, 0.95);
  background: linear-gradient(135deg, rgba(239, 246, 255, 0.72), rgba(255, 255, 255, 0.92));
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 176px;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.18s ease, background-color 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}

.upload:hover {
  transform: translateY(-1px);
  background: linear-gradient(135deg, rgba(239, 246, 255, 0.82), rgba(255, 255, 255, 0.98));
  border-color: rgba(79, 70, 229, 0.4);
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.06);
}

.upload:focus {
  outline: none;
}

.upload:focus-visible {
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12), 0 10px 26px rgba(15, 23, 42, 0.06);
  border-color: rgba(79, 70, 229, 0.55);
}

.upload.filled {
  border-color: rgba(34, 197, 94, 0.42);
  background: linear-gradient(135deg, rgba(240, 253, 244, 0.76), rgba(255, 255, 255, 0.96));
}

.upload-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
}

.upload-icon {
  width: 54px;
  height: 54px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(79, 70, 229, 1), rgba(99, 102, 241, 1));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  box-shadow: 0 14px 30px rgba(79, 70, 229, 0.26);
}

.upload-text {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-title {
  font-size: 14px;
  font-weight: 800;
  color: #111827;
}

.upload-sub {
  margin-top: 2px;
  font-size: 12px;
  color: #64748b;
}

.upload-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 2px;
}

.upload-btn {
  border-radius: 999px;
  padding: 8px 14px;
  border: none;
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  color: #f9fafb;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 12px 26px rgba(79, 70, 229, 0.24);
  transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease, background-color 0.18s ease;
}

.upload-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 34px rgba(79, 70, 229, 0.32);
}

.upload-btn.ghost {
  background: rgba(255, 255, 255, 0.9);
  color: #4b5563;
  border: 1px solid rgba(226, 232, 240, 0.95);
  box-shadow: none;
}

.upload-btn.ghost:hover {
  background: #f8fafc;
  transform: translateY(-1px);
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

.summary-id {
  display: inline-flex;
  margin-left: 8px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(79, 70, 229, 0.08);
  color: #4f46e5;
  font-weight: 700;
}

.actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 10px;
}

.btn-primary {
  border-radius: 999px;
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
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
</style>

