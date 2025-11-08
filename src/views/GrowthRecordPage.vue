<template>
  <div class="growth-record-page">
    <!-- 导航栏 -->
    <NavBar :transparent="false" />

    <!-- 侧边栏 -->
    <SidebarMenu />

    <!-- 主内容区 -->
    <div class="main-content">
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">成长记录日历</h1>
          <p class="page-subtitle">点击日期添加或查看成长记录</p>
          <button class="add-today-btn" @click="addTodayRecord">添加今日记录</button>
        </div>
        <div class="header-right">
          <SearchBar placeholder="搜索记录..." @search="handleSearch" />
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-container">
        <div class="stat-card">
          <div class="stat-icon">
            <img src="../assets/chengzhang_icon/write.png" alt="照片" class="icon-img" />
          </div>
          <div class="stat-content">
            <div class="stat-label">总记录数</div>
            <div class="stat-value">{{ totalRecords }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <img src="../assets/chengzhang_icon/photo.png" alt="照片" class="icon-img" />
          </div>
          <div class="stat-content">
            <div class="stat-label">照片记录</div>
            <div class="stat-value">{{ photoRecords }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <img src="../assets/chengzhang_icon/file.png" alt="照片" class="icon-img" />
          </div>
          <div class="stat-content">
            <div class="stat-label">文件记录</div>
            <div class="stat-value">{{ fileRecords }}</div>
          </div>
        </div>
      </div>

      <!-- 日历 -->
      <div class="calendar-section">
        <CalendarComponent 
          :records="filteredRecords" 
          :selectedDate="selectedDate"
          @selectDate="handleSelectDate"
          @previewRecord="handlePreviewRecord"
          @deleteRecord="handleDeleteRecord"
        />
      </div>
    </div>

    <!-- 添加/编辑记录弹窗 -->
    <el-dialog 
      v-model="dialogVisible" 
      width="500px"
      :close-on-click-modal="false"
      :show-close="false"
      class="custom-dialog"
    >
      <!-- 自定义标题 -->
      <template #header>
        <div class="dialog-header-custom">
          <span class="dialog-title-text">{{ dialogTitle }}</span>
          <span class="dialog-date-text">{{ formattedSelectedDate }}</span>
        </div>
      </template>
      
      <!-- 自定义关闭按钮 -->
      <div class="custom-close-btn" @click="dialogVisible = false">
        <span class="close-icon">✕</span>
      </div>
      
      <el-form :model="recordForm" label-width="100px">
        <el-form-item label="事件描述">
          <el-input
            v-model="recordForm.description"
            type="text"
            maxlength="30"
            show-word-limit
            placeholder="请输入事件描述（最多30字）"
          />
        </el-form-item>

        <el-form-item label="上传图片">
          <el-upload
            class="upload-demo"
            action="#"
            :auto-upload="false"
            :on-change="handleImageChange"
            :file-list="recordForm.images"
            list-type="picture-card"
            accept="image/*"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item label="上传文件">
          <el-upload
            class="upload-demo"
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :file-list="recordForm.files"
          >
            <el-button type="primary">
              <el-icon><Upload /></el-icon>
              选择文件
            </el-button>
          </el-upload>
        </el-form-item>

        <el-form-item label="个人感悟">
          <el-input
            v-model="recordForm.reflection"
            type="textarea"
            :rows="4"
            placeholder="请输入个人感悟"
          />
        </el-form-item>

        <el-form-item label="重要程度">
          <el-rate 
            v-model="recordForm.importance" 
            :max="5"
            allow-half
            show-score
            text-color="#ff9900"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveRecord">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import SidebarMenu from '../components/SidebarMenu.vue'
import CalendarComponent from '../components/CalendarComponent.vue'
import SearchBar from '../components/SearchBar.vue'
import { ElMessage } from 'element-plus'
import {
  uploadImage,
  uploadFile,
  addGrowthRecord,
  updateGrowthRecord,
  deleteGrowthRecord,
  getGrowthRecordList,
  getStatistics,
  searchGrowthRecords
} from '../api/growthRecord'

const router = useRouter()
const route = useRoute()

// 记录数据
const records = ref([])
const searchKeyword = ref('')
const selectedDate = ref('')
const dialogVisible = ref(false)
const dialogTitle = ref('添加成长记录')
const statistics = ref({
  recordCount: 0,
  imageCount: 0,
  fileCount: 0
})

// 表单数据
const recordForm = ref({
  id: null,
  date: '',
  description: '',
  images: [],
  files: [],
  reflection: '',
  importance: 0
})

// 搜索功能
const handleSearch = async (keyword) => {
  searchKeyword.value = keyword
  
  if (!keyword) {
    // 如果搜索关键词为空，重新加载所有记录
    await loadRecords()
  } else {
    // 使用后端搜索API
    try {
      const data = await searchGrowthRecords(keyword)
      if (data) {
        records.value = data
      }
    } catch (error) {
      console.error('搜索失败:', error)
    }
  }
}

// 过滤后的记录（现在直接返回records，因为搜索已经由后端处理）
const filteredRecords = computed(() => {
  return records.value.map(record => ({
    ...record,
    date: record.recordTime ? record.recordTime.split('T')[0] : '',
    description: record.eventDesc || '',
    hasRecord: true
  }))
})

// 统计数据（使用后端返回的数据）
const totalRecords = computed(() => {
  return statistics.value.recordCount || 0
})

const photoRecords = computed(() => {
  return statistics.value.imageCount || 0
})

const fileRecords = computed(() => {
  return statistics.value.fileCount || 0
})

// 格式化选中的日期
const formattedSelectedDate = computed(() => {
  if (!selectedDate.value) return ''
  
  const date = new Date(selectedDate.value)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  return `${year}年${month}月${String(day).padStart(2, '0')}日`
})

// 选择日期
const handleSelectDate = (dateStr, openDialog = true) => {
  console.log('点击了日期:', dateStr)
  selectedDate.value = dateStr
  
  // 如果不需要打开弹窗，直接返回
  if (!openDialog) {
    return
  }
  
  // 检查是否已有记录（使用recordTime字段）
  const existingRecord = records.value.find(r => {
    const recordDate = r.recordTime ? r.recordTime.split('T')[0] : r.recordTime
    return recordDate === dateStr
  })
  
  if (existingRecord) {
    // 编辑已有记录
    dialogTitle.value = '编辑成长记录'
    
    // 转换后端图片数据为 el-upload 需要的格式
    const convertedImages = []
    if (existingRecord.images && existingRecord.images.length > 0) {
      existingRecord.images.forEach((img, index) => {
        convertedImages.push({
          id: img.id,
          name: img.imageName || `image-${index}.jpg`,
          url: img.imageUrl,
          uid: img.id || Date.now() + index
        })
      })
    }
    
    // 转换后端文件数据为 el-upload 需要的格式
    const convertedFiles = []
    if (existingRecord.files && existingRecord.files.length > 0) {
      existingRecord.files.forEach((file, index) => {
        convertedFiles.push({
          id: file.id,
          name: file.fileName,
          url: file.fileUrl,
          uid: file.id || Date.now() + index
        })
      })
    }
    
    recordForm.value = {
      id: existingRecord.id,
      date: dateStr,
      description: existingRecord.eventDesc || '',
      images: convertedImages,
      files: convertedFiles,
      reflection: existingRecord.reflection || '',
      importance: existingRecord.importance || 0
    }
  } else {
    // 创建新记录
    dialogTitle.value = '添加成长记录'
    recordForm.value = {
      id: null,
      date: dateStr,
      description: '',
      images: [],
      files: [],
      reflection: '',
      importance: 0
    }
  }
  
  console.log('准备显示弹窗, dialogVisible.value =', dialogVisible.value)
  dialogVisible.value = true
  console.log('弹窗状态已设置为 true, dialogVisible.value =', dialogVisible.value)
}

// 添加今日记录
const addTodayRecord = () => {
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  handleSelectDate(todayStr)
}

// 预览记录
const handlePreviewRecord = (dateStr) => {
  console.log('处理预览请求，日期:', dateStr)
  // 使用 recordTime 字段来匹配日期
  const record = records.value.find(r => {
    const recordDate = r.recordTime ? r.recordTime.split('T')[0] : ''
    return recordDate === dateStr
  })
  if (record) {
    console.log('找到记录，跳转到预览页面')
    router.push({
      name: 'RecordPreview',
      params: { date: dateStr }
    })
  } else {
    console.error('未找到该日期的记录:', dateStr, '当前记录数:', records.value.length)
    ElMessage.warning('未找到该日期的记录')
  }
}

// 删除记录
const handleDeleteRecord = (dateStr) => {
  ElMessage({
    type: 'warning',
    message: '确定要删除这条记录吗？',
    showClose: true,
    duration: 0,
    customClass: 'delete-confirm-message',
    dangerouslyUseHTMLString: true,
    message: `
      <div style="margin-bottom: 12px;">确定要删除这条记录吗？</div>
      <div style="display: flex; gap: 8px; justify-content: flex-end;">
        <button id="cancel-delete" style="padding: 5px 15px; border: 1px solid #dcdfe6; border-radius: 4px; background: white; cursor: pointer;">取消</button>
        <button id="confirm-delete" style="padding: 5px 15px; border: none; border-radius: 4px; background: #f56c6c; color: white; cursor: pointer;">确定</button>
      </div>
    `,
    onClose: () => {
      // 移除事件监听器
      document.removeEventListener('click', handleDeleteClick)
    }
  })
  
  const handleDeleteClick = async (e) => {
    if (e.target.id === 'confirm-delete') {
      // 确认删除
      const record = records.value.find(r => {
        const recordDate = r.recordTime ? r.recordTime.split('T')[0] : r.recordTime
        return recordDate === dateStr
      })
      
      if (record && record.id) {
        try {
          await deleteGrowthRecord(record.id)
          ElMessage.success('删除成功')
          
          // 重新加载数据
          await loadRecords()
          await loadStatistics()
          
          // 关闭消息框
          const messageBoxes = document.querySelectorAll('.el-message')
          messageBoxes.forEach(box => {
            if (box.querySelector('#confirm-delete')) {
              box.remove()
            }
          })
        } catch (error) {
          console.error('删除失败:', error)
          ElMessage.error('删除失败，请重试')
        }
      }
      document.removeEventListener('click', handleDeleteClick)
    } else if (e.target.id === 'cancel-delete') {
      // 取消删除，关闭消息框
      const messageBoxes = document.querySelectorAll('.el-message')
      messageBoxes.forEach(box => {
        if (box.querySelector('#cancel-delete')) {
          box.remove()
        }
      })
      document.removeEventListener('click', handleDeleteClick)
    }
  }
  
  // 添加事件监听器
  setTimeout(() => {
    document.addEventListener('click', handleDeleteClick)
  }, 100)
}

// 处理图片上传
const handleImageChange = (file, fileList) => {
  recordForm.value.images = fileList
}

// 处理文件上传
const handleFileChange = (file, fileList) => {
  recordForm.value.files = fileList
}

// 将文件转换为base64
const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file.raw)
  })
}

