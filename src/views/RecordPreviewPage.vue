<template>
  <div class="preview-page">
    <NavBar />
    
    <div class="preview-container">
      <!-- 顶部操作栏 -->
      <div class="preview-header">
        <button class="back-btn" @click="goBack">
          ← 返回
        </button>
        <h1 class="preview-title">记录预览</h1>
        <button class="print-btn" @click="handlePrint">
          🖨️ 打印
        </button>
      </div>

      <!-- PDF风格的预览内容 -->
      <div class="preview-content" ref="printArea">
        <!-- 记录头部 -->
        <div class="record-header">
          <h2 class="record-title">成长记录</h2>
          <div class="record-date">{{ formattedDate }}</div>
        </div>

        <!-- 记录详情 -->
        <div class="record-body">
          <!-- 事件描述 -->
          <div v-if="record.description" class="record-section">
            <h3 class="section-title">事件描述</h3>
            <div class="section-content">{{ record.description }}</div>
          </div>

          <!-- 重要程度 -->
          <div class="record-section">
            <h3 class="section-title">重要程度</h3>
            <div class="section-content">
              <div class="importance-stars">
                <span v-for="i in 5" :key="i" class="star" :class="{ 'filled': i <= record.importance }">
                  ★
                </span>
              </div>
            </div>
          </div>

          <!-- 图片 -->
          <div v-if="record.images && record.images.length > 0" class="record-section">
            <h3 class="section-title">相关图片</h3>
            <div class="section-content">
              <div class="images-grid">
                <div v-for="(image, index) in record.images" :key="index" class="image-item">
                  <img :src="image" :alt="`图片 ${index + 1}`" @click="previewImage(image)" />
                </div>
              </div>
            </div>
          </div>

          <!-- 文件 -->
          <div v-if="record.files && record.files.length > 0" class="record-section">
            <h3 class="section-title">相关文件</h3>
            <div class="section-content">
              <div class="files-list">
                <div v-for="(file, index) in record.files" :key="index" class="file-item" @click="previewFile(file)">
                  <span class="file-icon">{{ getFileIcon(file.name) }}</span>
                  <span class="file-name">{{ file.name }}</span>
                  <button class="file-preview-btn" v-if="canPreviewFile(file.name)">
                    预览
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 个人感悟 -->
          <div v-if="record.reflection" class="record-section">
            <h3 class="section-title">个人感悟</h3>
            <div class="section-content reflection-content">{{ record.reflection }}</div>
          </div>
        </div>

        <!-- 页脚 -->
        <div class="record-footer">
          <div class="footer-text">生成时间：{{ currentTime }}</div>
        </div>
      </div>
    </div>

    <!-- 图片预览对话框 -->
    <el-dialog v-model="imagePreviewVisible" width="80%" :show-close="true">
      <div class="image-preview-wrapper">
        <img :src="previewImageUrl" class="preview-image" />
      </div>
    </el-dialog>

    <!-- 文件预览对话框 -->
    <el-dialog v-model="filePreviewVisible" width="90%" fullscreen>
      <template #header>
        <div class="file-preview-header">
          <span>{{ previewFileName }}</span>
          <button class="close-preview-btn" @click="filePreviewVisible = false">✕</button>
        </div>
      </template>
      <div class="file-preview-container">
        <iframe v-if="previewFileUrl" :src="previewFileUrl" class="file-iframe"></iframe>
        <div v-else class="preview-error">
          <p>暂不支持预览此文件类型</p>
          <p>支持的格式：PDF、Word (需要浏览器支持)</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const record = ref({})
const imagePreviewVisible = ref(false)
const previewImageUrl = ref('')
const filePreviewVisible = ref(false)
const previewFileUrl = ref('')
const previewFileName = ref('')
const printArea = ref(null)

// 格式化日期
const formattedDate = computed(() => {
  if (!record.value.date) return ''
  const date = new Date(record.value.date)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  const weekday = weekdays[date.getDay()]
  return `${year}年${month}月${day}日 星期${weekday}`
})

// 当前时间
const currentTime = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
})

// 返回
const goBack = () => {
  router.back()
}

// 打印
const handlePrint = () => {
  window.print()
}

// 预览图片
const previewImage = (imageUrl) => {
  previewImageUrl.value = imageUrl
  imagePreviewVisible.value = true
}

// 获取文件图标
const getFileIcon = (fileName) => {
  const ext = fileName.split('.').pop().toLowerCase()
  const iconMap = {
    'pdf': '📄',
    'doc': '📝',
    'docx': '📝',
    'xls': '📊',
    'xlsx': '📊',
    'ppt': '📽️',
    'pptx': '📽️',
    'txt': '📃',
    'zip': '📦',
    'rar': '📦'
  }
  return iconMap[ext] || '📎'
}

// 判断是否可以预览文件
const canPreviewFile = (fileName) => {
  const ext = fileName.split('.').pop().toLowerCase()
  return ['pdf', 'doc', 'docx'].includes(ext)
}

