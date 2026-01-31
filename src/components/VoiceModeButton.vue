<template>
  <div class="voice-mode-wrap">
    <!-- 悬浮按钮：点击展开/收起面板 -->
    <button
      type="button"
      class="voice-mode-btn"
      :class="{ connected: isConnected, open: panelOpen }"
      :title="panelOpen ? '收起' : '语音操作模式'"
      @click="panelOpen = !panelOpen"
      aria-label="语音操作模式"
    >
      <span class="voice-mode-btn-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="23"/>
          <line x1="8" y1="23" x2="16" y2="23"/>
        </svg>
      </span>
      <span class="voice-mode-btn-label">语音</span>
    </button>

    <!-- 展开后的控制面板 -->
    <Transition name="voice-panel">
      <div v-if="panelOpen" class="voice-mode-panel">
        <div class="voice-mode-panel-header">
          <span>语音操作</span>
          <button type="button" class="voice-mode-panel-close" @click="panelOpen = false" aria-label="关闭">×</button>
        </div>
        <div class="voice-mode-panel-body">
          <p v-if="statusText" class="voice-mode-status">{{ statusText }}</p>
          <!-- 大模型回复流式展示（连接后显示在旁） -->
          <div v-if="isConnected && (llmStreamText || isStreaming)" class="voice-mode-llm-wrap">
            <div class="voice-mode-llm-label">回复</div>
            <div ref="llmContentRef" class="voice-mode-llm-content" :class="{ streaming: isStreaming }">
              {{ llmStreamText || '…' }}
            </div>
          </div>
          <template v-if="!isConnected">
            <button
              type="button"
              class="voice-mode-cta"
              :disabled="connecting"
              @click="connect"
            >
              {{ connecting ? '连接中…' : '建立语音连接' }}
            </button>
          </template>
          <template v-else>
            <div class="voice-mode-actions">
              <button
                type="button"
                class="voice-mode-action"
                :class="{ active: isMuted }"
                :title="isMuted ? '取消静音' : '静音'"
                @click="toggleMute"
              >
                {{ isMuted ? '取消静音' : '静音' }}
              </button>
              <button
                type="button"
                class="voice-mode-action hangup"
                title="挂断"
                @click="hangup"
              >
                挂断
              </button>
            </div>
          </template>
        </div>
      </div>
    </Transition>

    <!-- 远端 TTS 播放（隐藏） -->
    <audio ref="audioRef" autoplay playsinline />
  </div>
</template>

<script>
import { ref, nextTick, onUnmounted } from 'vue'

const WS_URL = import.meta.env.VITE_WS2_URL || 'ws://localhost:8081/ws2'

export default {
  name: 'VoiceModeButton',
  props: {
    wsUrl: { type: String, default: '' }
  },
  setup(props) {
    const panelOpen = ref(false)
    const connecting = ref(false)
    const isConnected = ref(false)
    const isMuted = ref(false)
    const statusText = ref('')
    const audioRef = ref(null)
    const llmContentRef = ref(null)
    const llmStreamText = ref('')
    const isStreaming = ref(false)

    let ws = null
    let peerConnection = null
    let localStream = null
    let streamBuffer = ''

    const effectiveWsUrl = () => props.wsUrl || WS_URL

    function setStatus(text) {
      statusText.value = text
    }

    function closeConnection() {
      if (peerConnection) {
        peerConnection.close()
        peerConnection = null
      }
      if (localStream) {
        localStream.getTracks().forEach(t => t.stop())
        localStream = null
      }
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
      ws = null
      isConnected.value = false
      llmStreamText.value = ''
      streamBuffer = ''
      isStreaming.value = false
    }

    function scrollLlmToBottom() {
      nextTick(() => {
        if (llmContentRef.value) llmContentRef.value.scrollTop = llmContentRef.value.scrollHeight
      })
    }

    async function connect() {
      if (isConnected.value || connecting.value) return
      connecting.value = true
      setStatus('正在连接…')

      const url = effectiveWsUrl()
      if (!url) {
        setStatus('未配置语音服务地址')
        connecting.value = false
        return
      }
      try {
        ws = new WebSocket(url)
      } catch (e) {
        setStatus('连接失败：' + (e.message || e))
        connecting.value = false
        return
      }

      ws.onopen = async () => {
        setStatus('已连接，正在建立通话…')
        try {
          peerConnection = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
          })
          localStream = await navigator.mediaDevices.getUserMedia({ audio: true })
          localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream))

          peerConnection.ontrack = (event) => {
            if (audioRef.value && event.streams[0]) {
              audioRef.value.srcObject = event.streams[0]
              audioRef.value.play().catch(() => {})
            }
          }

          const offer = await peerConnection.createOffer()
          await peerConnection.setLocalDescription(offer)
          ws.send(JSON.stringify({ event: 'offer', sdp: offer.sdp }))
          isConnected.value = true
          setStatus('已连接，可直接说话')
        } catch (err) {
          setStatus('建立通话失败：' + (err.message || err))
          closeConnection()
        }
        connecting.value = false
      }

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          if (msg.event === 'answer' && msg.sdp) {
            peerConnection.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: msg.sdp })).catch(() => {})
          } else if (msg.event === 'hangup') {
            setStatus('通话已挂断')
            closeConnection()
          } else if (msg.event === 'frontendCommand' && msg.payload) {
            // 派发所有类型的 frontendCommand，让 CommandListener 统一处理
            console.log('VoiceModeButton: Received frontendCommand, dispatching:', msg.payload)
            window.dispatchEvent(new CustomEvent('frontendCommand', { detail: msg.payload }))
          } else if (msg.event === 'llmStream' && msg.text != null) {
            if (!isStreaming.value) streamBuffer = ''
            isStreaming.value = true
            streamBuffer += msg.text
            llmStreamText.value = streamBuffer
            scrollLlmToBottom()
          } else if (msg.event === 'llmFinal' && msg.text != null) {
            streamBuffer = msg.text
            llmStreamText.value = streamBuffer
            isStreaming.value = false
            scrollLlmToBottom()
          }
        } catch (_) {}
      }

      ws.onclose = () => {
        setStatus('连接已断开')
        closeConnection()
        connecting.value = false
      }

      ws.onerror = () => {
        setStatus('连接错误')
        connecting.value = false
      }
    }

    function toggleMute() {
      if (!localStream) return
      const track = localStream.getAudioTracks()[0]
      if (track) {
        track.enabled = !track.enabled
        isMuted.value = !track.enabled
      }
    }

    function hangup() {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ command: 'hangup', reason: 'user_requested', initiator: 'caller' }))
      }
      setStatus('已挂断')
      closeConnection()
    }

    onUnmounted(() => {
      hangup()
    })

    return {
      panelOpen,
      connecting,
      isConnected,
      isMuted,
      statusText,
      audioRef,
      llmContentRef,
      llmStreamText,
      isStreaming,
      connect,
      toggleMute,
      hangup
    }
  }
}
</script>

