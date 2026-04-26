<template>
  <div class="mascot-container" :class="{ 'expanded': isExpanded, 'chat-open': isChatOpen }">
    <!-- 右侧边栏按钮 - 纵向排列的"三鼻孔" -->
    <div 
      v-if="!isChatOpen"
      class="sidebar-toggle" 
      :class="{ 'collapsed': !isExpanded }"
      @click="toggleMascot"
    >
      <span class="text-char">孪</span>
      <span class="text-char">孪</span>
      <!-- <span class="text-char">孔</span> -->
    </div>
    
    <!-- GIF 动画容器 - 聊天框打开时隐藏 -->
    <div 
      v-if="isExpanded && !isChatOpen"
      class="mascot-image-wrapper" 
      @click="handleMascotClick"
    >
      <!-- 深蓝色循环提示气泡 -->
      <div v-if="showVoiceTip" class="mascot-tip" @click.stop="handleMascotClick">
        快来试试语音玩转平台~
      </div>
      <video
        :src="sanbikongVideo"
        class="mascot-image"
        autoplay
        muted
        loop
        playsinline
      ></video>
    </div>
    
    <!-- 聊天对话框 -->
    <div v-if="isChatOpen" class="chat-container">
      <!-- 聊天头部 -->
      <div class="chat-header">
        <div class="chat-navbar">
          <div class="chat-title">智能助理</div>
          <button class="collapse-btn" @click="toggleChat">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 15l-6-6-6 6"/>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- 消息列表 -->
      <div class="message-list" ref="messagesContainer">
        <div 
          v-for="(msg, index) in messages" 
          :key="index" 
          class="message-item"
          :class="{ 'message-right': msg.position === 'right' }"
        >
          <!-- 系统消息 -->
          <div v-if="msg.type === 'system'" class="system-message">
            {{ msg.content.text }}
          </div>
          
          <!-- 普通消息 -->
          <template v-else>
            <div v-if="shouldRenderMessage(msg)" class="message-bubble-wrapper">
              <div v-if="msg.position !== 'right'" class="message-avatar assistant-avatar">
                <img :src="robotAvatar" alt="助手头像" class="assistant-avatar-img" />
              </div>
              <div
                class="message-stack"
                :class="{ 'stack-right': msg.position === 'right' }"
              >
                <div
                  v-if="msg.reasoning && msg.position !== 'right'"
                  class="reasoning-content"
                  :class="{ collapsed: msg.reasoningDone && msg.reasoningCollapsed }"
                >
                  <div class="reasoning-label">
                    <span v-if="!msg.reasoningDone">🧠 孪孪正在头脑风暴中...</span>
                    <span v-else>✅ 深度思考已完成</span>
                    <button
                      v-if="msg.reasoningDone"
                      class="reasoning-toggle"
                      @click="toggleReasoning(index)"
                    >{{ msg.reasoningCollapsed ? '展开' : '收起' }}</button>
                  </div>
                  <div
                    class="reasoning-text"
                    v-show="!msg.reasoningDone || !msg.reasoningCollapsed"
                    v-html="renderReasoningContent(msg.reasoning)"
                  ></div>
                  <div
                    v-if="!msg.reasoningCollapsed || !msg.reasoningDone"
                    class="reasoning-divider"
                  ></div>
                </div>
                <div 
                  v-if="hasVisibleContent(msg)"
                  class="message-bubble" 
                  :class="{ 
                    'bubble-left': msg.position !== 'right',
                    'bubble-right': msg.position === 'right'
                  }"
                >
                  <div v-if="msg.type === 'text'" class="bubble-content" v-html="renderMessageContent(msg)"></div>
                  <img v-else-if="msg.type === 'image'" :src="msg.content.picUrl" alt="图片" class="message-image" />
                </div>
              </div>
              <div v-if="msg.position === 'right'" class="message-avatar user-avatar">
                <img v-if="userAvatarUrl" :src="userAvatarUrl" alt="用户头像" class="user-avatar-img" />
                <div v-else class="avatar-icon">👤</div>
              </div>
            </div>
          </template>
        </div>
        
      </div>
      
      <!-- 快捷回复 -->
      <div class="quick-replies">
        <button
          v-for="(reply, index) in quickReplyItems"
          :key="index"
          class="quick-reply-btn"
          :class="{ 
            'highlight': reply.isHighlight,
            'new': reply.isNew,
            'voice-action': reply.name === '语音操作',
            'voice-control': reply.isVoiceControl,
            'voice-hangup': reply.name === '挂断'
          }"
          @click="handleQuickReplyClick(reply)"
        >
          <span v-if="reply.isNew" class="new-dot"></span>
          {{ reply.name }}
        </button>
      </div>
      
      <!-- 输入区域 -->
      <div class="input-area">
        <div class="mode-toggle">
          <button
            class="mode-btn"
            :class="{ active: deepThinkingEnabled }"
            type="button"
            @click="toggleDeepThinking"
          >
            深度思考
          </button>
        </div>
        <div class="input-row">
          <input
            v-model="userMessage"
            @keyup.enter="handleEnterSend"
            placeholder="有问题，尽管问，Shift+Enter换行"
            class="message-input"
          />
          <VoiceWaveVisualizer
            v-if="showVoiceVisualizer"
            class="voice-wave-slot"
            style="position:absolute;top:50%;right:12px;transform:translateY(-50%);z-index:3;"
            :volume="micVolume"
            :is-speaking="isVoiceSpeaking"
            :is-muted="isVoiceMuted"
          />
          <button
            v-if="!showVoiceVisualizer"
            class="send-btn"
            type="button"
            :class="sendButtonClass"
            :disabled="sendButtonDisabled"
            @click="handleSendButtonClick"
          >
            ↑
          </button>
        </div>
      </div>

    </div>
    <audio ref="audioRef" autoplay playsinline />
  </div>