// 保存记录
const saveRecord = async () => {
  if (!recordForm.value.description && !recordForm.value.reflection) {
    ElMessage.warning('请至少填写事件描述或个人感悟')
    return
  }
  
  try {
    // 1. 上传新图片，获取图片ID
    const imageIds = []
    for (const image of recordForm.value.images) {
      if (image.raw) {
        // 新上传的图片
        const uploadedImage = await uploadImage(image.raw, 2, recordForm.value.date)
        imageIds.push(uploadedImage.id)
      } else if (image.id) {
        // 已存在的图片
        imageIds.push(image.id)
      }
    }
    
    // 2. 上传新文件，获取文件ID
    const fileIds = []
    for (const file of recordForm.value.files) {
      if (file.raw) {
        // 新上传的文件
        const uploadedFile = await uploadFile(file.raw)
        fileIds.push(uploadedFile.id)
      } else if (file.id) {
        // 已存在的文件
        fileIds.push(file.id)
      }
    }
    
    // 3. 构造记录时间（添加时分秒）
    const recordTime = `${recordForm.value.date}T12:00:00`
    
    // 4. 创建或更新记录
    const recordData = {
      eventDesc: recordForm.value.description,
      reflection: recordForm.value.reflection,
      importance: recordForm.value.importance,
      recordTime: recordTime,
      imageIds: imageIds,
      fileIds: fileIds
    }
    
    if (recordForm.value.id) {
      // 更新记录
      recordData.id = recordForm.value.id
      await updateGrowthRecord(recordData)
      ElMessage.success('记录更新成功')
    } else {
      // 添加新记录
      await addGrowthRecord(recordData)
      ElMessage.success('记录添加成功')
    }
    
    // 5. 关闭对话框并重新加载数据
    dialogVisible.value = false
    await loadRecords()
    await loadStatistics()
  } catch (error) {
    console.error('保存记录失败:', error)
    ElMessage.error('保存记录失败，请重试')
  }
}

