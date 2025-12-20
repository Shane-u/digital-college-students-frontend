<template>
  <div>
    <!-- 滚动进度条 -->
    <div class="scroll-progress" ref="scrollProgress"></div>

    <nav class="navbar navbar-transparent" ref="navbar">
      <div class="nav-inner">
        <div class="nav-left">
          <div class="brand">
            <img 
              src="../assets/nav.png" 
              alt="网站Logo" 
              class="logo-img"
            >
          </div>
        </div>
        <div class="nav-center nav-center-transparent" ref="navLinksRef">
          <router-link to="/home" class="nav-link bold" exact>首页</router-link>
          <div class="nav-dropdown">
            <span class="nav-link bold">竞赛活动</span>
            <div class="dropdown-menu">
              <router-link to="/competition/edu" class="dropdown-item" exact>竞赛一览</router-link>
              <router-link to="/competition/subject" class="dropdown-item" exact>学科专业竞赛</router-link>
            </div>
          </div>
          <div class="nav-dropdown">
            <span class="nav-link bold">职业发展</span>
            <div class="dropdown-menu">
              <router-link to="/career/showcase" class="dropdown-item" exact>职业展示</router-link>
              <router-link to="/career/planning" class="dropdown-item" exact>职业规划</router-link>
              <router-link to="/career/resume" class="dropdown-item" exact>简历制作</router-link>
            </div>
          </div>
          <router-link to="/knowledge-graph" class="nav-link bold" exact>知识图谱</router-link>
          <div class="nav-dropdown">
            <span class="nav-link bold">成长轨迹</span>
            <div class="dropdown-menu">
              <router-link to="/growth/record" class="dropdown-item" exact>成长记录</router-link>
              <router-link to="/growth/milestone" class="dropdown-item" exact>里程碑</router-link>
              <router-link to="/growth/photo-wall" class="dropdown-item" exact>照片墙</router-link>
            </div>
          </div>
          <div
            class="active-indicator"
            ref="indicatorRef"
            :style="indicatorStyle"
          ></div>
        </div>
        <div class="nav-right">
          <a href="/login" class="nav-auth" ref="loginLink">登录/注册</a>
          
          <div class="user-info-container" ref="userContainer" style="display: none;">
            <div class="user-avatar">
              <img v-if="userAvatar" :src="userAvatar" class="user-avatar-img" alt="用户头像" />
              <span v-else class="user-account" ref="userAccount">{{ userDisplayName }}</span>
            </div>
            <div class="user-dropdown">
              <a class="dropdown-item profile-btn" ref="profileBtn" @click="openProfileDialog">个人主页</a>
              <a class="dropdown-item logout-btn" ref="logoutBtn" @click="handleLogout">退出登录</a>
            </div>
          </div>
        </div>
      </div>
    </nav>
    
    <!-- 个人主页对话框（自定义弹窗） -->
    <div v-if="profileDialogVisible" class="personal-modal-overlay">
      <div class="personal-modal" role="dialog" aria-modal="true" aria-labelledby="personal-modal-title">
        <div class="personal-modal-header">
          <div id="personal-modal-title" class="personal-modal-title">个人主页</div>
          <button class="personal-modal-close" @click="profileDialogVisible = false" aria-label="关闭">✕</button>
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
        <el-button @click="profileDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveProfile">保存</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { uploadUserAvatar, updateMyProfile, getMyProfile } from '../api/user'
import { Plus } from '@element-plus/icons-vue'
import { normalizeProfile } from '../utils/profile'

// 获取当前路由
const route = useRoute()

// 接收 props
const props = defineProps({
  transparent: {
    type: Boolean,
    default: false // 默认不透明，只有首页传入 true
  }
})

// 元素引用（替代原JS中的getElementById）
const navbar = ref(null)
const scrollProgress = ref(null)
const loginLink = ref(null)
const userContainer = ref(null)
const userAccount = ref(null)
const logoutBtn = ref(null)
const navLinksRef = ref(null)
const indicatorRef = ref(null)
const profileBtn = ref(null)
const profileFormRef = ref(null)

// 个人主页对话框
const profileDialogVisible = ref(false)
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

// 用户信息
const userAvatar = ref('')
const userDisplayName = ref('U')

// 活动指示器样式
const indicatorStyle = ref({
  width: '0px',
  left: '0px'
})

// 导航栏透明状态标识
let isNavTransparent = true