</template>

<script>
import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue';
import { marked } from 'marked';
import { streamChat } from '../api/chatApi';
import sanbikongVideo from '../assets/sanbikong.mp4';
import robotAvatar from '../assets/luanluan.jpg';
import VoiceWaveVisualizer from './common/VoiceWaveVisualizer.vue';

export default {
  name: 'WankoAssistant',
  components: {
    VoiceWaveVisualizer
  },
  setup() {
    const isExpanded = ref(true);
    const isChatOpen = ref(false);
    const userMessage = ref('');
    const messages = ref([]);
    const isTyping = ref(false);
    const deepThinkingEnabled = ref(false);
    const messagesContainer = ref(null);
    const showVoiceTip = ref(false);
    let tipInterval = null;
    let tipHideTimer = null;
    let abortController = null; // 用于取消流式请求
    let currentSessionId = ref(''); // 当前会话ID
    const userAvatarUrl = ref('');
    const voiceActionVisible = ref(false);
    const voiceConnecting = ref(false);
    const isVoiceConnected = ref(false);
    const isVoiceMuted = ref(false);
    const isVoiceStreaming = ref(false);
    const micVolume = ref(0);
    const isVoiceSpeaking = ref(false);
    const voiceAssistantMsgIndex = ref(-1);
    const audioRef = ref(null);
    const WS_URL = import.meta.env.VITE_WS2_URL || 'ws://localhost:8081/ws2';
    let voiceWs = null;
    let peerConnection = null;
    let localStream = null;
    let voiceStreamBuffer = '';
    let micAudioContext = null;
    let micSource = null;
    let micAnalyser = null;
    let micDataArray = null;
    let micRaf = null;
    
    const markedOptions = {
      gfm: true, 
      breaks: true, 
      silent: true
    };
    
    // 初始消息
    const initialMessages = [
      {
        type: 'system',
        content: { text: '数字校园专属智能助手 为您服务' },
      },
      {
        type: 'text',
        content: { text: 'Hi，我是你的专属智能助理，有问题请随时找我哦~' },
        position: 'left',
      },
    ];
    
    // 快捷回复
    const quickActions = [
      { name: '语音操作', isNew: true, isHighlight: true },
    ];
    const showVoiceVisualizer = computed(() => voiceConnecting.value || isVoiceConnected.value);
    const quickReplyItems = computed(() => {
      const items = [...quickActions];
      if (voiceActionVisible.value) {
        items.push(
          { name: isVoiceMuted.value ? '取消静音' : '静音', isVoiceControl: true },
          { name: '挂断', isVoiceControl: true }
        );
      }
      return items;
    });
    
    const scrollToBottom = () => {
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
      });
    };
    
    const appendMsg = (msg) => {
      messages.value.push(msg);
      scrollToBottom();
    };

    const ensureVoiceAssistantMessage = () => {
      const current = messages.value[voiceAssistantMsgIndex.value];
      if (current && current.type === 'text' && current.position === 'left') {
        return;
      }
      appendMsg({
        type: 'text',
        content: { text: '' },
        position: 'left',
      });
      voiceAssistantMsgIndex.value = messages.value.length - 1;
    };

    const updateVoiceAssistantText = (text) => {
      ensureVoiceAssistantMessage();
      if (messages.value[voiceAssistantMsgIndex.value]) {
        messages.value[voiceAssistantMsgIndex.value].content.text = text || '';
      }
    };

    const extractVoiceText = (msg) => {
      if (!msg) return '';
      if (typeof msg.text === 'string') return msg.text;
      if (typeof msg.content === 'string') return msg.content;
      if (typeof msg.message === 'string') return msg.message;
      if (typeof msg.payload === 'string') return msg.payload;
      if (msg.payload && typeof msg.payload === 'object') {
        if (typeof msg.payload.text === 'string') return msg.payload.text;
        if (typeof msg.payload.message === 'string') return msg.payload.message;
        if (typeof msg.payload.content === 'string') return msg.payload.content;
      }
      return '';
    };

    const closeVoiceConnection = () => {
      if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
      }
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
      }
      if (voiceWs && voiceWs.readyState === WebSocket.OPEN) {
        voiceWs.close();
      }
      voiceWs = null;
      isVoiceConnected.value = false;
      isVoiceMuted.value = false;
      isVoiceStreaming.value = false;
      voiceStreamBuffer = '';
      voiceAssistantMsgIndex.value = -1;
      stopMicMonitor();
    };

    const stopMicMonitor = () => {
      if (micRaf) {
        cancelAnimationFrame(micRaf);
        micRaf = null;
      }
      if (micSource) {
        try { micSource.disconnect(); } catch {}
        micSource = null;
      }
      if (micAnalyser) {
        try { micAnalyser.disconnect(); } catch {}
        micAnalyser = null;
      }
      if (micAudioContext) {
        micAudioContext.close().catch(() => {});
        micAudioContext = null;
      }
      micDataArray = null;
      micVolume.value = 0;
      isVoiceSpeaking.value = false;
    };

    const startMicMonitor = (stream) => {
      stopMicMonitor();
      if (!stream) return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      micAudioContext = new AudioCtx();
      micSource = micAudioContext.createMediaStreamSource(stream);
      micAnalyser = micAudioContext.createAnalyser();
      micAnalyser.fftSize = 256;
      micAnalyser.smoothingTimeConstant = 0.8;
      micSource.connect(micAnalyser);
      micDataArray = new Uint8Array(micAnalyser.fftSize);

      const measure = () => {
        if (!micAnalyser || !micDataArray) return;
        micAnalyser.getByteTimeDomainData(micDataArray);
        let sum = 0;
        for (let i = 0; i < micDataArray.length; i += 1) {
          const v = (micDataArray[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / micDataArray.length);
        const normalized = Math.min(1, rms * 10);
        micVolume.value = normalized < 0.03 || isVoiceMuted.value ? 0 : normalized;
        isVoiceSpeaking.value = !isVoiceMuted.value && micVolume.value > 0.08;
        micRaf = requestAnimationFrame(measure);
      };
      micRaf = requestAnimationFrame(measure);
    };

    const connectVoiceDirectly = async () => {
      if (isVoiceConnected.value || voiceConnecting.value) return;
      voiceActionVisible.value = true;
      voiceConnecting.value = true;
      if (!WS_URL) {
        voiceConnecting.value = false;
        voiceActionVisible.value = false;
        return;
      }
      try {
        voiceWs = new WebSocket(WS_URL);
      } catch (error) {
        voiceConnecting.value = false;
        voiceActionVisible.value = false;
        return;
      }

      voiceWs.onopen = async () => {
        try {
          peerConnection = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
          });
          localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
          startMicMonitor(localStream);

          peerConnection.ontrack = (event) => {
            if (audioRef.value && event.streams[0]) {
              audioRef.value.srcObject = event.streams[0];
              audioRef.value.play().catch(() => {});
            }
          };

          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);
          voiceWs.send(JSON.stringify({ event: 'offer', sdp: offer.sdp }));
          isVoiceConnected.value = true;
        } catch (error) {
          closeVoiceConnection();
          voiceActionVisible.value = false;
        }
        voiceConnecting.value = false;
      };

      voiceWs.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.event === 'answer' && msg.sdp) {
            peerConnection?.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: msg.sdp })).catch(() => {});
          } else if (msg.event === 'hangup') {
            closeVoiceConnection();
            voiceActionVisible.value = false;
          } else if (msg.event === 'frontendCommand' && msg.payload) {
            window.dispatchEvent(new CustomEvent('frontendCommand', { detail: msg.payload }));
            const commandText = extractVoiceText(msg);
            if (commandText) {
              voiceStreamBuffer = commandText;
              isVoiceStreaming.value = false;
              // 每条语音指令反馈单独占一个助手气泡
              voiceAssistantMsgIndex.value = -1;
              updateVoiceAssistantText(voiceStreamBuffer);
              voiceAssistantMsgIndex.value = -1;
            }
          } else if (msg.event === 'llmStream' || msg.event === 'llmDelta') {
            const deltaText = extractVoiceText(msg);
            if (!deltaText) return;
            if (!isVoiceStreaming.value) {
              // 新一轮流式回复：创建新的助手气泡而不是覆盖上一条
              voiceStreamBuffer = '';
              voiceAssistantMsgIndex.value = -1;
            }
            isVoiceStreaming.value = true;
            voiceStreamBuffer += deltaText;
            updateVoiceAssistantText(voiceStreamBuffer);
          } else if (msg.event === 'llmFinal' || msg.event === 'llmResponse') {
            const finalText = extractVoiceText(msg);
            if (!finalText) return;
            // 某些后端只发 final，不发 stream：也要新建气泡
            if (!isVoiceStreaming.value) {
              voiceAssistantMsgIndex.value = -1;
            }
            voiceStreamBuffer = finalText;
            isVoiceStreaming.value = false;
            updateVoiceAssistantText(voiceStreamBuffer);
            // 完成后重置索引，确保下一条回复新建气泡
            voiceAssistantMsgIndex.value = -1;
          }
        } catch (error) {
          console.error('语音消息解析失败:', error);
        }
      };

      voiceWs.onclose = () => {
        closeVoiceConnection();
        voiceActionVisible.value = false;
        voiceConnecting.value = false;
      };

      voiceWs.onerror = () => {
        voiceActionVisible.value = false;
        voiceConnecting.value = false;
      };
    };

    const hangupVoice = () => {
      if (voiceWs && voiceWs.readyState === WebSocket.OPEN) {
        voiceWs.send(JSON.stringify({ command: 'hangup', reason: 'user_requested', initiator: 'caller' }));
      }
      closeVoiceConnection();
      voiceActionVisible.value = false;
    };

    const toggleVoiceMute = () => {
      if (!localStream) return;
      const track = localStream.getAudioTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        isVoiceMuted.value = !track.enabled;
        if (isVoiceMuted.value) {
          micVolume.value = 0;
          isVoiceSpeaking.value = false;
        }
      }
    };

    const triggerVoiceTip = () => {
      showVoiceTip.value = false;
      nextTick(() => {
        showVoiceTip.value = true;
      });
      if (tipHideTimer) clearTimeout(tipHideTimer);
      tipHideTimer = setTimeout(() => {
        showVoiceTip.value = false;
      }, 2200);
    };

    const startVoiceTipLoop = () => {
      triggerVoiceTip();
      if (tipInterval) clearInterval(tipInterval);
      tipInterval = setInterval(() => {
        if (!isChatOpen.value && isExpanded.value) {
          triggerVoiceTip();
        }
      }, 5000);
    };
    
    const toggleMascot = () => {
      isExpanded.value = !isExpanded.value;
      if (!isExpanded.value) {
        isChatOpen.value = false;
        showVoiceTip.value = false;
      } else if (!isChatOpen.value) {
        triggerVoiceTip();
      }
    };
  
  // 切换当前消息的思考折叠状态
  const toggleReasoning = (msgIndex) => {
    const msg = messages.value[msgIndex];
    if (!msg) return;
    if (!msg.reasoningDone) return; // 仅当思考完成后允许切换
    msg.reasoningCollapsed = !msg.reasoningCollapsed;
    scrollToBottom();
  };
    
    const handleMascotClick = () => {
      // 点击已展开的 GIF 打开聊天
      if (isExpanded.value && !isChatOpen.value) {
        isChatOpen.value = true;
        showVoiceTip.value = false;
        scrollToBottom();
      }
    };
    
    const toggleChat = () => {
      isChatOpen.value = !isChatOpen.value;
      if (isChatOpen.value) {
        scrollToBottom();
      }
    };
    
    const renderMessageContent = (msg) => {
      if (msg.type === 'text') {
        try {
          const text = msg.content.text || '';
          const processedText = text.replace(/\\n/g, '\n');
          return marked.parse(processedText, markedOptions);
        } catch (error) {
          return msg.content.text || '';
        }
      }
      return '';
    };
    
    const renderReasoningContent = (reasoning) => {
      if (!reasoning) return '';
      try {
        const processedText = reasoning.replace(/\\n/g, '\n');
        return marked.parse(processedText, markedOptions);
      } catch (error) {
        return reasoning;
      }
    };
    
    // 避免思考时出现一个空助手气泡与打字指示器并存
    const shouldRenderMessage = (msg) => {
      if (!msg || msg.type !== 'text') return true;
      const isAssistant = msg.position !== 'right';
      const hasText = !!(msg.content && msg.content.text && msg.content.text.length > 0);
      const hasReasoning = !!(msg.reasoning && msg.reasoning.length > 0);
      if (isAssistant && isTyping.value && !hasText && !hasReasoning) {
        return false;
      }
      return true;
    };

    const hasVisibleContent = (msg) => {
      if (!msg) return false;
      if (msg.type === 'image') {
        return !!(msg.content && msg.content.picUrl);
      }
      if (msg.type === 'text') {
        if (msg.position === 'right') return true;
        return !!(msg.content && msg.content.text && msg.content.text.length > 0);
      }
      return false;
    };
    
    // 构建消息历史
    const buildMessageHistory = () => {
      const history = [];
      messages.value.forEach(msg => {
        if (msg.type === 'text' && msg.position !== 'system') {
          history.push({
            role: msg.position === 'right' ? 'user' : 'assistant',
            content: msg.content.text || ''
          });
        }
      });
      return history;
    };
    
    // 打字机式拼接渲染队列（逐字显示）
    const reasoningQueue = ref('');
    const contentQueue = ref('');
    let typingRaf = null;
    const startTyping = (assistantIndex) => {
      if (typingRaf) return;
      const step = () => {
        let didUpdate = false;
        if (reasoningQueue.value.length > 0 && messages.value[assistantIndex]) {
          const ch = reasoningQueue.value.slice(0, 1);
          reasoningQueue.value = reasoningQueue.value.slice(1);
          messages.value[assistantIndex].reasoning =
            (messages.value[assistantIndex].reasoning || '') + ch;
          didUpdate = true;
        } else if (contentQueue.value.length > 0 && messages.value[assistantIndex]) {
          const ch = contentQueue.value.slice(0, 1);
          contentQueue.value = contentQueue.value.slice(1);
          messages.value[assistantIndex].content.text =
            (messages.value[assistantIndex].content.text || '') + ch;
          didUpdate = true;
        }
        if (didUpdate) {
          scrollToBottom();
        }
        if (reasoningQueue.value.length > 0 || contentQueue.value.length > 0) {
          typingRaf = requestAnimationFrame(step);
        } else {
          typingRaf = null;
        }
      };
      typingRaf = requestAnimationFrame(step);
    };
    
    const stopTyping = () => {
      if (typingRaf) {
        cancelAnimationFrame(typingRaf);
        typingRaf = null;
      }
      reasoningQueue.value = '';
      contentQueue.value = '';
    };
    
    const cancelCurrentStream = () => {
      if (abortController) {
        abortController.abort();
        abortController = null;
      }
      stopTyping();
      isTyping.value = false;
    };
    
    const sendButtonState = computed(() => {
      if (isTyping.value) return 'streaming';
      return userMessage.value.trim().length > 0 ? 'ready' : 'disabled';
    });

    const sendButtonDisabled = computed(() => sendButtonState.value === 'disabled');

    const sendButtonClass = computed(() => {
      return {
        'state-disabled': sendButtonState.value === 'disabled',
        'state-ready': sendButtonState.value === 'ready',
        'state-streaming': sendButtonState.value === 'streaming'
      };
    });

    const sendQuestionToAI = async (question) => {
      try {
        if (abortController) {
          abortController.abort();
        }
        stopTyping();
        
        isTyping.value = true;
        
        // 构建消息历史
        const messageHistory = buildMessageHistory();
        messageHistory.push({
          role: 'user',
          content: question
        });
        
        // 创建新的助手消息
        const assistantMsgIndex = messages.value.length;
        appendMsg({
          type: 'text',
          content: { text: '' },
          position: 'left',
          reasoning: '',
          reasoningDone: false,
          reasoningCollapsed: false
        });
        
        // 流式输出处理
        abortController = await streamChat(
          {
            messages: messageHistory,
            model: 'doubao-seed-1-6-251015',
            temperature: 0.7,
            stream: true,
            maxTokens: 2048,
            sessionId: currentSessionId.value || undefined,
            thinkingType: deepThinkingEnabled.value ? 'enabled' : 'disabled'
          },
          // onMessage 回调：delta 为本次新增片段，采用逐字拼接
          (reasoning, content, type, delta) => {
            if (messages.value[assistantMsgIndex]) {
              if (type === 'reasoning') {
                reasoningQueue.value += (delta || '');
              } else if (type === 'content') {
                contentQueue.value += (delta || '');
              }
              startTyping(assistantMsgIndex);
            }
          },
          // onError 回调
          (error) => {
            console.error('流式输出错误:', error);
            isTyping.value = false;
            if (messages.value[assistantMsgIndex]) {
              messages.value[assistantMsgIndex].content.text = '抱歉，我暂时无法回答您的问题，请稍后再试。';
            } else {
              appendMsg({
                type: 'text',
                content: { text: '抱歉，我暂时无法回答您的问题，请稍后再试。' },
                position: 'left',
              });
            }
            scrollToBottom();
          },
          // onComplete 回调
          (reasoning, content) => {
            isTyping.value = false;
            if (messages.value[assistantMsgIndex]) {
              if (content) {
                // 将队列剩余内容一次性刷完
                contentQueue.value += '';
              }
              if (reasoning) {
                reasoningQueue.value += '';
              }
              // 兜底：完成时确保思考标记为已完成
              messages.value[assistantMsgIndex].reasoningDone = true;
              messages.value[assistantMsgIndex].reasoningCollapsed = true;
            }
            scrollToBottom();
            abortController = null;
          }
        );
      } catch (error) {
        console.error('发送消息错误:', error);
        isTyping.value = false;
        appendMsg({
          type: 'text',
          content: { text: '抱歉，我暂时无法回答您的问题，请稍后再试。' },
          position: 'left',
        });
        scrollToBottom();
      }
    };
    
    const handleSend = (type = 'text', val = null) => {
      if (isTyping.value) return;
      const text = (val !== null ? val : userMessage.value).trim();
      if (!text) return;
      
      appendMsg({
        type: 'text',
        content: { text: text },
        position: 'right',
      });
      
      userMessage.value = '';
      sendQuestionToAI(text);
    };

    const handleEnterSend = (event) => {
      if (event.shiftKey) return;
      if (isTyping.value) return;
      event.preventDefault?.();
      handleSend();
    };

    const handleSendButtonClick = () => {
      if (sendButtonDisabled.value && !isTyping.value) return;
      const state = sendButtonState.value;
      if (state === 'ready') {
        handleSend();
      } else if (state === 'streaming') {
        cancelCurrentStream();
      }
    };

    const toggleDeepThinking = () => {
      deepThinkingEnabled.value = !deepThinkingEnabled.value;
    };
    
    const handleQuickReplyClick = (item) => {
      if (item.name === '语音操作') {
        isChatOpen.value = true;
        connectVoiceDirectly();
        return;
      }
      if (item.name === '静音' || item.name === '取消静音') {
        toggleVoiceMute();
        return;
      }
      if (item.name === '挂断') {
        hangupVoice();
        return;
      }
      handleSend('text', item.name);
    };
    
    onMounted(() => {
      messages.value = [...initialMessages];
      scrollToBottom();
      startVoiceTipLoop();
      // 读取用户头像
      try {
        const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        if (profile && profile.avatar) {
          userAvatarUrl.value = profile.avatar;
        }
      } catch {}
      // 监听 storage 事件以便头像更新后即刻生效
      const updateAvatarFromStorage = () => {
        try {
          const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
          userAvatarUrl.value = profile?.avatar || '';
        } catch {
          userAvatarUrl.value = '';
        }
      };
      window.addEventListener('storage', updateAvatarFromStorage);
      // 监听自定义事件（同页内更新）
      const onAvatarUpdated = (e) => {
        userAvatarUrl.value = e?.detail || userAvatarUrl.value;
      };
      window.addEventListener('user-avatar-updated', onAvatarUpdated);
      // 在卸载时移除
      onUnmounted(() => {
        window.removeEventListener('storage', updateAvatarFromStorage);
        window.removeEventListener('user-avatar-updated', onAvatarUpdated);
      });
    });
    
    // 组件卸载时取消请求
    onUnmounted(() => {
      if (abortController) {
        abortController.abort();
      }
      if (tipInterval) clearInterval(tipInterval);
      if (tipHideTimer) clearTimeout(tipHideTimer);
      hangupVoice();
      stopTyping();
      isTyping.value = false;
    });
    
    return {
      sanbikongVideo,
      robotAvatar,
      isExpanded,
      isChatOpen,
      userMessage,
      messages,
      isTyping,
      deepThinkingEnabled,
      messagesContainer,
      quickReplyItems,
      showVoiceTip,
      showVoiceVisualizer,
      voiceActionVisible,
      voiceConnecting,
      isVoiceConnected,
      isVoiceMuted,
      micVolume,
      isVoiceSpeaking,
      isVoiceStreaming,
      toggleMascot,
      handleMascotClick,
      toggleChat,
      handleSend,
      handleEnterSend,
      handleSendButtonClick,
      sendButtonClass,
      sendButtonState,
      sendButtonDisabled,
      toggleDeepThinking,
      handleQuickReplyClick,
      renderMessageContent,
      renderReasoningContent,
      toggleReasoning,
      shouldRenderMessage,
      hasVisibleContent,
      userAvatarUrl,
      toggleVoiceMute,
      hangupVoice,
      audioRef
    };
  }
};
</script>