// 加载记录
const loadRecords = async () => {
  try {
    const data = await getGrowthRecordList({
      current: 1,
      pageSize: 1000, // 获取所有记录
      sortField: 'recordTime',
      sortOrder: 'descend'
    })
    
    if (data && data.records) {
      records.value = data.records
    } else {
      records.value = []
    }
  } catch (error) {
    console.error('加载记录失败:', error)
    records.value = []
  }
}

// 加载统计信息
const loadStatistics = async () => {
  try {
    const data = await getStatistics()
    if (data) {
      statistics.value = data
    }
  } catch (error) {
    console.error('加载统计信息失败:', error)
  }
}

onMounted(async () => {
  await loadRecords()
  await loadStatistics()
  
  // 检查是否有从里程碑页面跳转过来的日期参数
  if (route.query.date) {
    // 从里程碑页面跳转过来时，只选中日期，不打开弹窗
    handleSelectDate(route.query.date, false)
  }
})

// 监听路由变化，处理日期定位
watch(() => route.query.date, (newDate) => {
  if (newDate) {
    // 从里程碑页面跳转过来时，只选中日期，不打开弹窗
    handleSelectDate(newDate, false)
    // 清除查询参数（可选）
    // router.replace({ query: {} })
  }
})
</script>

<style scoped>
.growth-record-page {
  min-height: 100vh;
  background-color: #ffffff;
  padding-top: 80px;
  position: relative;
}