// 当前激活的链接
const activeLink = ref(null)

// 滚动处理函数（修改为仅在需要透明效果的页面工作）
const handleScroll = () => {
  // 更新滚动进度条
  const scrollTop = window.scrollY
  const docHeight = document.body.offsetHeight - window.innerHeight
  const scrollPercent = (scrollTop / docHeight) * 100
  scrollProgress.value.style.width = `${scrollPercent}%`

  // 只在启用透明效果的页面才切换导航栏状态
  if (props.transparent) {
    // 导航栏状态切换
    if (scrollTop < 50) {
      if (!isNavTransparent) {
        navbar.value.classList.add('navbar-transparent')
        isNavTransparent = true
      }
    } else {
      if (isNavTransparent) {
        navbar.value.classList.remove('navbar-transparent')
        isNavTransparent = false
      }
    }
  }
}

// 打开个人主页对话框
const openProfileDialog = () => {
  // 从localStorage加载用户信息
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
  
  profileDialogVisible.value = true
}

// 头像上传前验证
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

// 头像文件变化处理
const handleAvatarChange = (file) => {
  // 保存原始文件用于上传，并设置预览
  selectedAvatarFile.value = file.raw
  const reader = new FileReader()
  reader.onload = (e) => {
    profileForm.value.avatar = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

// 保存个人资料
const saveProfile = async () => {
  try {
    // 1) 若选择了新头像文件，先上传以获取URL
    let avatarUrl = profileForm.value.avatar
    if (selectedAvatarFile.value) {
      const url = await uploadUserAvatar(selectedAvatarFile.value)
      if (url) {
        avatarUrl = url
        profileForm.value.avatar = url
      }
    }
    // 2) 调用后端更新接口
    await updateMyProfile({
      userName: profileForm.value.nickname || '',
      userAvatar: avatarUrl || '',
      userProfile: profileForm.value.bio || '',
      gender: profileForm.value.gender || '保密',
      grade: profileForm.value.grade || '',
      major: profileForm.value.major || '',
      school: profileForm.value.school || ''
    })
    // 3) 本地存储，供其它模块(如聊天)读取
    localStorage.setItem('userProfile', JSON.stringify({
      avatar: avatarUrl || '',
      nickname: profileForm.value.nickname || '',
      gender: profileForm.value.gender || '保密',
      grade: profileForm.value.grade || '',
      major: profileForm.value.major || '',
      school: profileForm.value.school || '',
      bio: profileForm.value.bio || ''
    }))
    // 4) 更新导航栏显示
    userAvatar.value = avatarUrl || ''
    userDisplayName.value = profileForm.value.nickname || 'U'
    if (userAccount.value) {
      if (userAvatar.value) {
        userAccount.value.style.display = 'none'
      } else {
        userAccount.value.textContent = userDisplayName.value
        userAccount.value.style.display = 'flex'
      }
    }
    ElMessage.success('保存成功!')
    profileDialogVisible.value = false
    // 5) 通知聊天组件更新头像
    window.dispatchEvent(new StorageEvent('storage', { key: 'userProfile' }))
    window.dispatchEvent(new CustomEvent('user-avatar-updated', { detail: avatarUrl }))
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败，请重试')
  }
}

// 退出登录函数（保留原逻辑）
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    localStorage.removeItem('userInfo')
    localStorage.removeItem('userProfile')
    window.location.href = '/login'
  }).catch(() => {
    // 取消操作
  })
}

// 活动指示器移动函数
const moveIndicator = (linkElement) => {
  if (!linkElement || !navLinksRef.value) return
  
  const linkRect = linkElement.getBoundingClientRect()
  const navRect = navLinksRef.value.getBoundingClientRect()
  
  indicatorStyle.value = {
    width: `${linkRect.width}px`,
    left: `${linkRect.left - navRect.left}px`
  }
}

