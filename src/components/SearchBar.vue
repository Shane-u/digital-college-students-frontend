<template>
  <div class="search-bar-container">
    <div class="search-icon" @click="toggleSearch" v-if="!isExpanded">
      <span>🔍</span>
    </div>
    <transition name="expand">
      <div v-if="isExpanded" class="search-expanded">
        <input
          ref="searchInput"
          v-model="searchQuery"
          type="text"
          class="search-input"
          :placeholder="placeholder"
          @input="handleSearch"
        />
        <div class="close-icon" @click="toggleSearch">
          <span>✕</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const props = defineProps({
  placeholder: {
    type: String,
    default: '搜索...'
  }
})

const emit = defineEmits(['search'])

const isExpanded = ref(false)
const searchQuery = ref('')
const searchInput = ref(null)

const toggleSearch = () => {
  isExpanded.value = !isExpanded.value
  
  if (isExpanded.value) {
    nextTick(() => {
      searchInput.value?.focus()
    })
  } else {
    searchQuery.value = ''
    emit('search', '')
  }
}

const handleSearch = () => {
  emit('search', searchQuery.value)
}
</script>

<style scoped>
.search-bar-container {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.search-expanded {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-input {
  height: 40px;
  padding: 0 16px;
  border: 2px solid #b8a0c8;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
  min-width: 200px;
  flex: 1;
}

.search-input:focus {
  border-color: #9575b5;
  box-shadow: 0 0 0 3px rgba(184, 160, 200, 0.1);
}

.search-icon,
.close-icon {
  width: 40px;
  height: 40px;
  background: #b8a0c8;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 18px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(184, 160, 200, 0.3);
}

.search-icon:hover,
.close-icon:hover {
  background: #9575b5;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(184, 160, 200, 0.4);
}

/* 展开动画 */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
}

.expand-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.expand-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .search-input {
    min-width: 150px;
    font-size: 13px;
  }
  
  .search-icon,
  .close-icon {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }
}
</style>