<style scoped>
.voice-mode-wrap {
  position: fixed;
  bottom: 24px;
  left: 24px;
  z-index: 9998;
}

.voice-mode-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 16px;
  border: none;
  border-radius: 28px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
  transition: transform 0.2s, box-shadow 0.2s;
}
.voice-mode-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
}
.voice-mode-btn.connected {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);
}
.voice-mode-btn.open {
  border-radius: 28px 28px 0 0;
}
.voice-mode-btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}
.voice-mode-btn-label {
  white-space: nowrap;
}

.voice-mode-panel {
  position: absolute;
  left: 0;
  bottom: 100%;
  margin-bottom: 4px;
  width: 320px;
  max-width: calc(100vw - 48px);
  background: #fff;
  border-radius: 12px 12px 0 0;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}
.voice-panel-enter-active,
.voice-panel-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.voice-panel-enter-from,
.voice-panel-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.voice-mode-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: #f8fafc;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}
.voice-mode-panel-close {
  padding: 4px 8px;
  border: none;
  background: transparent;
  font-size: 18px;
  line-height: 1;
  color: #64748b;
  cursor: pointer;
  border-radius: 4px;
}
.voice-mode-panel-close:hover {
  background: #e2e8f0;
  color: #334155;
}

.voice-mode-panel-body {
  padding: 14px;
}

.voice-mode-llm-wrap {
  margin-bottom: 12px;
  padding: 10px 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}
.voice-mode-llm-label {
  font-size: 11px;
  color: #64748b;
  margin-bottom: 6px;
}
.voice-mode-llm-content {
  max-height: 120px;
  overflow-y: auto;
  font-size: 13px;
  line-height: 1.5;
  color: #334155;
  white-space: pre-wrap;
  word-break: break-word;
}
.voice-mode-llm-content.streaming::after {
  content: '▌';
  animation: voice-cursor 0.8s step-end infinite;
  color: #6366f1;
}
@keyframes voice-cursor {
  50% { opacity: 0; }
}

.voice-mode-status {
  margin: 0 0 12px;
  font-size: 12px;
  color: #64748b;
  line-height: 1.4;
}
.voice-mode-cta {
  width: 100%;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}
.voice-mode-cta:hover:not(:disabled) {
  opacity: 0.95;
}
.voice-mode-cta:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.voice-mode-actions {
  display: flex;
  gap: 8px;
}
.voice-mode-action {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  font-size: 13px;
  color: #475569;
  cursor: pointer;
}
.voice-mode-action:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}
.voice-mode-action.active {
  background: #f1f5f9;
  color: #64748b;
}
.voice-mode-action.hangup {
  border-color: #fecaca;
  color: #dc2626;
}
.voice-mode-action.hangup:hover {
  background: #fef2f2;
}
</style>
