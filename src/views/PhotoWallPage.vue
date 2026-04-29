<template>
  <div class="photo-wall-page">
    <!-- 导航栏 -->
    <NavBar :transparent="false" />

    <!-- 侧边栏 -->
    <SidebarMenu />

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 页面标题 -->
      <div class="page-header">
        <div class="header-left">
          <div class="title-row">
            <h1 class="page-title">照片墙</h1>
            <SearchBar class="inline-search" placeholder="搜索照片..." @search="handleSearch" />
          </div>
          <p class="page-subtitle">记录大学生活的珍贵时刻</p>
          <button class="upload-photo-btn" @click="showUploadDialog">添加照片</button>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="stats-section">
        <div class="stat-card">
          <div class="stat-icon">
            <img src="../assets/chengzhang_icon/photo1.png" alt="照片" class="icon-img" />
          </div>
          <div class="stat-content">
            <div class="stat-label">总照片数</div>
            <div class="stat-value">{{ totalPhotos }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <img src="../assets/chengzhang_icon/clock.png" alt="照片" class="icon-img" />
          </div>
          <div class="stat-content">
            <div class="stat-label">最新上传</div>
            <div class="stat-value">{{ latestDate }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <img src="../assets/chengzhang_icon/calendar.png" alt="照片" class="icon-img" />
          </div>
          <div class="stat-content">
            <div class="stat-label">记录时长</div>
            <div class="stat-value">{{ recordDuration }}</div>
          </div>
        </div>
      </div>

      <!-- 按月份分组的照片 -->
      <div v-if="groupedPhotos.length > 0" class="timeline-section">
        <div 
          v-for="group in groupedPhotos" 
          :key="group.monthKey"
          class="month-group"
        >
          <!-- 月份标题 -->
          <div class="month-header">
            <div class="month-icon">
            <img src="../assets/chengzhang_icon/calendar.png" alt="照片" class="month-icon-img" />
          </div>
            <div class="month-title">{{ group.monthText }} ({{ group.photos.length }}张照片)</div>
            <button class="batch-delete-btn" @click="startBatchDelete(group)" title="批量删除">
              批量删除
            </button>
          </div>

          <!-- 批量删除操作栏 -->
          <div v-if="batchDeleteMode && currentGroup.monthKey === group.monthKey" class="batch-delete-actions">
            <button class="batch-action-btn cancel" @click="cancelBatchDelete">取消</button>
            <span class="selected-count">已选择 {{ selectedPhotos.length }} 张照片</span>
            <button class="batch-action-btn confirm" @click="confirmBatchDelete">确认删除</button>
          </div>

          <!-- 该月的照片网格 -->
          <div class="photos-grid">
            <div 
              v-for="photo in group.photos" 
              :key="photo.id"
              :class="['photo-card', { 
                'batch-mode': batchDeleteMode && currentGroup.monthKey === group.monthKey,
                'selected': selectedPhotos.some(p => p.id === photo.id)
              }]"
              @click="(batchDeleteMode && currentGroup.monthKey === group.monthKey) ? togglePhotoSelection(photo) : viewPhoto(photo)"
            >
              <!-- 选择框 -->
              <div v-if="batchDeleteMode && currentGroup.monthKey === group.monthKey" class="photo-checkbox">
                <input 
                  type="checkbox" 
                  :checked="selectedPhotos.some(p => p.id === photo.id)"
                  @click.stop="togglePhotoSelection(photo)"
                />
              </div>
              
              <div class="photo-image">
                <img :src="photo.url" :alt="photo.title" />
              </div>
              <div class="photo-info">
                <div class="photo-title-row">
                  <div class="photo-title">{{ photo.title }}</div>
                  <button 
                    v-if="!batchDeleteMode" 
                    class="photo-delete-btn" 
                    @click.stop="deletePhoto(photo)" 
                    title="删除照片"
                  >
                    <img :src="trashIcon" alt="删除" class="delete-icon" />
                  </button>
                </div>
                <div class="photo-meta">
                  <span class="photo-date">{{ formatDateTime(photo.date) }}</span>
                  <span class="photo-days">{{ calculateDays(photo.date) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <div class="empty-icon">📷</div>
        <div class="empty-text">还没有上传照片，快去成长记录中添加吧！</div>
      </div>
    </div>

    <!-- 上传照片弹窗 -->
    <el-dialog 
      v-model="uploadDialogVisible" 
      title="上传照片"
      width="500px"
      :close-on-click-modal="false"
      :show-close="false"
      class="custom-dialog"
    >
      <!-- 自定义关闭按钮 -->
      <div class="custom-close-btn" @click="uploadDialogVisible = false">
        <span class="close-icon">✕</span>
      </div>
      
      <el-form :model="uploadForm" label-width="120px">
        <el-form-item label="照片标题">
          <el-input
            v-model="uploadForm.title"
            type="text"
            maxlength="30"
            show-word-limit
            placeholder="请输入照片标题（最多30字）"
          />
        </el-form-item>

        <el-form-item label="上传图片">
          <el-upload
            class="upload-demo"
            action="#"
            :auto-upload="false"
            :on-change="handleImageChange"
            :file-list="uploadForm.images"
            list-type="picture-card"
            accept="image/*"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item label="照片描述">
          <el-input
            v-model="uploadForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入照片描述"
          />
        </el-form-item>

        <el-form-item label="个人感悟">
          <el-input
            v-model="uploadForm.reflection"
            type="textarea"
            :rows="4"
            placeholder="请输入个人感悟"
          />
        </el-form-item>

        <el-form-item label="同步到成长记录">
          <el-switch
            v-model="uploadForm.syncToGrowthRecord"
            active-text="是"
            inactive-text="否"
          />
          <div class="sync-hint">开启后，照片将同时出现在成长记录中</div>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="uploadDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="savePhotos">上传</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 查看照片弹窗 -->
    <el-dialog 
      v-model="viewDialogVisible" 
      :title="currentPhoto?.title"
      width="900px"
      class="photo-view-dialog"
    >
      <div class="photo-detail" v-if="currentPhoto">
        <img :src="currentPhoto.url" :alt="currentPhoto.title" class="detail-img" />
        <div class="photo-info-detail">
          <div class="info-item">
            <span class="info-label">拍摄时间：</span>
            <span class="info-value">{{ formatFullDate(currentPhoto.date) }}</span>
          </div>
          <div class="info-item" v-if="currentPhoto.description">
            <span class="info-label">描述：</span>
            <span class="info-value">{{ currentPhoto.description }}</span>
          </div>
          <div class="info-item" v-if="currentPhoto.reflection">
            <span class="info-label">感悟：</span>
            <span class="info-value">{{ currentPhoto.reflection }}</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import NavBar from '../components/NavBar.vue'
import SidebarMenu from '../components/SidebarMenu.vue'
import SearchBar from '../components/SearchBar.vue'
import { ElDialog, ElMessage } from 'element-plus'
import {
  uploadImage,
  addGrowthRecord,
  getGrowthRecordList,
  getPhotoWallStatistics,
  searchGrowthRecords,
  deleteImage,
  getPhotoWallList,
  batchDeleteImages
} from '../api/growthRecord'
import trashIcon from '../assets/chengzhang_icon/trash.png'
import { confirmAction } from '../utils/confirm'

const viewDialogVisible = ref(false)
const uploadDialogVisible = ref(false)
const currentPhoto = ref(null)
const allPhotos = ref([])
const searchKeyword = ref('')
const batchDeleteMode = ref(false) // 批量删除模式
const selectedPhotos = ref([]) // 选中的照片
const currentGroup = ref(null) // 当前操作的月份组
const photoStats = ref({
  imageCount: 0,
  latestRecordTime: '',
  totalDays: 0
})
const uploadForm = ref({
  title: '',
  description: '',
  reflection: '',
  images: [],
  syncToGrowthRecord: false
})

// 从后端加载照片（照片墙接口，包含 type=1 与 type=2）
const loadPhotosFromRecords = async () => {
  try {
    const list = await getPhotoWallList()
    const photos = (list || []).map(img => {
      const date = img.uploadTime ? img.uploadTime.split('T')[0] : ''
      return {
        id: img.id,
        imageId: img.id,
        title: img.imageName || '照片',
        url: img.imageUrl,
        date,
        description: '',
        reflection: '',
        importance: 0,
        source: 'photoWall',
        recordId: null,
        imageType: img.type
            }
          })
    // 按日期降序
    photos.sort((a, b) => {
      const dateA = a.date ? new Date(a.date) : new Date(0)
      const dateB = b.date ? new Date(b.date) : new Date(0)
      return dateB - dateA
    })
    allPhotos.value = photos
    console.log('加载照片完成，共', photos.length, '张')
  } catch (error) {
    console.error('加载照片失败:', error)
    allPhotos.value = []
  }
}

// 搜索功能
const handleSearch = async (keyword) => {
  searchKeyword.value = keyword
  
  if (!keyword) {
    // 如果搜索关键词为空，重新加载所有照片
    await loadPhotosFromRecords()
  } else {
    // 使用后端搜索API
    try {
      const data = await searchGrowthRecords(keyword)
      if (data) {
        const photos = []
        data.forEach(record => {
          if (record.images && record.images.length > 0) {
            record.images.forEach((image, index) => {
              // 搜索时也加载所有类型的图片
              if (image.imageUrl) {
                const photoDate = image.uploadTime 
                  ? image.uploadTime.split('T')[0] 
                  : (record.recordTime ? record.recordTime.split('T')[0] : '')
                
                photos.push({
                  id: `growth-${record.id}-${image.id}`,
                  imageId: image.id,
                  title: record.eventDesc || image.imageName || '照片',
                  url: image.imageUrl,
                  date: photoDate,
                  description: record.eventDesc || '',
                  reflection: record.reflection || '',
                  importance: record.importance || 0,
                  source: 'growth',
                  recordId: record.id,
                  imageType: image.type
                })
              }
            })
          }
        })
        photos.sort((a, b) => {
          const dateA = a.date ? new Date(a.date) : new Date(0)
          const dateB = b.date ? new Date(b.date) : new Date(0)
          return dateB - dateA
        })
        allPhotos.value = photos
      }
    } catch (error) {
      console.error('搜索失败:', error)
    }
  }
}

// 过滤后的照片（现在直接返回allPhotos，因为搜索已经由后端处理）
const filteredPhotos = computed(() => {
  return allPhotos.value
})

// 按月份分组
const groupedPhotos = computed(() => {
  const groups = {}
  
  filteredPhotos.value.forEach(photo => {
    const date = new Date(photo.date)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const monthKey = `${year}-${String(month).padStart(2, '0')}`
    
    if (!groups[monthKey]) {
      groups[monthKey] = {
        monthKey,
        monthText: `${year}-${String(month).padStart(2, '0')}`,
        photos: []
      }
    }
    
    groups[monthKey].photos.push(photo)
  })
  
  // 转换为数组并按月份降序排序
  return Object.values(groups).sort((a, b) => b.monthKey.localeCompare(a.monthKey))
})

// 总照片数（使用后端统计数据）
const totalPhotos = computed(() => photoStats.value.imageCount || 0)

// 最新日期（使用后端统计数据）
const latestDate = computed(() => {
  if (photoStats.value.latestRecordTime) {
    return photoStats.value.latestRecordTime.split('T')[0]
  }
  return '暂无记录'
})

// 记录时长（天数，使用后端统计数据）
const recordDuration = computed(() => {
  const days = photoStats.value.totalDays || 0
  if (days === 0) return '0天'
  if (days === 1) return '当天'
  return `${days}天`
})

// 显示上传对话框
const showUploadDialog = () => {
  uploadForm.value = {
    title: '',
    description: '',
    reflection: '',
    images: [],
    syncToGrowthRecord: false
  }
  uploadDialogVisible.value = true
}

// 处理图片上传
const handleImageChange = (file, fileList) => {
  uploadForm.value.images = fileList
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

// 保存照片
const savePhotos = async () => {
  if (uploadForm.value.images.length === 0) {
    ElMessage.warning('请至少上传一张照片')
    return
  }
  
  if (!uploadForm.value.title) {
    ElMessage.warning('请输入照片标题')
    return
  }
  
  try {
    // 1. 上传所有图片，获取图片ID
    const imageIds = []
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    const uploadTime = `${todayStr} ${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}:${String(today.getSeconds()).padStart(2, '0')}`
    
    for (const image of uploadForm.value.images) {
      if (image.raw) {
        // 根据是否同步到成长记录决定type
        const imageType = uploadForm.value.syncToGrowthRecord ? 2 : 1
        const uploadedImage = await uploadImage(image.raw, imageType, uploadTime)
        imageIds.push(uploadedImage.id)
      }
    }
    
    if (uploadForm.value.syncToGrowthRecord) {
      // 同步到成长记录：创建成长记录
      const recordTime = `${todayStr}T12:00:00`
      await addGrowthRecord({
        eventDesc: uploadForm.value.title,
        reflection: uploadForm.value.reflection || uploadForm.value.description || '',
        importance: 0,
        recordTime: recordTime,
        imageIds: imageIds,
        fileIds: []
      })
      
      ElMessage.success('照片上传成功，已同步到成长记录')
    } else {
      // 只保存到照片墙：type=1 的图片已上传到照片墙接口，无需创建成长记录
      ElMessage.success('照片上传成功，已保存到照片墙')
    }
    
    uploadDialogVisible.value = false
    
    // 重新加载照片和统计信息
    await loadPhotosFromRecords()
    await loadPhotoWallStatistics()
  } catch (error) {
    console.error('上传照片失败:', error)
    ElMessage.error('上传照片失败，请重试')
  }
}

// 查看照片
const viewPhoto = (photo) => {
  currentPhoto.value = photo
  viewDialogVisible.value = true
}

// 删除照片
const deletePhoto = async (photo) => {
  const ok = await confirmAction('确定要删除这张照片吗？', {
    title: '删除确认',
    confirmButtonText: '删除'
  })
  if (!ok) return
  if (!photo.imageId) {
    ElMessage.error('无法删除：缺少图片ID')
    return
  }
  try {
    await deleteImage(photo.imageId)
    ElMessage.success('照片已删除')
    await loadPhotosFromRecords()
    await loadPhotoWallStatistics()
  } catch (error) {
    console.error('删除照片失败:', error)
    ElMessage.error('删除照片失败，请重试')
  }
}

// 开始批量删除
const startBatchDelete = (group) => {
  batchDeleteMode.value = true
  currentGroup.value = group
  selectedPhotos.value = []
  ElMessage.info(`请选择要删除的照片，选好后点击"确认删除"`)
}

// 取消批量删除
const cancelBatchDelete = () => {
  batchDeleteMode.value = false
  currentGroup.value = null
  selectedPhotos.value = []
}

// 切换照片选中状态
const togglePhotoSelection = (photo) => {
  const index = selectedPhotos.value.findIndex(p => p.id === photo.id)
  if (index > -1) {
    selectedPhotos.value.splice(index, 1)
  } else {
    selectedPhotos.value.push(photo)
  }
}

// 确认批量删除
const confirmBatchDelete = async () => {
  if (selectedPhotos.value.length === 0) {
    ElMessage.warning('请至少选择一张照片')
    return
  }
  const ok = await confirmAction(`确定要删除选中的 ${selectedPhotos.value.length} 张照片吗？`, {
    title: '批量删除确认',
    confirmButtonText: '删除'
  })
  if (!ok) return

  try {
    const ids = selectedPhotos.value
      .filter(photo => photo.imageId || photo.id)
      .map(photo => photo.imageId || photo.id)
    if (ids.length === 0) {
      ElMessage.error('未找到可删除的图片ID')
      return
    }
    await batchDeleteImages(ids)
    cancelBatchDelete()
    ElMessage.success(`已成功删除 ${ids.length} 张照片`)
    await loadPhotosFromRecords()
    await loadPhotoWallStatistics()
  } catch (error) {
    console.error('批量删除失败:', error)
    ElMessage.error('批量删除失败，请重试')
  }
}

// 格式化日期时间
const formatDateTime = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}.000Z`
}

// 格式化完整日期
const formatFullDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

// 计算距今天数
const calculateDays = (dateStr) => {
  const date = new Date(dateStr)
  const today = new Date()
  const diffTime = today - date
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '1天'
  return `${diffDays}天`
}

// 加载照片墙统计信息
const loadPhotoWallStatistics = async () => {
  try {
    const data = await getPhotoWallStatistics()
    if (data) {
      photoStats.value = data
    }
  } catch (error) {
    console.error('加载照片墙统计信息失败:', error)
  }
}

onMounted(async () => {
  await loadPhotosFromRecords()
  await loadPhotoWallStatistics()
})
</script>

<style scoped>
.photo-wall-page {
  min-height: 100vh;
  background-color: #ffffff;
  padding-top: 80px;
  position: relative;
}

.photo-wall-page::before {
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

.title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.title-row .page-title {
  margin: 0;
}

.title-row :deep(.search-bar-container) {
  margin: 0;
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

.upload-photo-btn {
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

.upload-photo-btn:hover {
  background: #9575b5;
  transform: translateY(-2px);
  box-shadow: 5px 5px white, 10px 10px 3px #cfc2d8;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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
  color: rgb(35,20,61);
}

.timeline-section {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.month-group {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.month-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.month-icon {
  margin-top: 7px;
}
.month-icon-img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}
.month-title {
  font-size: 24px;
  font-weight: 700;
  color: #0b2a4a;
  flex: 1;
}

.batch-delete-btn {
  padding: 8px 20px;
  background: rgba(245, 108, 108, 0.1);
  color: #f56c6c;
  border: 1px solid #f56c6c;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.batch-delete-btn:hover {
  background: #f56c6c;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3);
}

.batch-delete-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #b8a0c8;
}

.batch-action-btn {
  padding: 8px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.batch-action-btn.cancel {
  background: white;
  color: #666;
  border: 1px solid #dcdfe6;
}

.batch-action-btn.cancel:hover {
  background: #f5f5f5;
}

.batch-action-btn.confirm {
  background: #f56c6c;
  color: white;
}

.batch-action-btn.confirm:hover {
  background: #f78989;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3);
}

.selected-count {
  font-size: 14px;
  color: #666;
  font-weight: 600;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.photo-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.photo-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(184, 160, 200, 0.3);
}

.photo-card.batch-mode {
  border: 2px solid #e0e0e0;
}

.photo-card.batch-mode.selected {
  border-color: #7d5196;
  box-shadow: 0 4px 16px rgba(125, 81, 150, 0.3);
}

.photo-checkbox {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 10;
}

.photo-checkbox input[type="checkbox"] {
  width: 24px;
  height: 24px;
  cursor: pointer;
  accent-color: #7d5196;
}

.photo-image {
  width: 100%;
  height: 220px;
  overflow: hidden;
  background: #f5f5f5;
}

.photo-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.photo-card:hover .photo-image img {
  transform: scale(1.05);
}

.photo-info {
  padding: 16px;
}

.photo-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.photo-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 8px;
}

.photo-delete-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 4px;
  background: rgba(245, 108, 108, 0.1);
  color: #f56c6c;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.photo-delete-btn:hover {
  background: #f56c6c;
  color: white;
  transform: scale(1.1);
}

.delete-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
  filter: brightness(0) saturate(100%) invert(52%) sepia(68%) saturate(4789%) hue-rotate(335deg) brightness(98%) contrast(95%);
}

.photo-delete-btn:hover .delete-icon {
  filter: brightness(0) saturate(100%) invert(100%);
}

.photo-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #7f8c8d;
}

.photo-date {
  color: #b8a0c8;
  font-weight: 500;
}

.photo-days {
  background: rgba(184, 160, 200, 0.1);
  color: #b8a0c8;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 100px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 24px;
}

.empty-text {
  font-size: 18px;
  color: #7f8c8d;
}

.photo-detail {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detail-img {
  width: 100%;
  height: auto;
  border-radius: 8px;
  max-height: 600px;
  object-fit: contain;
  background: #f5f5f5;
}

.photo-info-detail {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  gap: 8px;
  line-height: 1.6;
}

.info-label {
  font-weight: 600;
  color: #2c3e50;
  min-width: 80px;
}

.info-value {
  color: #7f8c8d;
  flex: 1;
}

/* Element Plus 覆盖样式 */
:deep(.el-overlay) {
  z-index: 2000 !important;
}

:deep(.el-dialog) {
  z-index: 2001 !important;
  position: relative;
}

:deep(.el-dialog__header) {
  background: #b8a0c8;
  color: white;
  padding: 20px;
  margin-bottom: 20px;
}

:deep(.el-dialog__title) {
  color: white;
  font-weight: 600;
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

.sync-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
  line-height: 1.5;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .main-content {
    padding: 20px;
  }
  
  .stats-section {
    grid-template-columns: 1fr;
  }
  
  .photos-grid {
    grid-template-columns: 1fr;
  }
  
  .page-title {
    font-size: 28px;
  }
}
</style>
