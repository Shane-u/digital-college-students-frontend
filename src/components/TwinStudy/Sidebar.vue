<template>
  <div :class="['sidebar', { 'sidebar-open': isOpen, 'sidebar-closed': !isOpen }]">
    <div class="sidebar-header">
      <button 
        @click="toggleOpen"
        class="sidebar-toggle"
      >
        <MenuIcon />
      </button>
      <button v-if="isOpen" class="sidebar-search">
        <SearchIcon />
      </button>
    </div>

    <div class="sidebar-new-chat">
      <button 
        @click="onNewChat"
        :class="['new-chat-btn', { 'new-chat-btn-open': isOpen, 'new-chat-btn-closed': !isOpen }]"
      >
        <PlusIcon />
        <span v-if="isOpen">New chat</span>
      </button>
    </div>

    <div v-if="isOpen" class="sidebar-content">
      <div class="sidebar-section">
        <div class="sidebar-section-header">
          <span>My Stuff</span>
          <span class="sidebar-arrow">›</span>
        </div>
      </div>

      <div class="sidebar-section">
        <div class="sidebar-section-header">
          <span>Gems</span>
          <span class="sidebar-arrow">›</span>
        </div>
        <div class="sidebar-item">
          <HistoryIcon />
          <span>Time Planner</span>
        </div>
      </div>

      <div class="sidebar-section">
        <div v-if="!isBatchMode" class="sidebar-section-header">
          <h3 class="sidebar-section-title">最近对话</h3>
          <button class="sidebar-refresh-btn" @click.stop>
            <ClockIcon />
          </button>
        </div>
        <div v-else class="sidebar-batch-header">
          <button class="sidebar-batch-select-all" @click="toggleSelectAll">
            <CheckSquareIcon v-if="selectedSessions.size === sessions.length" />
            <SquareIcon v-else />
            <span>全选</span>
          </button>
          <span class="sidebar-batch-count">已选{{ selectedSessions.size }}条</span>
          <button class="sidebar-batch-cancel" @click="exitBatchMode">取消</button>
          <button class="sidebar-batch-delete" @click="deleteSelected">删除</button>
        </div>
        <div class="sidebar-chats">
          <div 
            v-for="session in sortedSessions"
            :key="session.id"
            @click="handleItemClick(session.id)"
            :class="['sidebar-chat-item', { 
              'active': currentSessionId === session.id && !isBatchMode,
              'selected': isBatchMode && selectedSessions.has(session.id)
            }]"
          >
            <div v-if="isBatchMode" class="sidebar-chat-checkbox" @click.stop="toggleSelect(session.id)">
              <CheckSquareIcon v-if="selectedSessions.has(session.id)" />
              <SquareIcon v-else />
            </div>
            <MessageSquareIcon v-else />
            <span class="sidebar-chat-title">{{ session.title }}</span>
            <PinIcon v-if="session.isPinned" class="sidebar-pin" />
            <button 
              v-if="isOpen && !isBatchMode" 
              class="sidebar-chat-more"
              @click.stop="openMenu(session.id, $event)"
            >
              <MoreVerticalIcon />
            </button>
          </div>
        </div>
      </div>
      
      <!-- 下拉菜单 -->
      <div 
        v-if="showMenu && menuPosition"
        class="sidebar-menu"
        :style="{ top: menuPosition.top + 'px', left: menuPosition.left + 'px' }"
        @click.stop
      >
        <button class="sidebar-menu-item" @click="handlePin">
          <PinMenuIcon />
          <span>置顶</span>
        </button>
        <button class="sidebar-menu-item" @click="handleRename">
          <PencilIcon />
          <span>重命名</span>
        </button>
        <button class="sidebar-menu-item" @click="handleDelete">
          <TrashIcon />
          <span>删除</span>
        </button>
        <button class="sidebar-menu-item" @click="handleBatchOperation">
          <LayersIcon />
          <span>批量操作</span>
        </button>
      </div>
      
      <!-- 重命名对话框 -->
      <div v-if="showRenameDialog" class="sidebar-rename-overlay" @click.stop="closeRenameDialog">
        <div class="sidebar-rename-dialog" @click.stop>
          <h3>重命名</h3>
          <input 
            v-model="renameValue" 
            @keyup.enter="confirmRename"
            @keyup.esc="closeRenameDialog"
            class="sidebar-rename-input"
            placeholder="请输入新名称"
            ref="renameInputRef"
          />
          <div class="sidebar-rename-actions">
            <button class="sidebar-rename-cancel" @click="closeRenameDialog">取消</button>
            <button class="sidebar-rename-confirm" @click="confirmRename">确定</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!isOpen" class="sidebar-icons-closed">
      <button class="sidebar-icon-btn"><GemIcon /></button>
      <button class="sidebar-icon-btn"><HistoryIcon /></button>
      <button class="sidebar-icon-btn"><PlusIcon /></button>
    </div>

    <div class="sidebar-footer">
      <div :class="['sidebar-footer-item', { 'sidebar-footer-item-closed': !isOpen }]">
        <SettingsIcon />
        <span v-if="isOpen">Settings & help</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { h, ref, computed, nextTick, onMounted, onUnmounted } from 'vue'

