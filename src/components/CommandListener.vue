<template>
  <div aria-hidden="true" style="display: none;" />
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
// import emitter from '../utils/eventBus'
import { switchNavTab } from '../utils/navCommand'
import { triggerOpenGrowthRecordDialog } from '../utils/growthRecordCommand'

const router = useRouter()
const route = useRoute()

/**
 * 全局监听前端指令（如后端下发的 switchNavTab、addGrowthRecord 等），解耦：仅监听 CustomEvent，不依赖 WebSocket。
 * 任何来源（WebSocket 桥、iframe、测试）只要派发 frontendCommand 事件即可触发相应操作。
 * 事件格式：window.dispatchEvent(new CustomEvent('frontendCommand', { detail: { type: 'switchNavTab', tab: 'home' } }))
 */
const handleFrontendCommand = (event) => {
  const payload = event.detail || {}
  console.log('CommandListener: received frontendCommand event', payload); // 添加日志

  if (payload.type === 'switchNavTab') {
    if (payload.tab) {
      console.log('CommandListener: handling switchNavTab', payload.tab); // 添加日志
      switchNavTab(router, payload.tab)
    }
  } else if (payload.type === 'addGrowthRecord') {
    console.log('CommandListener: handling addGrowthRecord', payload); // 添加日志
    triggerOpenGrowthRecordDialog(
      router,
      payload.date || new Date().toISOString().split('T')[0],
      payload.eventName || '',
      payload.importance || 4,
      payload.personalInsight || ''
    )
  } else if (payload.type === 'addTodayGrowthRecord') {
    console.log('CommandListener: handling addTodayGrowthRecord'); // 添加日志
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    triggerOpenGrowthRecordDialog(router, todayStr, '', 0, '')
  }
  // 可以添加其他全局命令的处理
}

onMounted(() => {
  window.addEventListener('frontendCommand', handleFrontendCommand)
})

onUnmounted(() => {
  window.removeEventListener('frontendCommand', handleFrontendCommand)
})
</script>