// 根据路由路径找到对应的导航链接
const findActiveLinkByRoute = () => {
  if (!navLinksRef.value) return null
  
  const currentPath = route.path
  const currentHash = route.hash
  const fullPath = currentPath + currentHash
  
  // 获取所有导航链接（router-link和普通链接），排除nav-link-inactive
  const links = navLinksRef.value.querySelectorAll('.nav-link:not(.nav-link-inactive)')
  
  // 1. 优先精确匹配完整路径（包括 hash）
  for (const link of links) {
    const to = link.getAttribute('to') || link.getAttribute('href')
    if (!to) continue
    
    if (to === fullPath) {
      return link
    }
  }
  
  // 2. 如果没有hash，匹配路径
  if (!currentHash) {
    for (const link of links) {
      const to = link.getAttribute('to') || link.getAttribute('href')
      if (!to) continue
      
      // 精确匹配路径（不含hash）
      if (to === currentPath) {
        return link
      }
    }
  }
  
  // 3. 如果当前在首页且有hash，匹配对应的hash链接
  if ((currentPath === '/home' || currentPath === '/') && currentHash) {
    for (const link of links) {
      const to = link.getAttribute('to') || link.getAttribute('href')
      if (!to) continue
      
      if (to === `/home${currentHash}`) {
        return link
      }
    }
  }
  
  // 4. 默认返回首页链接（只在路径为/或/home且无hash时）
  if ((currentPath === '/home' || currentPath === '/') && !currentHash) {
    for (const link of links) {
      const to = link.getAttribute('to') || link.getAttribute('href')
      if (to === '/home' && !to.includes('#')) {
        return link
      }
    }
  }
  
  return null
}

// 更新激活链接
const updateActiveLink = () => {
  const currentPath = route.path
  const currentHash = route.hash
  
  // 移除所有链接的 active 类
  if (navLinksRef.value) {
    const allLinks = navLinksRef.value.querySelectorAll('.nav-link')
    allLinks.forEach(link => link.classList.remove('active'))
    
    // 移除所有下拉菜单项的 active 类
    const allDropdownItems = document.querySelectorAll('.dropdown-item')
    allDropdownItems.forEach(item => item.classList.remove('active'))
  }
  
  // 处理下拉菜单的激活逻辑（竞赛活动、职业规划、成长轨迹）
  let activatedDropdownItem = null
  let parentLink = null
  
  // 找到对应的下拉菜单项并激活
  const dropdownItems = document.querySelectorAll('.dropdown-item')
  dropdownItems.forEach(item => {
    const to = item.getAttribute('to') || item.getAttribute('href')
    if (to && to === currentPath) {
      item.classList.add('active')
      activatedDropdownItem = item
    }
  })
  
  // 如果找到了激活的下拉菜单项，找到对应的父级链接
  if (activatedDropdownItem) {
    const allDropdowns = navLinksRef.value?.querySelectorAll('.nav-dropdown')
    if (allDropdowns) {
      for (const dropdown of allDropdowns) {
        const items = dropdown.querySelectorAll('.dropdown-item')
        // 检查激活的菜单项是否在这个下拉菜单中
        let foundInThisDropdown = false
        items.forEach(item => {
          if (item === activatedDropdownItem) {
            foundInThisDropdown = true
          }
        })
        if (foundInThisDropdown) {
          parentLink = dropdown.querySelector('.nav-link')
          break
        }
      }
    }
  }
  
  // 兼容“竞赛详情”页：当路径属于竞赛模块但未匹配具体下拉项时，激活“竞赛活动”父链接
  if (!parentLink) {
    const isCompetitionDetail =
      currentPath.startsWith('/competition') ||
      currentPath.startsWith('/contest')
    if (isCompetitionDetail && navLinksRef.value) {
      // 第一个包含“竞赛活动”的下拉父项
      const dropdowns = navLinksRef.value.querySelectorAll('.nav-dropdown')
      for (const dropdown of dropdowns) {
        const parentSpan = dropdown.querySelector('.nav-link')
        if (parentSpan && parentSpan.textContent && parentSpan.textContent.includes('竞赛活动')) {
          parentLink = parentSpan
          break
        }
      }
    }
  }
  
  // 如果找到了父级链接，激活它
  if (parentLink && activatedDropdownItem) {
    parentLink.classList.add('active')
    activeLink.value = parentLink
    moveIndicator(parentLink)
  } else {
    // 其他页面使用正常的查找逻辑
    const newActiveLink = findActiveLinkByRoute()
    if (newActiveLink) {
      activeLink.value = newActiveLink
      newActiveLink.classList.add('active')
      moveIndicator(newActiveLink)
    } else if (parentLink) {
      // 无精确匹配，但识别为竞赛模块时，仅激活父链接并移动指示器
      parentLink.classList.add('active')
      activeLink.value = parentLink
      moveIndicator(parentLink)
    }
  }
}

