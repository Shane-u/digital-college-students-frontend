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
      <!-- 提示文字 -->
      <div v-if="showTip" class="mascot-tip">
        点击我就可以与我聊天啦~
      </div>
      <img 
        :src="sanbikongGif" 
        alt="看板娘" 
        class="mascot-image"
      />
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
              <div v-if="msg.position !== 'right'" class="message-avatar">
                <img :src="sanbikongGif" alt="助手头像" />
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
          v-for="(reply, index) in quickActions"
          :key="index"
          class="quick-reply-btn"
          :class="{ 
            'highlight': reply.isHighlight,
            'new': reply.isNew
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
          <button
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
  </div>
</template>

<script>
import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue';
import { marked } from 'marked';
import { streamChat } from '../api/chatApi';
import sanbikongGif from '../assets/sanbikong.gif';

export default {
  name: 'WankoAssistant',
  setup() {
    const isExpanded = ref(false);
    const isChatOpen = ref(false);
    const userMessage = ref('');
    const messages = ref([]);
    const isTyping = ref(false);
    const deepThinkingEnabled = ref(false);
    const messagesContainer = ref(null);
    const showTip = ref(false);
    let tipTimer = null;
    let abortController = null; // 用于取消流式请求
    let currentSessionId = ref(''); // 当前会话ID
    const userAvatarUrl = ref('');
    
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
    const quickActions = ref([
      { name: '联系人工服务', isNew: true, isHighlight: true },
      { name: '竞赛信息', isNew: true },
      { name: '职业规划', isHighlight: true },
      // { name: '学习资源' },
    ]);
    
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
    
    const toggleMascot = () => {
      const wasExpanded = isExpanded.value;
      isExpanded.value = !isExpanded.value;
      
      // 如果关闭动画，同时关闭聊天
      if (!isExpanded.value) {
        isChatOpen.value = false;
        // 清除提示文字
        if (tipTimer) {
          clearTimeout(tipTimer);
          tipTimer = null;
        }
        showTip.value = false;
      } else {
        // 动画刚出来时，等动画完全显示后再显示提示文字
        if (!wasExpanded) {
          // 先隐藏提示文字
          showTip.value = false;
          // 等动画完成（0.4s）后再显示提示文字
          setTimeout(() => {
            showTip.value = true;
            if (tipTimer) {
              clearTimeout(tipTimer);
            }
            tipTimer = setTimeout(() => {
              showTip.value = false;
              tipTimer = null;
            }, 3000);
          }, 400); // 等待动画完成
        }
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
      handleSend('text', item.name);
    };
    
    onMounted(() => {
      messages.value = [...initialMessages];
      scrollToBottom();
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
      if (tipTimer) {
        clearTimeout(tipTimer);
      }
      stopTyping();
      isTyping.value = false;
    });
    
    return {
      sanbikongGif,
      isExpanded,
      isChatOpen,
      userMessage,
      messages,
      isTyping,
      deepThinkingEnabled,
      messagesContainer,
      quickActions,
      showTip,
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
      userAvatarUrl
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
  bottom: 200px;
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
  width: 300px;
  height: 300px;
  overflow: hidden;
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
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  white-space: nowrap;
  z-index: 999999;
  pointer-events: none;
  opacity: 0;
  animation: fadeInOut 3s ease-in-out;
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
  padding: 10px 48px 10px 16px;
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
    width: 200px;
    height: 200px;
  }
}
</style>