.growth-record-page::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(149, 117, 181, 0.05);
  pointer-events: none;
}

.main-content {
  padding: 40px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 40px;
  gap: 24px;
}

.header-left {
  flex: 1;
}

.header-right {
  display: flex;
  align-items: center;
  padding-top: 8px;
}

.page-title {
  font-size: 36px;
  font-weight: 800;
  color: #0b2a4a;
  margin-bottom: 12px;
}

.page-subtitle {
  font-size: 16px;
  color: #7f8c8d;
  margin-bottom: 16px;
}

.add-today-btn {
  background: #7d5196;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 7px 7px white, 12px 12px 3px #cfc2d8;
}

.add-today-btn:hover {
  background: #9575b5;
  transform: translateY(-2px);
  box-shadow: 5px 5px white, 10px 10px 3px #cfc2d8;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(184, 160, 200, 0.3);
}

.stat-icon {
  font-size: 48px;
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(184, 160, 200, 0.1);
  border-radius: 12px;
}

.icon-img {
  width: 64px;
  height: 64px;
  object-fit: contain;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: rgb(48, 20, 97);
}

.calendar-section {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* Element Plus 覆盖样式 */
:deep(.el-overlay) {
  z-index: 2000 !important;
}

:deep(.el-dialog) {
  z-index: 2001 !important;
  position: relative;
  display: flex;
  flex-direction: column;
}

:deep(.el-dialog__header) {
  background: #b8a0c8;
  color: white;
  padding: 20px;
  margin-bottom: 20px;
  /* border-radius: 8px 8px 0 0; */
}

/* 自定义标题容器 */
.dialog-header-custom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.dialog-title-text {
  color: white;
  font-weight: 600;
  font-size: 18px;
}

.dialog-date-text {
  color: white;
  font-size: 14px;
  font-weight: 500;
  opacity: 0.9;
}

:deep(.el-dialog__title) {
  color: white;
  font-weight: 600;
  text-align: center;
}

:deep(.el-dialog__close) {
  display: none !important;
}

/* 自定义关闭按钮 */
.custom-close-btn {
  position: absolute;
  top: -16px;
  right: -16px;
  width: 36px;
  height: 36px;
  background: white;
  border: 2px solid #b8a0c8;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2002;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.custom-close-btn:hover {
  background: #b8a0c8;
  transform: rotate(90deg);
}

.close-icon {
  font-size: 20px;
  font-weight: 700;
  color: #b8a0c8;
  transition: color 0.3s ease;
  line-height: 1;
}

.custom-close-btn:hover .close-icon {
  color: white;
}

:deep(.el-upload--picture-card) {
  width: 100px;
  height: 100px;
}

:deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: 100px;
  height: 100px;
}

:deep(.el-form-item__label) {
  flex-direction: row-reverse;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .main-content {
    padding: 20px;
  }
  
  .stats-container {
    grid-template-columns: 1fr;
  }
  
  .page-title {
    font-size: 28px;
  }
}
</style>

