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
        <h3 class="sidebar-section-title">Chats</h3>
        <div class="sidebar-chats">
          <div 
            v-for="session in sessions"
            :key="session.id"
            @click="() => onSelectSession(session.id)"
            :class="['sidebar-chat-item', { 'active': currentSessionId === session.id }]"
          >
            <MessageSquareIcon />
            <span class="sidebar-chat-title">{{ session.title }}</span>
            <PinIcon v-if="session.isPinned" class="sidebar-pin" />
            <button v-if="isOpen" class="sidebar-chat-more">
              <MoreVerticalIcon />
            </button>
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
import { h } from 'vue'

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

defineProps({
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
  padding: 8px 12px;
  margin-bottom: 8px;
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
</style>
