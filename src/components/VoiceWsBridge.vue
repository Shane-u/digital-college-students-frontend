<template>
  <div aria-hidden="true" />
</template>

<script>
import { onMounted, onUnmounted, ref } from 'vue'

/**
 * 可选：连接 rustpbx_go 的 /ws2，收到 frontendCommand 时派发 CustomEvent，由 NavCommandListener 执行路由切换。
 * 解耦：不直接操作 router，只派发事件。wsUrl 可通过 prop 或环境变量配置。
 */
export default {
  name: 'VoiceWsBridge',
  props: {
    wsUrl: { type: String, default: '' }
  },
  setup(props) {
    const ws = ref(null)
    const effectiveUrl = () => props.wsUrl || (import.meta.env.VITE_WS2_URL || 'ws://localhost:8081/ws2')

    const setupWebSocket = (socket, url) => {
      socket.onopen = () => {
        console.log('VoiceWsBridge: WebSocket connection opened successfully to:', url)
        // 发送测试消息确认连接
        try {
          socket.send(JSON.stringify({ event: 'test', message: 'Connection established' }))
          console.log('VoiceWsBridge: Test message sent to backend')
        } catch (err) {
          console.error('VoiceWsBridge: Failed to send test message:', err)
        }
      }
      
      socket.onerror = (error) => {
        console.error('VoiceWsBridge: WebSocket connection error:', error)
      }
      
      socket.onclose = (event) => {
        console.log('VoiceWsBridge: WebSocket connection closed. Code:', event.code, 'Reason:', event.reason, 'WasClean:', event.wasClean)
        // 如果连接关闭，尝试重连（但只在没有其他连接时）
        if (event.code !== 1000) { // 非正常关闭
          setTimeout(() => {
            if (!ws.value || ws.value.readyState === WebSocket.CLOSED) {
              console.log('VoiceWsBridge: Attempting to reconnect...')
              try {
                const newSocket = new WebSocket(url)
                ws.value = newSocket
                setupWebSocket(newSocket, url)
              } catch (err) {
                console.error('VoiceWsBridge: Reconnection failed:', err)
              }
            }
          }, 3000)
        }
      }
      
      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          console.log('VoiceWsBridge received raw message:', event.data)
          console.log('VoiceWsBridge parsed message:', msg)
          // 处理所有 frontendCommand 消息，无论是否有 payload
          if (msg.event === 'frontendCommand') {
            const payload = msg.payload || {}
            console.log('VoiceWsBridge: Dispatching frontendCommand event with payload:', payload)
            window.dispatchEvent(new CustomEvent('frontendCommand', { detail: payload }))
          } else {
            // 记录其他类型的消息，但不处理（这些消息可能由 VoiceModeButton 处理）
            console.log('VoiceWsBridge: Received non-frontendCommand message. event:', msg.event)
          }
        } catch (err) {
          console.error('VoiceWsBridge: Error parsing message:', err, 'Raw data:', event.data)
        }
      }
    }

    onMounted(() => {
      const url = effectiveUrl()
      console.log('VoiceWsBridge: Attempting to connect to:', url)
      if (!url) {
        console.warn('VoiceWsBridge: No WebSocket URL configured')
        return
      }
      try {
        const socket = new WebSocket(url)
        ws.value = socket
        setupWebSocket(socket, url)
      } catch (err) {
        console.error('VoiceWsBridge: Failed to create WebSocket connection:', err)
      }
    })

    onUnmounted(() => {
      if (ws.value && ws.value.readyState === WebSocket.OPEN) {
        ws.value.close()
      }
    })

    return {}
  }
}
</script>
