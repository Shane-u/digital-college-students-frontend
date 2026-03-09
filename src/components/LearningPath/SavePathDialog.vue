<template>
  <Teleport to="body">
    <div v-if="visible" class="save-path-dialog-mask" @click.self="handleCancel">
      <div class="save-path-dialog">
        <div class="save-path-dialog-header">
          <span class="save-path-dialog-title">保存学习路径</span>
          <button type="button" class="save-path-dialog-close" aria-label="关闭" @click="handleCancel">×</button>
        </div>
        <div class="save-path-dialog-body">
          <div class="save-path-field">
            <label class="save-path-label">路径主题 <span class="required">*</span></label>
            <input
              v-model="form.topic"
              type="text"
              class="save-path-input"
              placeholder="如：Java 入门、Vue 前端"
              maxlength="64"
            />
          </div>
          <div class="save-path-field">
            <label class="save-path-label">路径描述</label>
            <textarea
              v-model="form.description"
              class="save-path-textarea"
              placeholder="选填，简要描述该学习路径"
              rows="3"
            />
          </div>
        </div>
        <div class="save-path-dialog-footer">
          <button type="button" class="save-path-btn save-path-btn-cancel" @click="handleCancel">取消</button>
          <button type="button" class="save-path-btn save-path-btn-submit" :disabled="!canSubmit || submitting" @click="handleSubmit">
            {{ submitting ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { save as savePathApi } from '../../api/learningPath'

const props = defineProps({
  visible: { type: Boolean, default: false },
  pathJson: { type: Object, default: null },
  userId: { type: [Number, String], default: null }
})

const emit = defineEmits(['update:visible', 'saved', 'error'])

const form = ref({ topic: '', description: '' })
const submitting = ref(false)

const canSubmit = computed(() => (form.value.topic || '').trim().length > 0)

watch(() => props.visible, (v) => {
  if (v) {
    form.value = { topic: '', description: '' }
  }
})

const handleCancel = () => {
  emit('update:visible', false)
}

const handleSubmit = async () => {
  if (!canSubmit.value || submitting.value) return
  if (!props.pathJson || !props.pathJson.nodes) {
    emit('error', new Error('暂无有效路径数据'))
    return
  }

  submitting.value = true
  try {
    const pathJsonStr = typeof props.pathJson === 'string' ? props.pathJson : JSON.stringify(props.pathJson)
    const res = await savePathApi({
      pathJson: pathJsonStr,
      topic: (form.value.topic || '').trim(),
      description: (form.value.description || '').trim(),
      userId: props.userId ?? null
    })
    if (res && (res.code === 0 || res.code === undefined)) {
      emit('saved', res.data)
      emit('update:visible', false)
    } else {
      emit('error', new Error(res?.message || '保存失败'))
    }
  } catch (err) {
    emit('error', err)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.save-path-dialog-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.save-path-dialog {
  width: 90%;
  max-width: 420px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.save-path-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.save-path-dialog-title {
  font-size: 17px;
  font-weight: 600;
  color: #1f1f1f;
}

.save-path-dialog-close {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  font-size: 22px;
  color: #6b7280;
  cursor: pointer;
  border-radius: 6px;
  line-height: 1;
}

.save-path-dialog-close:hover {
  background: #f3f4f6;
  color: #1f1f1f;
}

.save-path-dialog-body {
  padding: 20px;
}

.save-path-field {
  margin-bottom: 16px;
}

.save-path-field:last-child {
  margin-bottom: 0;
}

.save-path-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.save-path-label .required {
  color: #dc2626;
}

.save-path-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 15px;
  color: #1f1f1f;
  box-sizing: border-box;
}

.save-path-input:focus {
  outline: none;
  border-color: #9333ea;
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
}

.save-path-textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  color: #1f1f1f;
  resize: vertical;
  min-height: 72px;
  box-sizing: border-box;
}

.save-path-textarea:focus {
  outline: none;
  border-color: #9333ea;
}

.save-path-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #eee;
}

.save-path-btn {
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.save-path-btn-cancel {
  background: #f3f4f6;
  color: #374151;
}

.save-path-btn-cancel:hover {
  background: #e5e7eb;
}

.save-path-btn-submit {
  background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%);
  color: #fff;
}

.save-path-btn-submit:hover:not(:disabled) {
  background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%);
}

.save-path-btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