// 处理导航链接鼠标悬停
const handleNavLinkMouseEnter = (event) => {
  // 如果是非激活链接，不移动指示器
  if (event.target.classList.contains('nav-link-inactive')) {
    return
  }
  moveIndicator(event.target)
}

// 处理导航区域鼠标离开
const handleNavCenterMouseLeave = () => {
  // 恢复到当前激活的链接
  if (activeLink.value) {
    moveIndicator(activeLink.value)
  }
}

// 初始化活动指示器
const initializeIndicator = () => {
  setTimeout(() => {
    updateActiveLink()
  }, 100)
}

// 初始化用户状态
const initUserStatus = async () => {
  const userInfoStr = localStorage.getItem('userInfo')
  if (!userInfoStr) return

  const user = JSON.parse(userInfoStr)
  let storedProfile = JSON.parse(localStorage.getItem('userProfile') || '{}')

  try {
    const latestProfile = await getMyProfile()
    if (latestProfile) {
      storedProfile = normalizeProfile(latestProfile, user)
      localStorage.setItem('userProfile', JSON.stringify(storedProfile))
    } else {
      storedProfile = normalizeProfile(storedProfile, user)
    }
  } catch (error) {
    console.warn('获取个人信息失败:', error)
    storedProfile = normalizeProfile(storedProfile, user)
  }
  
  // 设置用户头像和昵称
  userAvatar.value = storedProfile.avatar || user.userAvatar || ''
  userDisplayName.value = storedProfile.nickname || 'U'
  
  // 显示用户名首字母或昵称
  if (userAccount.value) {
    if (userAvatar.value) {
      userAccount.value.style.display = 'none'
    } else {
      const displayText = userDisplayName.value.length > 1 
        ? userDisplayName.value.charAt(0).toUpperCase()
        : userDisplayName.value.toUpperCase()
      userAccount.value.textContent = displayText
      userAccount.value.style.display = 'flex'
    }
  }
  
  if (loginLink.value) {
    loginLink.value.style.display = 'none'
  }
  if (userContainer.value) {
    userContainer.value.style.display = 'block'
  }
}

// 监听路由变化
watch(() => route.path, () => {
  updateActiveLink()
})

watch(() => route.hash, () => {
  updateActiveLink()
})

// 组件挂载时绑定事件和初始化
onMounted(() => {
  // 根据 transparent prop 设置初始状态
  if (!props.transparent && navbar.value) {
    // 非透明页面，移除透明类，确保导航栏一直是白色的
    navbar.value.classList.remove('navbar-transparent')
    isNavTransparent = false
  }
  
  // 监听滚动事件
  window.addEventListener('scroll', handleScroll)
  // 初始执行一次滚动处理（确保初始状态正确）
  handleScroll()
  // 初始化用户状态
  initUserStatus()
  // 绑定退出登录点击事件
  if (logoutBtn.value) {
    logoutBtn.value.addEventListener('click', handleLogout)
  }
  // 初始化活动指示器
  initializeIndicator()
  // 为导航链接绑定鼠标悬停事件
  if (navLinksRef.value) {
    const navLinks = navLinksRef.value.querySelectorAll('.nav-link')
    navLinks.forEach(link => {
      link.addEventListener('mouseenter', handleNavLinkMouseEnter)
    })
    // 为导航中心区域绑定鼠标离开事件
    navLinksRef.value.addEventListener('mouseleave', handleNavCenterMouseLeave)
  }
})

// 组件卸载时移除事件（防止内存泄漏）
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  if (logoutBtn.value) {
    logoutBtn.value.removeEventListener('click', handleLogout)
  }
  // 移除导航链接事件监听
  if (navLinksRef.value) {
    const navLinks = navLinksRef.value.querySelectorAll('.nav-link')
    navLinks.forEach(link => {
      link.removeEventListener('mouseenter', handleNavLinkMouseEnter)
    })
    // 移除鼠标离开事件
    navLinksRef.value.removeEventListener('mouseleave', handleNavCenterMouseLeave)
  }
})
</script>

<style scoped>
/* 基础样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  text-decoration: none;
  list-style: none;
}

body {
  padding-top: 80px; /* 避免内容被导航栏遮挡 */
  min-height: 5000px; /* 保留页面高度以便滚动测试导航栏效果 */
}

/* 滚动进度指示器 */
.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, #4f46e5, #a855f7);
  width: 0%;
  z-index: 1001;
  transition: width 0.1s ease;
}