<style scoped>
.mascot-container {
  position: fixed;
  bottom: 0;
  right: 0;
  z-index: 999999;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* 右侧边栏按钮 - 纵向排列的"三鼻孔" */
.sidebar-toggle {
  position: fixed;
  right: 0;
  bottom: 96px;
  /* width: 40px; */
  /* height: 120px; */
  padding: 6px;
  background: linear-gradient(135deg, rgb(120,93,148) 0%, #764ba2 100%);
  border-radius: 4px 0 0 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #fff;
  font-size: 12px;
  font-weight: bold;
  /* box-shadow: -2px 2px 12px rgba(0, 0, 0, 0.15); */
  transition: all 0.3s ease;
  z-index: 1000000;
  user-select: none;
  overflow: hidden;
}

/* 左右隐藏：当collapsed时，收缩进去隐藏右半部分 */
.sidebar-toggle.collapsed {
  transition: all 0.5s ease;
  transform: translateX(50%);
}

.sidebar-toggle:hover {
  /* background: linear-gradient(135deg, #764ba2 0%, #667eea 100%); */
  box-shadow: -4px 4px 16px rgba(0, 0, 0, 0.2);
}

.sidebar-toggle:not(.collapsed):hover {
  transform: translateX(-2px);
}

.text-char {
  line-height: 1.2;
  display: block;
}

/* GIF 动画容器 */
.mascot-image-wrapper {
  position: fixed;
  right: 0;
  bottom: 0;
  width: 200px;
  height: 200px;
  overflow: visible;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  animation: slideInFromRight 0.4s ease-out;
  z-index: 999998;
}

@keyframes slideInFromRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.mascot-image {
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: auto;
  user-select: none;
  object-fit: contain;
}

/* 提示文字 */
.mascot-tip {
  position: absolute;
  top: -14px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(10, 34, 84, 0.95);
  color: #fff;
  padding: 10px 16px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.4;
  text-align: center;
  width: 190px;
  white-space: normal;
  z-index: 999999;
  pointer-events: auto;
  opacity: 0;
  animation: fadeInOut 2.2s ease-in-out;
  box-shadow: 0 8px 20px rgba(10, 34, 84, 0.35);
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
  }
  15% {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  85% {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
  }
}

/* 聊天容器 */
.chat-container {
  position: fixed;
  bottom: 0;
  right: 0;
  width: 500px;
  height: 700px;
  background: #fff;
  border-radius: 12px 12px 0 0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  z-index: 999999;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

/* 聊天头部 */
.chat-header {
  background: #fff;
  border-bottom: 1px solid #eee;
}

.chat-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
}

.chat-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  
}

.collapse-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.collapse-btn:hover {
  color: #667eea;
}

/* 深度思考切换 */
.mode-toggle {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.mode-btn {
  flex: 0 0 auto;
  padding: 6px 14px;
  border: 1px solid #dcdcdc;
  border-radius: 18px;
  background: #fff;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.mode-btn:hover {
  border-color: rgb(120,93,148);
  color: rgb(120,93,148);
}

.mode-btn.active {
  background: linear-gradient(135deg, rgb(120,93,148) 0%, #764ba2 100%);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(118, 75, 162, 0.25);
}

/* 消息列表 */
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f7f7f7;
}

.message-item {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
}

.message-item.message-right {
  align-items: flex-end;
}

/* 系统消息 */
.system-message {
  text-align: center;
  font-size: 12px;
  color: #999;
  padding: 8px 0;
  margin: 8px 0;
}

/* 消息气泡包装器 */
.message-bubble-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  max-width: 80%;
}

.message-right .message-bubble-wrapper {
  flex-direction: row;
}

.message-stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 100%;
}

