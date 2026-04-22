<template>
  <div v-if="modelValue" class="personal-modal-overlay">
    <div class="personal-modal" role="dialog" aria-modal="true" aria-labelledby="personal-modal-title">
      <div class="personal-modal-header">
        <div id="personal-modal-title" class="personal-modal-title">个人主页</div>
        <button class="personal-modal-close" @click="closeDialog" aria-label="关闭">✕</button>
      </div>
      <div class="personal-modal-body">
        <el-form :model="profileForm" label-width="100px" ref="profileFormRef">
          <el-form-item label="头像">
            <el-upload
              class="avatar-uploader"
              :show-file-list="false"
              :before-upload="beforeAvatarUpload"
              :on-change="handleAvatarChange"
              :auto-upload="false"
            >
              <img v-if="profileForm.avatar" :src="profileForm.avatar" class="avatar-preview" />
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
          </el-form-item>
          <el-form-item label="昵称" prop="nickname">
            <el-input v-model="profileForm.nickname" placeholder="请输入昵称" maxlength="20" show-word-limit />
          </el-form-item>
          <el-form-item label="性别">
            <el-radio-group v-model="profileForm.gender">
              <el-radio label="男">男</el-radio>
              <el-radio label="女">女</el-radio>
              <el-radio label="保密">保密</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="年级">
            <el-select v-model="profileForm.grade" placeholder="请选择年级" style="width: 100%">
              <el-option label="大一" value="大一" />
              <el-option label="大二" value="大二" />
              <el-option label="大三" value="大三" />
              <el-option label="大四" value="大四" />
              <el-option label="研一" value="研一" />
              <el-option label="研二" value="研二" />
              <el-option label="研三" value="研三" />
              <el-option label="博士" value="博士" />
              <el-option label="已毕业" value="已毕业" />
            </el-select>
          </el-form-item>
          <el-form-item label="专业">
            <el-input v-model="profileForm.major" placeholder="请输入专业" />
          </el-form-item>
          <el-form-item label="学校">
            <el-input v-model="profileForm.school" placeholder="请输入学校" />
          </el-form-item>
          <el-form-item label="个人简介">
            <el-input
              v-model="profileForm.bio"
              type="textarea"
              :rows="4"
              placeholder="请输入个人简介"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
        </el-form>
      </div>
      <div class="personal-modal-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="saveProfile">保存</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { uploadUserAvatar, updateMyProfile } from '../api/user'
import { normalizeProfile } from '../utils/profile'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'profile-saved'])

const profileFormRef = ref(null)
const profileForm = ref({
  avatar: '',
  nickname: '',
  gender: '保密',
  grade: '',
  major: '',
  school: '',
  bio: ''
})
const selectedAvatarFile = ref(null)

const closeDialog = () => {
  emit('update:modelValue', false)
}

const loadProfileFromStorage = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  const storedProfile = JSON.parse(localStorage.getItem('userProfile') || '{}')
  const normalizedProfile = normalizeProfile(storedProfile, userInfo)

  profileForm.value = {
    avatar: normalizedProfile.avatar,
    nickname: normalizedProfile.nickname,
    gender: normalizedProfile.gender,
    grade: normalizedProfile.grade,
    major: normalizedProfile.major,
    school: normalizedProfile.school,
    bio: normalizedProfile.bio
  }
  selectedAvatarFile.value = null
}

watch(
  () => props.modelValue,
  (visible) => {
    if (visible) {
      loadProfileFromStorage()
    }
  }
)

const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

const handleAvatarChange = (file) => {
  selectedAvatarFile.value = file.raw
  const reader = new FileReader()
  reader.onload = (e) => {
    profileForm.value.avatar = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

const saveProfile = async () => {
  try {
    let avatarUrl = profileForm.value.avatar
    if (selectedAvatarFile.value) {
      const url = await uploadUserAvatar(selectedAvatarFile.value)
      if (url) {
        avatarUrl = url
        profileForm.value.avatar = url
      }
    }

    await updateMyProfile({
      userName: profileForm.value.nickname || '',
      userAvatar: avatarUrl || '',
      userProfile: profileForm.value.bio || '',
      gender: profileForm.value.gender || '保密',
      grade: profileForm.value.grade || '',
      major: profileForm.value.major || '',
      school: profileForm.value.school || ''
    })

    localStorage.setItem(
      'userProfile',
      JSON.stringify({
        avatar: avatarUrl || '',
        nickname: profileForm.value.nickname || '',
        gender: profileForm.value.gender || '保密',
        grade: profileForm.value.grade || '',
        major: profileForm.value.major || '',
        school: profileForm.value.school || '',
        bio: profileForm.value.bio || ''
      })
    )

    ElMessage.success('保存成功!')
    closeDialog()

    window.dispatchEvent(new StorageEvent('storage', { key: 'userProfile' }))
    window.dispatchEvent(new CustomEvent('user-avatar-updated', { detail: avatarUrl }))

    emit('profile-saved', {
      avatar: avatarUrl || '',
      nickname: profileForm.value.nickname || 'U'
    })
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败，请重试')
  }
}
</script>

<style scoped>
.personal-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2001;
}

.personal-modal {
  width: 600px;
  max-width: calc(100vw - 32px);
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
}

.personal-modal-header {
  position: relative;
  padding: 20px 24px 8px 24px;
  text-align: center;
}

.personal-modal-title {
  color: #8f7aa4;
  font-weight: 700;
  font-size: 20px;
}

.personal-modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: #999;
  cursor: pointer;
  font-size: 18px;
  line-height: 32px;
}

.personal-modal-close:hover {
  background: #f2f2f2;
  color: #666;
}

.personal-modal-body {
  padding: 8px 24px 0 24px;
}

.personal-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px 20px 24px;
}

.avatar-uploader {
  width: 120px;
  height: 120px;
  border: 1px dashed #d9d9d9;
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
}

.avatar-uploader:hover {
  border-color: #b8a0c8;
}

.avatar-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

:deep(.el-form-item__label) {
  color: #404040;
  font-weight: 500;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #b8a0c8 inset;
}

:deep(.el-textarea__inner:focus) {
  border-color: #b8a0c8;
  box-shadow: 0 0 0 1px #b8a0c8 inset;
}

:deep(.el-select .el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 1px #b8a0c8 inset;
}
</style>