/* 导航栏样式 */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  transition: background-color 0.5s ease, box-shadow 0.4s ease, padding 0.3s ease, height 0.3s ease;

}

/* 透明状态样式 */
.navbar-transparent {
  background: linear-gradient(rgb(66,66,66,0.8),rgba(122,122,122,.49), rgba(209,209,209, 0.04));
  backdrop-filter: blur(0px);
  box-shadow: none;
}

.nav-center-transparent {
  color: #fff;
}

.nav-inner {
  padding: 12px 20px;
  display: flex;
  align-items: center;
  max-width: 1200px; /* 调整宽度 */
  height: 80px;
  margin: 0 auto;
}

.nav-left {
  width: 20%; /* 调整比例 */
  display: flex;
  align-items: center;
}

  .nav-center {
    width: 60%; /* 调整比例 */
    display: flex;
    justify-content: center;
    gap: 2rem;
    position: relative;
    font-family: 'Noto Sans SC', 'SourceHanSansCN-Regular', Poppins, Arial, 'Microsoft YaHei', "\u5b8b\u4f53", Tahoma, Geneva, sans-serif;
    margin-left: 50px;
  }

.nav-right {
  width: 20%; /* 调整比例 */
  display: flex;
  justify-content: flex-end;
  padding-right: 15px;
}

/* Logo图片样式 - 增大尺寸 */
.logo-img {
  height: 130px; /* 增大Logo */
  width: auto;
  object-fit: contain;
  border-radius: 8px;
  transition: transform 0.3s ease, height 0.3s ease;
}

.logo-img:hover {
  transform: scale(1.03);
}

/* 滚动时缩小Logo */
.navbar:not(.navbar-transparent) .logo-img {
  height: 100px;
}

.brand {
  font-size: 1.5rem;
  font-weight: bold;
  color: #4f46e5;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-link {
  position: relative;
  padding: 0.5rem 0;
  color: #4b5563;
  text-decoration: none !important;
  font-weight: 500;
  transition: all 0.3s ease;
  font-size: 19px;
  display: inline-block;
}

/* 确保router-link没有默认样式 */
.nav-link:focus,
.nav-link:active,
.nav-link:visited {
  text-decoration: none !important;
  outline: none;
}

.nav-link:hover {
  color: #4f46e5;
}

/* 非激活的导航链接（职业规划、个人主页） */
.nav-link.nav-link-inactive {
  cursor: default;
}

.nav-link.nav-link-inactive:hover {
  color: #4b5563;
}

.nav-link.active,
.nav-link.router-link-exact-active {
  color: #4f46e5 !important;
  font-weight: 700 !important;
  text-shadow: 0 0 1px rgba(125, 81, 150, 0.3);
  border-bottom: 3px solid #4f46e5;
  padding-bottom: calc(0.5rem - 3px);
}

.nav-link.active:hover,
.nav-link.router-link-exact-active:hover {
  color: #4f46e5 !important;
}

/* 透明状态时导航链接为白色 */
.navbar-transparent .nav-link {
  color: #ffffff;
}

.navbar-transparent .nav-link:hover {
  color: #d4a5ff;
}

/* 透明状态时非激活链接保持原色 */
.navbar-transparent .nav-link.nav-link-inactive:hover {
  color: #ffffff;
}

.navbar-transparent .nav-link.active,
.navbar-transparent .nav-link.router-link-exact-active {
  color: #ffffff !important;
  font-weight: 700 !important;
  text-shadow: 0 0 1px rgba(255, 255, 255, 0.5);
  border-bottom: 3px solid #ffffff;
  padding-bottom: calc(0.5rem - 3px);
}

/* 活动指示器 */
.active-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 4px;
  background: linear-gradient(90deg, #4f46e5, #a855f7);
  border-radius: 4px;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 0 2px 8px rgba(125, 81, 150, 0.4);
}

