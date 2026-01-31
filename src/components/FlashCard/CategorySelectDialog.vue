<template>
  <el-dialog
    v-model="dialogVisible"
    title="选择分类层级"
    width="600px"
    :close-on-click-modal="false"
  >
    <div class="category-dialog-content">
      <div v-if="categoryTree.length === 0" class="loading-state">
        加载分类树中...
      </div>
      <CategoryTree 
        v-else
        :tree="categoryTree"
        :selected-path="selectedPath"
        @select="handleSelect"
      />
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <button class="btn btn-cancel" @click="handleCancel">取消</button>
        <button 
          class="btn btn-confirm" 
          @click="handleConfirm"
          :disabled="selectedPath.length === 0"
        >
          确认保存
        </button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import CategoryTree from './CategoryTree.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  card: {
    type: Object,
    default: null
  },
  categoryTree: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const selectedPath = ref([])

// 监听对话框打开，重置选择
watch(() => props.modelValue, (val) => {
  if (val) {
    selectedPath.value = []
  }
})

const handleSelect = (path) => {
  selectedPath.value = path
}

const handleConfirm = () => {
  if (selectedPath.value.length > 0) {
    emit('confirm', selectedPath.value)
  }
}

const handleCancel = () => {
  dialogVisible.value = false
}
</script>

<style scoped>
.category-dialog-content {
  min-height: 300px;
  max-height: 500px;
  overflow-y: auto;
  padding: 16px;
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: #94a3b8;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-cancel {
  background: #f1f5f9;
  color: #64748b;
}

.btn-cancel:hover {
  background: #e2e8f0;
}

.btn-confirm {
  background: #4f46e5;
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  background: #4338ca;
}

.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