// 状态管理
const showMenu = ref(false)
const menuPosition = ref(null)
const currentMenuSessionId = ref(null)
const showRenameDialog = ref(false)
const renameValue = ref('')
const renameInputRef = ref(null)
const isBatchMode = ref(false)
const selectedSessions = ref(new Set())

// 使用简单的 SVG 图标组件
const MenuIcon = () => h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5 }, [
  h('line', { x1: 3, y1: 6, x2: 21, y2: 6 }),
  h('line', { x1: 3, y1: 12, x2: 21, y2: 12 }),
  h('line', { x1: 3, y1: 18, x2: 21, y2: 18 })
])

const PlusIcon = () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('line', { x1: 12, y1: 5, x2: 12, y2: 19 }),
  h('line', { x1: 5, y1: 12, x2: 19, y2: 12 })
])

const SearchIcon = () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5 }, [
  h('circle', { cx: 11, cy: 11, r: 8 }),
  h('path', { d: 'm21 21-4.35-4.35' })
])

const MessageSquareIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('path', { d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' })
])

const HistoryIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('circle', { cx: 12, cy: 12, r: 10 }),
  h('polyline', { points: '12 6 12 12 16 14' })
])

const GemIcon = () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('path', { d: 'M6 3h12l4 6-10 12L2 9z' })
])

const PinIcon = () => h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('line', { x1: 12, y1: 17, x2: 12, y2: 22 }),
  h('path', { d: 'M5 17h14l-1-7H6z' }),
  h('path', { d: 'M9 10V4h6v6' })
])

const SettingsIcon = () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5 }, [
  h('circle', { cx: 12, cy: 12, r: 3 }),
  h('path', { d: 'M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24' })
])

const MoreVerticalIcon = () => h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('circle', { cx: 12, cy: 12, r: 1 }),
  h('circle', { cx: 12, cy: 5, r: 1 }),
  h('circle', { cx: 12, cy: 19, r: 1 })
])

const ClockIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('circle', { cx: 12, cy: 12, r: 10 }),
  h('polyline', { points: '12 6 12 12 16 14' })
])

const PinMenuIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('line', { x1: 12, y1: 17, x2: 12, y2: 22 }),
  h('path', { d: 'M5 17h14l-1-7H6z' }),
  h('path', { d: 'M9 10V4h6v6' })
])

const PencilIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('path', { d: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' }),
  h('path', { d: 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' })
])

const TrashIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('polyline', { points: '3 6 5 6 21 6' }),
  h('path', { d: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' })
])

const LayersIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('polygon', { points: '12 2 2 7 12 12 22 7 12 2' }),
  h('polyline', { points: '2 17 12 22 22 17' }),
  h('polyline', { points: '2 12 12 17 22 12' })
])

const CheckSquareIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('polyline', { points: '9 11 12 14 22 4' }),
  h('path', { d: 'M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' })
])

const SquareIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('rect', { x: 3, y: 3, width: 18, height: 18, rx: 2, ry: 2 })
])

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  toggleOpen: {
    type: Function,
    required: true
  },
  sessions: {
    type: Array,
    required: true
  },
  currentSessionId: {
    type: String,
    default: null
  },
  onNewChat: {
    type: Function,
    required: true
  },
  onSelectSession: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['updateSession', 'deleteSession', 'deleteSessions'])