.message-stack.stack-right {
  align-items: flex-end;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: #fff;
}

.message-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-avatar.assistant-avatar {
  background: #eef2ff;
}

.assistant-avatar-img {
  object-fit: contain;
  object-position: center bottom;
  background: #eef2ff;
  padding: 4px;
}

.user-avatar {
  background: linear-gradient(135deg, rgb(120,93,148) 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-icon {
  font-size: 18px;
}

/* 消息气泡 */
.message-bubble {
  padding: 10px 14px;
  border-radius: 6px;
  line-height: 1.5;
  word-wrap: break-word;
  font-size: 14px;
  max-width: 100%;
}

.bubble-left {
  background: #fff;
  color: #333;
  /* border-bottom-left-radius: 4px; */
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.bubble-right {
  background: linear-gradient(135deg, rgb(120,93,148) 0%, #764ba2 100%);
  color: #fff;
  /* border-bottom-right-radius: 4px; */
}

.bubble-content {
  line-height: 1.5;
}

.bubble-content :deep(p) {
  margin: 0 0 8px 0;
}

.bubble-content :deep(p:last-child) {
  margin-bottom: 0;
}

.bubble-content :deep(a) {
  color: #667eea;
  text-decoration: underline;
}

/* 思考过程样式 */
.reasoning-content {
  margin-bottom: 10px;
  padding: 12px 12px 8px 12px;
  background: #e8f3ff;
  border-left: 3px solid #5a8dee;
  border-radius: 8px;
  border: 1px solid rgba(90, 141, 238, 0.3);
  box-shadow: 0 2px 6px rgba(90, 141, 238, 0.12);
  transition: background 0.2s ease, padding 0.2s ease;
}

.reasoning-content.collapsed {
  padding: 10px 12px 6px 12px;
  background: rgba(232, 243, 255, 0.6);
  border-color: rgba(90, 141, 238, 0.2);
  box-shadow: none;
}

.reasoning-label {
  font-size: 12px;
  color: #3a70c1;
  font-weight: 600;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.reasoning-text {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
}

.reasoning-divider {
  height: 1px;
  background: rgba(90, 141, 238, 0.25);
  margin-top: 8px;
}

.reasoning-toggle {
  margin-left: 8px;
  font-size: 12px;
  color: #3a70c1;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 2px 4px;
}
.reasoning-toggle:hover {
  text-decoration: underline;
}

.reasoning-text :deep(p) {
  margin: 0 0 6px 0;
}

.reasoning-text :deep(p:last-child) {
  margin-bottom: 0;
}

.message-image {
  max-width: 100%;
  border-radius: 8px;
}

/* 快捷回复 */
.quick-replies {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 16px;
  background: #f7f7f7;
  /* border-top: 1px solid #eee; */
}

.quick-reply-btn {
  position: relative;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #333;
  display: flex;
  align-items: center;
  gap: 4px;
}

.quick-reply-btn:hover {
  /* background: #f5f5f5;
  border-color: #ccc; */
  border: 1px solid rgb(212,184,224);
  color: rgb(204, 134, 235);
}

.quick-reply-btn.voice-action {
  color: #7b43cf;
  border-color: #bfa0ef;
  background: #f6f0ff;
}

.quick-reply-btn.voice-action:hover {
  color: #fff;
  border-color: #7b43cf;
  background: linear-gradient(135deg, #6d34c7 0%, #8a56dd 100%);
}

.quick-reply-btn.voice-control {
  background: #fff;
  border-color: #d0d7e5;
  color: #334155;
}

.quick-reply-btn.voice-control:hover {
  border-color: #94a3b8;
  color: #1e293b;
  background: #f8fafc;
}

.quick-reply-btn.voice-hangup {
  color: #dc2626;
  border-color: #fecaca;
  background: #fff;
}

.quick-reply-btn.voice-hangup:hover {
  color: #fff;
  border-color: #dc2626;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}


/* 输入区域 */
.input-area {
  padding: 12px 16px;
  background: #fff;
  border-top: 1px solid #eee;
}

.message-input {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 24px;
  padding: 10px 136px 10px 16px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.message-input:focus {
  border-color: rgb(120,93,148);
  box-shadow: 0 0 0 3px rgba(120,93,148,0.1);
}

.input-row {
  position: relative;
}

.voice-wave-slot {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
}

.send-btn {
  position: absolute;
  top: 50%;
  right: 12px;
  width: 32px;
  height: 32px;
  transform: translateY(-50%);
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, rgb(120,93,148) 0%, #764ba2 100%);
  color: #fff;
  font-size: 20px;
  font-weight: 1000;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.1s ease, box-shadow 0.2s ease, background 0.2s ease;
  line-height: 32px;
}

.send-btn.state-ready:hover {
  box-shadow: 0 6px 14px rgba(118, 75, 162, 0.25);
}

.send-btn:active {
  transform: translateY(-50%) scale(0.94);
}

.send-btn.state-disabled {
  background: #e5e5e5;
  color: #bbb;
  cursor: not-allowed;
  box-shadow: none;
}

.send-btn.state-streaming {
  background: linear-gradient(135deg, #b19cd9 0%, #8c73c3 100%);
  animation: pulse 1.2s ease-in-out infinite alternate;
}

.send-btn.state-streaming:hover {
  box-shadow: 0 6px 14px rgba(140, 115, 195, 0.3);
}

@keyframes pulse {
  from {
    box-shadow: 0 0 0 rgba(140, 115, 195, 0.15);
  }
  to {
    box-shadow: 0 0 12px rgba(140, 115, 195, 0.35);
  }
}

.send-icon {
  display: block;
  width: 14px;
  height: 14px;
  position: relative;
  color: inherit;
}

.send-icon::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.send-icon.ready::before {
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 9px solid currentColor;
}

.send-icon.disabled {
  color: #bbb;
}

.send-icon.disabled::before {
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 9px solid currentColor;
}

.send-icon.streaming::before {
  width: 8px;
  height: 8px;
  background: #fff;
  border-radius: 2px;
}

/* 响应式 */
@media (max-width: 768px) {
  .chat-container {
    width: calc(100vw - 20px);
    height: calc(100vh - 100px);
    max-height: 500px;
  }
  
  .mascot-image-wrapper {
    width: 170px;
    height: 170px;
  }
}
</style>
