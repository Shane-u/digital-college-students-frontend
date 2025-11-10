<template>
  <div class="mascot-container" :class="{ 'expanded': isExpanded, 'chat-open': isChatOpen }">
    <!-- 右侧边栏按钮 - 纵向排列的"三鼻孔" -->
    <div 
      v-if="!isChatOpen"
      class="sidebar-toggle" 
      :class="{ 'collapsed': !isExpanded }"
      @click="toggleMascot"
    >
      <span class="text-char">三</span>
      <span class="text-char">鼻</span>
      <span class="text-char">孔</span>
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
          <div v-else class="message-bubble-wrapper">
            <div v-if="msg.position !== 'right'" class="message-avatar">
              <img :src="sanbikongGif" alt="助手头像" />
            </div>
            <div 
              class="message-bubble" 
              :class="{ 
                'bubble-left': msg.position !== 'right',
                'bubble-right': msg.position === 'right'
              }"
            >
              <div v-if="msg.type === 'text'" class="bubble-content" v-html="renderMessageContent(msg)"></div>
              <img v-else-if="msg.type === 'image'" :src="msg.content.picUrl" alt="图片" class="message-image" />
            </div>
            <div v-if="msg.position === 'right'" class="message-avatar user-avatar">
              <div class="avatar-icon">👤</div>
            </div>
          </div>
        </div>
        
        <!-- 打字指示器 -->
        <div v-if="isTyping" class="message-item">
          <div class="message-bubble-wrapper">
            <div class="message-avatar">
              <img :src="sanbikongGif" alt="助手头像" />
            </div>
            <div class="message-bubble bubble-left typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
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
        <input
          v-model="userMessage"
          @keyup.enter="handleSend"
          placeholder="请输入..."
          class="message-input"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue';
import axios from 'axios';
import { marked } from 'marked';
import sanbikongGif from '../assets/sanbikong.gif';

export default {
  name: 'WankoAssistant',
  setup() {
    const isExpanded = ref(false);
    const isChatOpen = ref(false);
    const userMessage = ref('');
    const messages = ref([]);
    const isTyping = ref(false);
    const messagesContainer = ref(null);
    const showTip = ref(false);
    let tipTimer = null;
    
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
          const processedText = msg.content.text.replace(/\\n/g, '\n');
          return marked.parse(processedText, markedOptions);
        } catch (error) {
          return msg.content.text;
        }
      }
      return '';
    };
    
    const sendQuestionToAI = async (question) => {
      try {
        isTyping.value = true;
        const token = localStorage.getItem('token');
        const headers = {
          'Content-Type': 'application/json'
        };
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
        
        const response = await axios.post('/api/question', {
          question: question
        }, { headers });
        
        if (response.data.code === 1 && response.data.data) {
          let requestId = '';
          const idMatch = response.data.data.match(/ID：([a-f0-9-]+)/i);
          if (idMatch && idMatch[1]) {
            requestId = idMatch[1];
          } else {
            isTyping.value = false;
            appendMsg({
              type: 'text',
              content: { text: '抱歉，处理请求时出现问题，请稍后再试。' },
              position: 'left',
            });
            return;
          }
          
          const answer = await pollForAnswer(requestId, headers);
          isTyping.value = false;
          if (answer) {
            appendMsg({
              type: 'text',
              content: { text: answer },
              position: 'left',
            });
          } else {
            appendMsg({
              type: 'text',
              content: { text: '抱歉，无法获取回答，请稍后再试。' },
              position: 'left',
            });
          }
        } else {
          isTyping.value = false;
          appendMsg({
            type: 'text',
            content: { text: '抱歉，我暂时无法回答您的问题，请稍后再试。' },
            position: 'left',
          });
        }
      } catch (error) {
        isTyping.value = false;
        appendMsg({
          type: 'text',
          content: { text: '抱歉，我暂时无法回答您的问题，请稍后再试。' },
          position: 'left',
        });
      }
    };
    
    const pollForAnswer = async (requestId, headers) => {
      const maxAttempts = 30;
      const interval = 1000;
      let attempts = 0;
      
      while (attempts < maxAttempts) {
        try {
          attempts++;
          const statusResponse = await axios.get(`/api/status/${requestId}`, { headers });
          if (statusResponse.data.code === 1 && statusResponse.data.data) {
            let response = statusResponse.data.data;
            response = response.trim();
            return response;
          }
          if (statusResponse.data.code === 0 && statusResponse.data.msg === "问题结果没有得到，请继续轮询") {
            await new Promise(resolve => setTimeout(resolve, interval));
            continue;
          }
          return null;
        } catch (error) {
          await new Promise(resolve => setTimeout(resolve, interval));
        }
      }
      return null;
    };
    
    const handleSend = (type = 'text', val = null) => {
      const text = val || userMessage.value.trim();
      if (!text) return;
      
      appendMsg({
        type: 'text',
        content: { text: text },
        position: 'right',
      });
      
      userMessage.value = '';
      sendQuestionToAI(text);
    };
    
    const handleQuickReplyClick = (item) => {
      handleSend('text', item.name);
    };
    
    onMounted(() => {
      messages.value = [...initialMessages];
      scrollToBottom();
    });
    
    return {
      sanbikongGif,
      isExpanded,
      isChatOpen,
      userMessage,
      messages,
      isTyping,
      messagesContainer,
      quickActions,
      showTip,
      toggleMascot,
      handleMascotClick,
      toggleChat,
      handleSend,
      handleQuickReplyClick,
      renderMessageContent
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
  width: 360px;
  height: 600px;
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

.message-image {
  max-width: 100%;
  border-radius: 8px;
}

/* 打字指示器 */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 14px;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  background-color: #999;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
  animation-delay: -1.1s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: -0.9s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
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
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.message-input:focus {
  border-color: rgb(120,93,148);
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