/* 透明状态时活动指示器为白色 */
.navbar-transparent .active-indicator {
  background: linear-gradient(90deg, #ffffff, #e0d7ff);
  box-shadow: 0 2px 8px rgba(255, 255, 255, 0.5);
}

.nav-auth {
  border: 1px solid #4f46e5;
  color: #4f46e5;
  font-weight: 600;
  font-size: 18px;
  padding: 7px 14px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.nav-auth:hover {
  color: #ffffff;
  background-color: #4f46e5;
  border-color: #4f46e5;
  transform: translateY(-2px);
}

/* 透明状态时登录按钮为白色 */
.navbar-transparent .nav-auth {
  border-color: #ffffff;
  color: #ffffff;
}

.navbar-transparent .nav-auth:hover {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: #ffffff;
  color: #ffffff;
}

/* 用户信息样式 */
.user-info-container {
  position: relative;
  font-family: 'Courier New', Courier, monospace;
  overflow: visible;
}

/* 占位类由 :deep 规则使用，这里不需要局部样式，删除空规则 */

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(45deg, #4f46e5, #a855f7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  cursor: pointer;
  overflow: visible;
  border: 2px solid #e5e7eb;
  transition: transform 0.3s ease;
  position: relative;
}

.user-avatar:hover {
  transform: scale(1.1);
}

.user-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  pointer-events: none;
}

.user-account {
  color: white;
  font-weight: bold;
  font-family:  Arial, sans-serif;
  font-size: 18px;
  pointer-events: none;
}

.user-dropdown {
  display: none;
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 150px;
  background-color: white;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  border-radius: 6px;
  padding: 8px 0;
  margin-top: -6px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
}

.user-info-container:hover .user-dropdown,
.user-avatar:hover .user-dropdown {
  display: block !important;
  opacity: 1 !important;
  pointer-events: auto !important;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

.user-dropdown .dropdown-item {
  color: #4a2599 !important;
  font-weight: 500;
  display: block !important;
  padding: 10px 20px;
  cursor: pointer;
  text-decoration: none !important;
  font-size: 14px;
  line-height: 1.5;
  white-space: nowrap;
}

.user-dropdown .dropdown-item:hover {
  background-color: #f3e8ff !important;
  color: #6a3dc4 !important;
  padding-left: 22px;
}

.user-dropdown .profile-btn {
  color: #4a2599 !important;
  border-bottom: 1px solid #e0e0e0;
}

.user-dropdown .logout-btn {
  color: #d946ef !important;
}

.user-dropdown .logout-btn:hover {
  background-color: #f3e8ff !important;
  color: #d946ef !important;
}

/* 自定义个人主页弹窗样式 */
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

/* 导航栏下拉菜单样式 */
.nav-dropdown {
  position: relative;
  display: inline-block;
}

.nav-dropdown .nav-link {
  cursor: pointer;
}

.dropdown-menu {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 217px;
  background-color: white;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  border-radius: 6px;
  padding: 8px 0;
  margin-top: -5px;
}

.dropdown-item {
  display: block;
  padding: 10px 20px;
  color: #4a2599;
  text-decoration: none !important;
  font-size: 15px;
  text-align: left;
  transition: all 0.2s;
  font-weight: 500;
}

/* 确保dropdown-item没有默认样式 */
.dropdown-item:focus,
.dropdown-item:active,
.dropdown-item:visited {
  text-decoration: none !important;
  outline: none;
  color: #4a2599;
}

.dropdown-item:hover {
  background-color: #f3e8ff;
  color: #6a3dc4;
  padding-left: 22px;
}

.dropdown-item.active,
.dropdown-item.router-link-exact-active {
  background-color: #f3e8ff;
  color: #4f46e5 !important;
  font-weight: 700;
  border-left: 3px solid #4f46e5;
}

.nav-dropdown:hover .dropdown-menu {
  display: block;
  animation: fadeIn 0.2s ease;
}

.bold {
  font-weight: 600;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .nav-left,
  .nav-right {
    width: 25%;
  }

  .nav-center {
    width: 50%;
    gap: 12px;
  }

  .logo-img {
    height: 100px;
  }

  .navbar:not(.navbar-transparent) .logo-img {
    height: 80px;
  }

  .nav-link {
    font-size: 14px;
  }

  .nav-auth {
    font-size: 14px;
    padding: 5px 10px;
  }
}

/* 个人主页对话框样式（通过传入的 class 提高命中率） */
::deep(.personal-dialog .el-dialog__header) {
  background: transparent !important;
  padding: 16px 20px 8px 20px !important;
  margin: 0 !important;
  text-align: center !important;
  border-bottom: none !important;
}

::deep(.personal-dialog .el-dialog__title) {
  color: #8f7aa4 !important;
  font-weight: 700 !important;
  text-align: center !important;
}

::deep(.personal-dialog .el-dialog__headerbtn),
::deep(.personal-dialog .el-dialog__close) {
  display: inline-flex !important;
  opacity: 1 !important;
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