// 预览文件
const previewFile = async (file) => {
  const ext = file.name.split('.').pop().toLowerCase()
  
  if (!canPreviewFile(file.name)) {
    ElMessage.warning('该文件类型不支持在线预览')
    return
  }
  
  previewFileName.value = file.name
  
  if (ext === 'pdf') {
    // PDF 文件直接预览
    previewFileUrl.value = file.url || URL.createObjectURL(file.raw)
    filePreviewVisible.value = true
  } else if (ext === 'doc' || ext === 'docx') {
    // Word 文件使用 Microsoft Office Online Viewer
    const fileUrl = file.url || URL.createObjectURL(file.raw)
    // 注意：这需要文件是公开可访问的URL，本地base64可能无法预览
    previewFileUrl.value = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`
    filePreviewVisible.value = true
    
    // 提示用户
    ElMessage.info('Word文件预览需要网络连接，如无法加载请下载查看')
  }
}

// 加载记录数据
onMounted(() => {
  const dateStr = route.params.date
  if (!dateStr) {
    ElMessage.error('未找到记录')
    router.back()
    return
  }

  // 从 localStorage 加载记录
  const savedRecords = localStorage.getItem('growthRecords')
  if (savedRecords) {
    const records = JSON.parse(savedRecords)
    const foundRecord = records.find(r => r.date === dateStr)
    if (foundRecord) {
      record.value = foundRecord
    } else {
      ElMessage.error('未找到该日期的记录')
      router.back()
    }
  } else {
    ElMessage.error('没有记录数据')
    router.back()
  }
})
</script>

<style scoped>
.preview-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eaf6 100%);
}

.preview-container {
  max-width: 900px;
  margin: 50px auto 0;
  padding: 40px 20px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.preview-title {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.back-btn,
.print-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn {
  background: #7d5196;
  color: white;
}

.back-btn:hover {
  background: #9575b5;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(125, 81, 150, 0.3);
}

.print-btn {
  background: white;
  color: #7d5196;
  border: 2px solid #7d5196;
}

.print-btn:hover {
  background: #7d5196;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(125, 81, 150, 0.3);
}

/* PDF风格的内容区域 */
.preview-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 60px 80px;
  min-height: 800px;
}

.record-header {
  text-align: center;
  border-bottom: 3px solid #7d5196;
  padding-bottom: 20px;
  margin-bottom: 40px;
}

.record-title {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 10px 0;
  letter-spacing: 2px;
}

.record-date {
  font-size: 18px;
  color: #666;
  font-weight: 500;
}

.record-body {
  margin-bottom: 60px;
}

.record-section {
  margin-bottom: 30px;
  page-break-inside: avoid;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #7d5196;
  margin: 0 0 15px 0;
  padding-left: 15px;
  border-left: 4px solid #7d5196;
}

.section-content {
  font-size: 16px;
  line-height: 1.8;
  color: #333;
  padding-left: 15px;
}

.reflection-content {
  white-space: pre-wrap;
  word-wrap: break-word;
}

.importance-stars {
  font-size: 24px;
}

.star {
  color: #ddd;
  margin-right: 5px;
}

.star.filled {
  color: #ffd700;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.image-item {
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.image-item:hover {
  border-color: #7d5196;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(125, 81, 150, 0.2);
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.files-list {
  margin-top: 15px;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.file-item:hover {
  background: #e8eaf6;
  transform: translateX(5px);
}

.file-icon {
  font-size: 24px;
  margin-right: 12px;
}

.file-name {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.file-preview-btn {
  padding: 5px 15px;
  background: #7d5196;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.file-preview-btn:hover {
  background: #9575b5;
}

.record-footer {
  text-align: center;
  padding-top: 30px;
  border-top: 2px solid #e0e0e0;
}

.footer-text {
  font-size: 14px;
  color: #999;
}

.file-preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
}

.close-preview-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: #f56c6c;
  color: white;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-preview-btn:hover {
  background: #f78989;
  transform: scale(1.1);
}

.file-preview-container {
  width: 100%;
  height: calc(100vh - 120px);
}

.file-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.preview-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 16px;
}

.preview-error p {
  margin: 10px 0;
}

/* 打印样式 */
@media print {
  .preview-header {
    display: none;
  }

  .preview-container {
    padding: 0;
  }

  .preview-content {
    box-shadow: none;
    padding: 40px;
  }
}

/* 图片预览样式 */
.image-preview-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  max-height: 80vh;
  overflow: auto;
}

.preview-image {
  max-width: 100%;
  max-height: 80vh;
  width: auto;
  height: auto;
  object-fit: contain;
  display: block;
  margin: 0 auto;
}

/* 对话框样式覆盖 */
:deep(.el-dialog) {
  display: flex;
  flex-direction: column;
}

:deep(.el-dialog__body) {
  flex: 1;
  overflow: auto;
}
</style>

