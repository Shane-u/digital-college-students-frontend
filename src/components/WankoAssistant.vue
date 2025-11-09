<template>
  <div class="mascot-container" :class="{ 'expanded': isExpanded, 'chat-open': isChatOpen }">
    <!-- 右侧边栏按钮 -->
    <div class="sidebar-toggle" @click="toggleMascot">
      <span v-if="!isExpanded">◀</span>
      <span v-else>▶</span>
    </div>
    
    <!-- 聊天对话框 -->
    <div v-if="isChatOpen" class="chat-container">
      <div class="chat-header">
        <div class="chat-title">
          <div class="avatar">
            <img :src="sanbikongGif" alt="助手头像" class="avatar-gif" />
          </div>
          <div class="title-text">
            <div class="name">智能助手</div>
            <div class="status">在线为您服务</div>
          </div>
        </div>
        <div class="chat-actions">
          <button class="close-btn" @click="toggleChat">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path d="M6.7 5.3a1 1 0 0 0-1.4 1.4L10.6 12l-5.3 5.3a1 1 0 0 0 1.4 1.4L12 13.4l5.3 5.3a1 1 0 0 0 1.4-1.4L13.4 12l5.3-5.3a1 1 0 0 0-1.4-1.4L12 10.6 6.7 5.3z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="chat-messages" ref="messagesContainer">
        <div 
          v-for="(message, index) in messages" 
          :key="index" 
          class="message-wrapper"
          :class="{ 'user-wrapper': message.isUser, 'assistant-wrapper': !message.isUser }"
        >
          <div v-if="!message.isUser" class="assistant-avatar">
            <img :src="sanbikongGif" alt="助手头像" class="avatar-gif-small" />
          </div>
          <div 
            class="message" 
            :class="{ 'user-message': message.isUser, 'assistant-message': !message.isUser }"
          >
            <div class="message-content" v-if="message.isUser">{{ message.text }}</div>
            <div class="message-content" v-else v-html="message.text"></div>
            <div class="message-time">{{ message.time }}</div>
          </div>
          <div v-if="message.isUser" class="user-avatar">
            <div class="avatar-mini">👤</div>
          </div>
        </div>
        <div v-if="isTyping" class="message-wrapper assistant-wrapper">
          <div class="assistant-avatar">
            <img :src="sanbikongGif" alt="助手头像" class="avatar-gif-small" />
          </div>
          <div class="message assistant-message">
            <div class="message-content typing">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="chat-input-container">
        <div class="input-wrapper">
          <input 
            v-model="userMessage" 
            class="chat-input" 
            placeholder="请输入您的问题..." 
            @keyup.enter="sendMessage"
          />
        </div>
        <button class="send-btn" @click="sendMessage">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor"/>
          </svg>
        </button>
      </div>
      
      <div class="quick-actions">
        <button 
          v-for="(action, index) in quickActions" 
          :key="index" 
          class="quick-action-btn"
          @click="quickReply(action)"
        >
          {{ action }}
        </button>
      </div>
    </div>
    
    <!-- GIF 动画容器 -->
    <div 
      v-if="isExpanded"
      class="mascot-image-wrapper" 
      @click="handleMascotClick"
    >
      <img 
        :src="sanbikongGif" 
        alt="看板娘" 
        class="mascot-image"
      />
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { marked } from 'marked';
import sanbikongGif from '../assets/sanbikong.gif';