// 计算属性：排序后的会话列表（置顶的在前）
const sortedSessions = computed(() => {
  return [...props.sessions].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return new Date(b.updatedAt) - new Date(a.updatedAt)
  })
})

// 打开菜单
const openMenu = (sessionId, event) => {
  currentMenuSessionId.value = sessionId
  const rect = event.target.closest('.sidebar-chat-item').getBoundingClientRect()
  const sidebarRect = event.target.closest('.sidebar').getBoundingClientRect()
  menuPosition.value = {
    top: rect.bottom - sidebarRect.top + 4,
    left: rect.left - sidebarRect.left + rect.width - 120
  }
  showMenu.value = true
}

// 关闭菜单
const closeMenu = () => {
  showMenu.value = false
  menuPosition.value = null
  currentMenuSessionId.value = null
}

// 点击外部关闭菜单
const handleClickOutside = (event) => {
  if (showMenu.value && !event.target.closest('.sidebar-menu')) {
    closeMenu()
  }
}

// 置顶
const handlePin = () => {
  const session = props.sessions.find(s => s.id === currentMenuSessionId.value)
  if (session) {
    emit('updateSession', {
      ...session,
      isPinned: !session.isPinned
    })
  }
  closeMenu()
}

// 重命名
const handleRename = () => {
  const session = props.sessions.find(s => s.id === currentMenuSessionId.value)
  if (session) {
    renameValue.value = session.title
    showRenameDialog.value = true
    nextTick(() => {
      if (renameInputRef.value) {
        renameInputRef.value.focus()
        renameInputRef.value.select()
      }
    })
  }
  closeMenu()
}

// 确认重命名
const confirmRename = () => {
  if (renameValue.value.trim()) {
    const session = props.sessions.find(s => s.id === currentMenuSessionId.value)
    if (session) {
      emit('updateSession', {
        ...session,
        title: renameValue.value.trim()
      })
    }
  }
  closeRenameDialog()
}

// 关闭重命名对话框
const closeRenameDialog = () => {
  showRenameDialog.value = false
  renameValue.value = ''
}

// 删除
const handleDelete = () => {
  emit('deleteSession', currentMenuSessionId.value)
  closeMenu()
}

// 批量操作
const handleBatchOperation = () => {
  isBatchMode.value = true
  selectedSessions.value.clear()
  closeMenu()
}

// 退出批量操作模式
const exitBatchMode = () => {
  isBatchMode.value = false
  selectedSessions.value.clear()
}

// 切换选择
const toggleSelect = (sessionId) => {
  if (selectedSessions.value.has(sessionId)) {
    selectedSessions.value.delete(sessionId)
  } else {
    selectedSessions.value.add(sessionId)
  }
}

// 全选/取消全选
const toggleSelectAll = () => {
  if (selectedSessions.value.size === props.sessions.length) {
    selectedSessions.value.clear()
  } else {
    selectedSessions.value = new Set(props.sessions.map(s => s.id))
  }
}

// 删除选中的会话
const deleteSelected = () => {
  if (selectedSessions.value.size > 0) {
    emit('deleteSessions', Array.from(selectedSessions.value))
    exitBatchMode()
  }
}