export default {
  name: 'WankoAssistant',
  setup() {
    const router = useRouter();
    const isExpanded = ref(false);
    const isChatOpen = ref(false);
    const userMessage = ref('');
    const messages = ref([]);
    const isTyping = ref(false);
    const messagesContainer = ref(null);
    
    const markedOptions = {
      gfm: true, 
      breaks: true, 
      silent: true
    };
    
    const quickActions = [
      '你好',
      '帮助',
      '常见问题',
      '联系客服'
    ];
    
    const formatTime = () => {
      return new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    };
    
    const addMessage = (message) => {
      messages.value.push(message);
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
      });
    };
    
    const toggleMascot = () => {
      isExpanded.value = !isExpanded.value;
      // 如果关闭动画，同时关闭聊天
      if (!isExpanded.value) {
        isChatOpen.value = false;
      }
    };
    
    const handleMascotClick = () => {
      // 点击已展开的 GIF 打开/关闭聊天
      toggleChat();
    };
    
    const toggleChat = () => {
      isChatOpen.value = !isChatOpen.value;
      
      if (isChatOpen.value && messages.value.length === 0) {
        const welcomeMsg = '你好！我是智能助手，有什么可以帮助你的吗？';
        addMessage({
          text: welcomeMsg,
          isUser: false,
          time: formatTime()
        });
      }
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
        
        addMessage({
          text: '',
          isUser: false,
          time: formatTime()
        });
        
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
            const lastIndex = messages.value.map(m => !m.isUser).lastIndexOf(true);
            if (lastIndex >= 0) {
              messages.value[lastIndex].text = "抱歉，处理请求时出现问题，请稍后再试。";
            }
            return;
          }
          
          const answer = await pollForAnswer(requestId, headers);
          if (answer) {
            await simulateStreamingResponse(answer);
          } else {
            const lastIndex = messages.value.map(m => !m.isUser).lastIndexOf(true);
            if (lastIndex >= 0) {
              messages.value[lastIndex].text = "抱歉，无法获取回答，请稍后再试。";
            }
          }
        } else {
          const lastIndex = messages.value.map(m => !m.isUser).lastIndexOf(true);
          if (lastIndex >= 0) {
            messages.value[lastIndex].text = "抱歉，我暂时无法回答您的问题，请稍后再试。";
          }
        }
      } catch (error) {
        const lastIndex = messages.value.map(m => !m.isUser).lastIndexOf(true);
        if (lastIndex >= 0) {
          messages.value[lastIndex].text = "抱歉，我暂时无法回答您的问题，请稍后再试。";
        }
      } finally {
        isTyping.value = false;
      }
    };
    
    const pollForAnswer = async (requestId, headers) => {
      const maxAttempts = 30;
      const interval = 1000;
      let attempts = 0;
      
      const lastIndex = messages.value.map(m => !m.isUser).lastIndexOf(true);
      if (lastIndex >= 0) {
        messages.value[lastIndex].text = "正在思考中，请稍候...";
      }
      
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
            if (lastIndex >= 0 && attempts % 3 === 0) {
              const dots = '.'.repeat((attempts / 3) % 4);
              messages.value[lastIndex].text = `正在思考中，请稍候${dots}`;
            }
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
    
    const simulateStreamingResponse = async (text) => {
      const lastIndex = messages.value.map(m => !m.isUser).lastIndexOf(true);
      if (lastIndex < 0) return;
      
      try {
        const processedText = text.replace(/\\n/g, '\n');
        const htmlText = marked.parse(processedText, markedOptions);
        messages.value[lastIndex].text = htmlText;
      } catch (error) {
        messages.value[lastIndex].text = text;
      }
    };
    
    const sendMessage = async () => {
      if (!userMessage.value.trim()) return;
      addMessage({
        text: userMessage.value,
        isUser: true,
        time: formatTime()
      });
      
      const question = userMessage.value;
      userMessage.value = '';
      await sendQuestionToAI(question);
    };
    
    const quickReply = (action) => {
      addMessage({
        text: action,
        isUser: true,
        time: formatTime()
      });
      sendQuestionToAI(action);
    };
    
    return {
      sanbikongGif,
      isExpanded,
      isChatOpen,
      userMessage,
      messages,
      isTyping,
      messagesContainer,
      quickActions,
      toggleMascot,
      handleMascotClick,
      toggleChat,
      sendMessage,
      quickReply
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
  display: flex;
  flex-direction: row-reverse;
  align-items: flex-end;
  gap: 0;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* 右侧边栏按钮 */
.sidebar-toggle {
  position: fixed;
  right: 0;
  bottom: 200px;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px 0 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  box-shadow: -2px 2px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  z-index: 1000000;
  user-select: none;
}

.sidebar-toggle:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  transform: translateX(-2px);
  box-shadow: -4px 4px 16px rgba(0, 0, 0, 0.2);
}

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
  transform: translateY(0);
  transition: transform 0.3s ease;
}

.mascot-image-wrapper:hover .mascot-image {
  transform: scale(1.05);
}

/* 聊天容器 */
.chat-container {
  width: 380px;
  height: 600px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-gif {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.title-text {
  display: flex;
  flex-direction: column;
}

.name {
  font-size: 16px;
  font-weight: 600;
}

.status {
  font-size: 12px;
  opacity: 0.9;
}

.chat-actions {
  display: flex;
  gap: 8px;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #fff;
  transition: background 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f5f5f5;
}

.message-wrapper {
  display: flex;
  margin-bottom: 16px;
  gap: 8px;
}

.user-wrapper {
  flex-direction: row-reverse;
}

.assistant-wrapper {
  flex-direction: row;
}

.assistant-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: #fff;
}

.avatar-gif-small {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-mini {
  font-size: 18px;
}

.message {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
  word-wrap: break-word;
}

.user-message {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-bottom-right-radius: 4px;
}

.assistant-message {
  background: #fff;
  color: #333;
  border-bottom-left-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.message-content {
  line-height: 1.5;
  font-size: 14px;
}

.message-content :deep(p) {
  margin: 0 0 8px 0;
}

.message-content :deep(p:last-child) {
  margin-bottom: 0;
}

.message-time {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
}

.typing {
  display: flex;
  gap: 4px;
  align-items: center;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #999;
  animation: typing 1.4s infinite;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

.chat-input-container {
  display: flex;
  gap: 8px;
  padding: 16px;
  background: #fff;
  border-top: 1px solid #eee;
}

.input-wrapper {
  flex: 1;
}

.chat-input {
  width: 100%;
  padding: 10px 16px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.chat-input:focus {
  border-color: #667eea;
}

.send-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.send-btn:hover {
  transform: scale(1.1);
}

.quick-actions {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: #fff;
  border-top: 1px solid #eee;
  flex-wrap: wrap;
}

.quick-action-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 16px;
  background: #fff;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-action-btn:hover {
  background: #f0f0f0;
  border-color: #667eea;
  color: #667eea;
}

/* 响应式 */
@media (max-width: 768px) {
  .chat-container {
    width: calc(100vw - 40px);
    height: calc(100vh - 120px);
    max-height: 600px;
  }
  
  .mascot-image-wrapper {
    width: 200px;
    height: 60px;
  }
  
  .mascot-image-wrapper.expanded {
    width: 200px;
    height: 200px;
  }
  
  .mascot-image {
    width: 200px;
  }
}
</style>