// 处理列表项点击
const handleItemClick = (sessionId) => {
  if (isBatchMode.value) {
    toggleSelect(sessionId)
  } else {
    props.onSelectSession(sessionId)
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f0f4f9;
  transition: width 0.3s;
  width: 280px;
}

.sidebar-closed {
  width: 68px;
}

.sidebar-header {
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar-toggle,
.sidebar-search {
  padding: 8px;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-toggle:hover,
.sidebar-search:hover {
  background: #e1e5ea;
}

.sidebar-new-chat {
  padding: 12px;
  margin-top: 8px;
}

.new-chat-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #dde3ea;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  transition: background-color 0.2s;
  padding: 12px 16px;
  width: 100%;
}

.new-chat-btn-closed {
  width: 40px;
  height: 40px;
  justify-content: center;
  padding: 0;
  margin-left: 2px;
}

.new-chat-btn:hover {
  background: #d3d9e0;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.sidebar-section {
  margin-bottom: 24px;
}

.sidebar-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.sidebar-section-header:hover {
  background: #e1e5ea;
}

.sidebar-section-header h3 {
  margin: 0;
  padding: 0;
  font-size: 14px;
  font-weight: 500;
  color: #444746;
}

.sidebar-arrow {
  font-size: 12px;
  opacity: 0.6;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  font-size: 14px;
  color: #444746;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.sidebar-item:hover {
  background: #e1e5ea;
}

.sidebar-section-title {
  padding: 0;
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #444746;
}

.sidebar-chats {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar-chat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  font-size: 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
}

.sidebar-chat-item:hover {
  background: #e1e5ea;
}

.sidebar-chat-item.active {
  background: #d3e3fd;
}

.sidebar-chat-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-pin {
  opacity: 0.6;
  flex-shrink: 0;
}

.sidebar-chat-more {
  opacity: 0;
  padding: 4px;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.sidebar-chat-item:hover .sidebar-chat-more {
  opacity: 1;
}

.sidebar-chat-more:hover {
  background: rgba(0, 0, 0, 0.05);
}

.sidebar-icons-closed {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
}

.sidebar-icon-btn {
  padding: 8px;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s;
}

.sidebar-icon-btn:hover {
  background: #e1e5ea;
}

.sidebar-footer {
  margin-top: auto;
  border-top: 1px solid #e1e5ea;
  padding: 12px;
}

.sidebar-footer-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.sidebar-footer-item-closed {
  justify-content: center;
}

.sidebar-footer-item:hover {
  background: #e1e5ea;
}

/* 自定义滚动条 */
.sidebar-content::-webkit-scrollbar {
  width: 8px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: #d3d9e0;
  border-radius: 4px;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: #c2c8d0;
}


.sidebar-refresh-btn {
  padding: 4px;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0.6;
  transition: all 0.2s;
}

.sidebar-refresh-btn:hover {
  opacity: 1;
  background: #e1e5ea;
}

.sidebar-chat-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  cursor: pointer;
  flex-shrink: 0;
}

.sidebar-chat-item.selected {
  background: #e1e5ea;
}

.sidebar-batch-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  margin-bottom: 8px;
  background: white;
  border-radius: 8px;
}

.sidebar-batch-select-all {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: #1a73e8;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: background-color 0.2s;
}

.sidebar-batch-select-all:hover {
  background: #1557b0;
}

.sidebar-batch-count {
  flex: 1;
  font-size: 13px;
  color: #5e5e5e;
}

.sidebar-batch-cancel {
  padding: 4px 12px;
  background: white;
  border: 1px solid #e1e5ea;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: #444746;
  transition: background-color 0.2s;
}

.sidebar-batch-cancel:hover {
  background: #f0f4f9;
}

.sidebar-batch-delete {
  padding: 4px 12px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.sidebar-batch-delete:hover {
  background: #c82333;
}

.sidebar-menu {
  position: absolute;
  background: white;
  border: 1px solid #e1e5ea;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 140px;
  overflow: hidden;
}

.sidebar-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 16px;
  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  color: #444746;
  transition: background-color 0.2s;
}

.sidebar-menu-item:hover {
  background: #f0f4f9;
}

.sidebar-menu-item:last-child {
  border-top: 1px solid #e1e5ea;
}

.sidebar-rename-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.sidebar-rename-dialog {
  background: white;
  border-radius: 12px;
  padding: 24px;
  min-width: 400px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.sidebar-rename-dialog h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f1f1f;
}

.sidebar-rename-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e1e5ea;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 16px;
  outline: none;
  transition: border-color 0.2s;
}

.sidebar-rename-input:focus {
  border-color: #1a73e8;
}

.sidebar-rename-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.sidebar-rename-cancel,
.sidebar-rename-confirm {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.sidebar-rename-cancel {
  background: white;
  border: 1px solid #e1e5ea;
  color: #444746;
}

.sidebar-rename-cancel:hover {
  background: #f0f4f9;
}

.sidebar-rename-confirm {
  background: #1a73e8;
  color: white;
  border: none;
}

.sidebar-rename-confirm:hover {
  background: #1557b0;
}
</style>
