<template>
  <div class="resume-builder-page">
    <!-- 导航栏 -->
    <NavBar :transparent="false" />

    <div class="main-container">
      <!-- 左侧编辑面板 -->
      <div class="left-panel">
        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-button type="primary" @click="fillPreviewData">预览填充</el-button>
          <el-button @click="clearData">清空数据</el-button>
          <el-button @click="exportJSON">导出JSON</el-button>
          <el-button @click="importJSON">导入JSON</el-button>
        </div>

        <!-- 提示信息 -->
        <el-alert
          type="info"
          :closable="false"
          style="margin: 10px 0;"
        >
          <template #default>
            现已经支持部分区域渲染markdown或HTML语法(如技能、项目等)
          </template>
        </el-alert>

        <!-- 表单区域 -->
        <div class="form-sections">
          <el-collapse v-model="activeSections">
            <!-- 个人信息 -->
            <el-collapse-item name="personal" title="个人信息">
              <div class="form-grid">
                <div class="form-column">
                  <el-form-item label="姓名">
                    <el-input v-model="resumeData.personalInfo.name" placeholder="请输入姓名" />
                  </el-form-item>
                  <el-form-item label="电子邮箱">
                    <el-input v-model="resumeData.personalInfo.email" placeholder="请输入电子邮箱" />
                  </el-form-item>
                  <el-form-item label="专业">
                    <el-input v-model="resumeData.personalInfo.major" placeholder="请输入专业" />
                  </el-form-item>
                  <el-form-item label="个人网站">
                    <el-input v-model="resumeData.personalInfo.website" placeholder="请输入个人网站" />
                  </el-form-item>
                  <el-form-item label="头像">
                    <el-upload
                      class="avatar-uploader"
                      :show-file-list="false"
                      :on-success="handleAvatarSuccess"
                      :before-upload="beforeAvatarUpload"
                      :auto-upload="false"
                      :on-change="handleAvatarChange"
                    >
                      <img v-if="resumeData.personalInfo.avatar" :src="resumeData.personalInfo.avatar" class="avatar" />
                      <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
                    </el-upload>
                  </el-form-item>
                </div>
                <div class="form-column">
                  <el-form-item label="联系电话">
                    <el-input v-model="resumeData.personalInfo.phone" placeholder="请输入联系电话" />
                  </el-form-item>
                  <el-form-item label="所在大学">
                    <el-input v-model="resumeData.personalInfo.university" placeholder="请输入所在大学" />
                  </el-form-item>
                  <el-form-item label="年龄">
                    <el-input v-model="resumeData.personalInfo.age" placeholder="请输入年龄" />
                  </el-form-item>
                  <el-form-item label="岗位">
                    <el-input v-model="resumeData.personalInfo.position" placeholder="应聘岗位" />
                  </el-form-item>
                </div>
              </div>
            </el-collapse-item>

            <!-- 教育经历 -->
            <el-collapse-item name="education" title="教育经历">
              <div v-for="(edu, index) in resumeData.education" :key="index" class="edu-item">
                <el-form-item label="学校">
                  <el-input v-model="edu.school" placeholder="请输入学校名称" />
                </el-form-item>
                <el-form-item label="专业">
                  <el-input v-model="edu.major" placeholder="请输入专业" />
                </el-form-item>
                <el-form-item label="学历">
                  <el-select v-model="edu.degree" placeholder="请选择学历">
                    <el-option label="本科" value="本科" />
                    <el-option label="硕士" value="硕士" />
                    <el-option label="博士" value="博士" />
                  </el-select>
                </el-form-item>
                <el-form-item label="时间">
                  <el-date-picker
                    v-model="edu.period"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    value-format="YYYY-MM-DD"
                  />
                </el-form-item>
                <el-form-item label="描述">
                  <el-input
                    v-model="edu.description"
                    type="textarea"
                    :rows="3"
                    placeholder="请输入教育经历描述（支持Markdown）"
                  />
                </el-form-item>
                <el-button type="danger" size="small" @click="removeEducation(index)">删除</el-button>
              </div>
              <el-button type="primary" size="small" @click="addEducation">添加教育经历</el-button>
            </el-collapse-item>

            <!-- 项目经历 -->
            <el-collapse-item name="projects" title="项目经历">
              <div v-for="(project, index) in resumeData.projects" :key="index" class="project-item">
                <el-form-item label="项目名称">
                  <el-input v-model="project.name" placeholder="请输入项目名称" />
                </el-form-item>
                <el-form-item label="时间">
                  <el-date-picker
                    v-model="project.period"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    value-format="YYYY-MM-DD"
                  />
                </el-form-item>
                <el-form-item label="项目描述">
                  <el-input
                    v-model="project.description"
                    type="textarea"
                    :rows="4"
                    placeholder="请输入项目描述（支持Markdown）"
                  />
                </el-form-item>
                <el-form-item label="技术栈">
                  <el-input v-model="project.techStack" placeholder="请输入技术栈，用逗号分隔" />
                </el-form-item>
                <el-button type="danger" size="small" @click="removeProject(index)">删除</el-button>
              </div>
              <el-button type="primary" size="small" @click="addProject">添加项目</el-button>
            </el-collapse-item>

            <!-- 工作经历 -->
            <el-collapse-item name="work" title="工作经历">
              <div v-for="(work, index) in resumeData.workExperience" :key="index" class="work-item">
                <el-form-item label="公司名称">
                  <el-input v-model="work.company" placeholder="请输入公司名称" />
                </el-form-item>
                <el-form-item label="职位">
                  <el-input v-model="work.position" placeholder="请输入职位" />
                </el-form-item>
                <el-form-item label="时间">
                  <el-date-picker
                    v-model="work.period"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    value-format="YYYY-MM-DD"
                  />
                </el-form-item>
                <el-form-item label="工作描述">
                  <el-input
                    v-model="work.description"
                    type="textarea"
                    :rows="4"
                    placeholder="请输入工作描述（支持Markdown）"
                  />
                </el-form-item>
                <el-button type="danger" size="small" @click="removeWork(index)">删除</el-button>
              </div>
              <el-button type="primary" size="small" @click="addWork">添加工作经历</el-button>
            </el-collapse-item>

            <!-- 技能特长 -->
            <el-collapse-item name="skills" title="技能特长">
              <el-form-item label="技能描述">
                <el-input
                  v-model="resumeData.skills"
                  type="textarea"
                  :rows="5"
                  placeholder="请输入技能描述（支持Markdown，如：**前端**: Vue, React, TypeScript）"
                />
              </el-form-item>
            </el-collapse-item>

            <!-- 荣誉奖项 -->
            <el-collapse-item name="awards" title="荣誉奖项">
              <el-form-item label="奖项描述">
                <el-input
                  v-model="resumeData.awards"
                  type="textarea"
                  :rows="5"
                  placeholder="请输入荣誉奖项（支持Markdown）"
                />
              </el-form-item>
            </el-collapse-item>
          </el-collapse>
        </div>

        <!-- Star组件 -->
       
      </div>

      <!-- 右侧预览面板 -->
      <div class="right-panel">
        <div class="preview-header">
          <el-button @click="openSettings">简历设置</el-button>
          <el-button type="primary" @click="exportPDF">导出PDF</el-button>
        </div>

        <!-- 左侧导航大纲 -->
        <div class="preview-outline">
          <div 
            v-for="section in outlineSections" 
            :key="section.key"
            :class="['outline-item', { 'active': activeOutline === section.key }]"
            @click="scrollToSection(section.key)"
          >
            {{ section.label }}
          </div>
        </div>

        <!-- 预览内容 -->
        <div class="preview-content" ref="previewContent">
          <div 
            class="resume-preview" 
            :style="previewStyle"
            ref="resumePreview"
            @mousedown="startDrag"
            :class="{ 'dragging': isDragging }"
          >
            <!-- 个人信息 -->
            <div class="resume-section personal-section" id="personal">
              <div class="personal-header">
                <div class="personal-info">
                  <h1 class="name">{{ resumeData.personalInfo.name || '姓名' }}</h1>
                  <div class="contact-info">
                    <span v-if="resumeData.personalInfo.phone">📞 {{ resumeData.personalInfo.phone }}</span>
                    <span v-if="resumeData.personalInfo.email">✉️ {{ resumeData.personalInfo.email }}</span>
                    <span v-if="resumeData.personalInfo.website">🌐 {{ resumeData.personalInfo.website }}</span>
                  </div>
                  <div class="basic-info">
                    <span v-if="resumeData.personalInfo.age">年龄: {{ resumeData.personalInfo.age }}</span>
                    <span v-if="resumeData.personalInfo.university">学校: {{ resumeData.personalInfo.university }}</span>
                    <span v-if="resumeData.personalInfo.major">专业: {{ resumeData.personalInfo.major }}</span>
                    <span v-if="resumeData.personalInfo.position">岗位: {{ resumeData.personalInfo.position }}</span>
                  </div>
                </div>
                <div class="avatar-wrapper">
                  <div class="avatar-container">
                    <img v-if="resumeData.personalInfo.avatar" :src="resumeData.personalInfo.avatar" alt="头像" class="avatar-img" />
                    <div v-else class="avatar-placeholder">头像</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 教育经历 -->
            <div v-if="resumeData.education.length > 0" class="resume-section" id="education">
              <h2 class="section-title">教育经历</h2>
              <div v-for="(edu, index) in resumeData.education" :key="index" class="section-item">
                <div class="item-header">
                  <h3>{{ edu.school || '学校名称' }}</h3>
                  <span class="item-period">{{ formatPeriod(edu.period) }}</span>
                </div>
                <p class="item-meta">{{ edu.degree || '学历' }} | {{ edu.major || '专业' }}</p>
                <div v-if="edu.description" class="item-content" v-html="renderMarkdown(edu.description)"></div>
              </div>
            </div>

            <!-- 项目经历 -->
            <div v-if="resumeData.projects.length > 0" class="resume-section" id="projects">
              <h2 class="section-title">项目经历</h2>
              <div v-for="(project, index) in resumeData.projects" :key="index" class="section-item">
                <div class="item-header">
                  <h3>{{ project.name || '项目名称' }}</h3>
                  <span class="item-period">{{ formatPeriod(project.period) }}</span>
                </div>
                <p v-if="project.techStack" class="item-meta">技术栈: {{ project.techStack }}</p>
                <div v-if="project.description" class="item-content" v-html="renderMarkdown(project.description)"></div>
              </div>
            </div>

            <!-- 工作经历 -->
            <div v-if="resumeData.workExperience.length > 0" class="resume-section" id="work">
              <h2 class="section-title">工作/实习经历</h2>
              <div v-for="(work, index) in resumeData.workExperience" :key="index" class="section-item">
                <div class="item-header">
                  <h3>{{ work.company || '公司名称' }} - {{ work.position || '职位' }}</h3>
                  <span class="item-period">{{ formatPeriod(work.period) }}</span>
                </div>
                <div v-if="work.description" class="item-content" v-html="renderMarkdown(work.description)"></div>
              </div>
            </div>

            <!-- 技能特长 -->
            <div v-if="resumeData.skills" class="resume-section" id="skills">
              <h2 class="section-title">技能特长</h2>
              <div class="item-content" v-html="renderMarkdown(resumeData.skills)"></div>
            </div>

            <!-- 荣誉奖项 -->
            <div v-if="resumeData.awards" class="resume-section" id="awards">
              <h2 class="section-title">荣誉奖项</h2>
              <div class="item-content" v-html="renderMarkdown(resumeData.awards)"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 简历设置对话框 -->
    <el-dialog v-model="settingsVisible" title="简历设置" width="500px">
      <el-form label-width="100px">
        <el-form-item label="主题色">
          <el-color-picker v-model="resumeSettings.themeColor" />
        </el-form-item>
        <el-form-item label="字体大小">
          <el-input-number v-model="resumeSettings.fontSize" :min="12" :max="18" />
        </el-form-item>
        <el-form-item label="行间距">
          <el-input-number v-model="resumeSettings.lineHeight" :min="1" :max="2" :step="0.1" />
        </el-form-item>
        <el-form-item label="段落间距">
          <el-input-number v-model="resumeSettings.sectionSpacing" :min="10" :max="50" />
        </el-form-item>
        <el-form-item label="页边距">
          <el-input-number v-model="resumeSettings.margin" :min="20" :max="60" />
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted, onUnmounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { marked } from 'marked'
import NavBar from '../components/NavBar.vue'

// 响应式数据
const activeSections = ref(['personal', 'education', 'projects', 'work', 'skills', 'awards'])
const settingsVisible = ref(false)
const previewContent = ref(null)
const resumePreview = ref(null)
const activeOutline = ref('projects')

// 拖拽相关
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const previewPosition = ref({ x: 0, y: 0 })

// 简历数据
const resumeData = reactive({
  personalInfo: {
    name: '',
    phone: '',
    email: '',
    university: '',
    major: '',
    age: '',
    website: '',
    position: '',
    avatar: ''
  },
  education: [],
  projects: [],
  workExperience: [],
  skills: '',
  awards: ''
})

// 简历设置
const resumeSettings = reactive({
  themeColor: '#7d5196',
  fontSize: 14,
  lineHeight: 1.6,
  sectionSpacing: 30,
  margin: 40
})

// 预览样式
const previewStyle = computed(() => {
  return {
    '--theme-color': resumeSettings.themeColor,
    '--font-size': `${resumeSettings.fontSize}px`,
    '--line-height': resumeSettings.lineHeight,
    '--section-spacing': `${resumeSettings.sectionSpacing}px`,
    '--margin': `${resumeSettings.margin}px`
  }
})

// 大纲导航
const outlineSections = computed(() => {
  const sections = []
  if (resumeData.projects.length > 0) sections.push({ key: 'projects', label: '项目经理' })
  if (resumeData.workExperience.length > 0) sections.push({ key: 'work', label: '工作/实习经历' })
  if (resumeData.skills) sections.push({ key: 'skills', label: '技能特长' })
  if (resumeData.awards) sections.push({ key: 'awards', label: '荣誉奖项' })
  return sections
})

// 初始化数据
const initResumeData = () => {
  const saved = localStorage.getItem('resumeData')
  if (saved) {
    try {
      const data = JSON.parse(saved)
      Object.assign(resumeData, data)
    } catch (e) {
      console.error('加载简历数据失败:', e)
    }
  }
}

// 保存数据到localStorage
watch(resumeData, () => {
  localStorage.setItem('resumeData', JSON.stringify(resumeData))
}, { deep: true })

// 预览填充
const fillPreviewData = () => {
  resumeData.personalInfo = {
    name: '张三',
    phone: '13800138000',
    email: 'zhangsan@example.com',
    university: 'XX大学',
    major: '计算机科学与技术',
    age: '22',
    website: 'https://example.com',
    position: '前端开发工程师',
    avatar: ''
  }
  resumeData.education = [{
    school: 'XX大学',
    major: '计算机科学与技术',
    degree: '本科',
    period: ['2020-09-01', '2024-06-30'],
    description: '主修课程：数据结构、算法、操作系统、计算机网络等'
  }]
  resumeData.projects = [{
    name: '数字化大学生平台',
    period: ['2024-01-01', '2024-06-30'],
    description: '**项目描述**: 一个面向大学生的综合服务平台\n\n**主要职责**:\n- 负责前端开发\n- 使用Vue3 + Element Plus构建用户界面',
    techStack: 'Vue3, Element Plus, TypeScript'
  }]
  resumeData.workExperience = [{
    company: 'XX科技有限公司',
    position: '前端开发实习生',
    period: ['2023-07-01', '2023-09-30'],
    description: '参与公司核心产品的前端开发工作，负责用户界面优化和功能实现'
  }]
  resumeData.skills = '**前端技术**: Vue3, React, TypeScript, JavaScript\n\n**工具**: Git, Webpack, Vite'
  resumeData.awards = '- 2023年优秀学生奖学金\n- 2022年ACM程序设计竞赛二等奖'
  ElMessage.success('预览数据填充成功')
}

// 清空数据
const clearData = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有数据吗？', '提示', {
      type: 'warning'
    })
    Object.assign(resumeData, {
      personalInfo: {
        name: '',
        phone: '',
        email: '',
        university: '',
        major: '',
        age: '',
        website: '',
        position: '',
        avatar: ''
      },
      education: [],
      projects: [],
      workExperience: [],
      skills: '',
      awards: ''
    })
    localStorage.removeItem('resumeData')
    ElMessage.success('数据已清空')
  } catch {
    // 用户取消
  }
}

// 导出JSON
const exportJSON = () => {
  const dataStr = JSON.stringify(resumeData, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'resume.json'
  link.click()
  URL.revokeObjectURL(url)
  ElMessage.success('JSON导出成功')
}

// 导入JSON
const importJSON = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          Object.assign(resumeData, data)
          ElMessage.success('JSON导入成功')
        } catch (error) {
          ElMessage.error('JSON格式错误')
        }
      }
      reader.readAsText(file)
    }
  }
  input.click()
}

// 头像上传
const handleAvatarChange = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    resumeData.personalInfo.avatar = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

const handleAvatarSuccess = () => {}

const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过2MB')
    return false
  }
  return true
}

// 教育经历操作
const addEducation = () => {
  resumeData.education.push({
    school: '',
    major: '',
    degree: '',
    period: null,
    description: ''
  })
}

const removeEducation = (index) => {
  resumeData.education.splice(index, 1)
}

// 项目操作
const addProject = () => {
  resumeData.projects.push({
    name: '',
    period: null,
    description: '',
    techStack: ''
  })
}

const removeProject = (index) => {
  resumeData.projects.splice(index, 1)
}

// 工作经历操作
const addWork = () => {
  resumeData.workExperience.push({
    company: '',
    position: '',
    period: null,
    description: ''
  })
}

const removeWork = (index) => {
  resumeData.workExperience.splice(index, 1)
}

// 格式化日期范围
const formatPeriod = (period) => {
  if (!period || !Array.isArray(period) || period.length !== 2) return ''
  const start = new Date(period[0])
  const end = new Date(period[1])
  return `${start.getFullYear()}.${String(start.getMonth() + 1).padStart(2, '0')} - ${end.getFullYear()}.${String(end.getMonth() + 1).padStart(2, '0')}`
}

// 渲染Markdown
const renderMarkdown = (text) => {
  if (!text) return ''
  return marked(text)
}

// 打开设置
const openSettings = () => {
  settingsVisible.value = true
}

// 滚动到指定区域
const scrollToSection = (sectionKey) => {
  activeOutline.value = sectionKey
  const element = document.getElementById(sectionKey)
  if (element && previewContent.value) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// 拖拽功能
const startDrag = (e) => {
  // 如果点击的是可交互元素（链接、按钮、输入框等），不拖动
  if (e.target.tagName === 'A' || 
      e.target.tagName === 'BUTTON' || 
      e.target.tagName === 'INPUT' || 
      e.target.tagName === 'TEXTAREA' ||
      e.target.closest('a, button, input, textarea')) {
    return
  }
  
  // 允许拖动整个简历预览卡片
  isDragging.value = true
  dragStart.value = {
    x: e.clientX - previewPosition.value.x,
    y: e.clientY - previewPosition.value.y
  }
  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDrag)
  e.preventDefault()
}

const handleDrag = (e) => {
  if (isDragging.value && resumePreview.value) {
    previewPosition.value = {
      x: e.clientX - dragStart.value.x,
      y: e.clientY - dragStart.value.y
    }
    resumePreview.value.style.transform = `translate(${previewPosition.value.x}px, ${previewPosition.value.y}px)`
  }
}

const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
}

// 导出PDF（使用浏览器打印功能）
const exportPDF = () => {
  if (!previewContent.value) return
  
  const printWindow = window.open('', '_blank')
  const printContent = previewContent.value.querySelector('.resume-preview').innerHTML
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>简历</title>
      <style>
        body {
          font-family: 'Microsoft YaHei', Arial, sans-serif;
          padding: 20px;
          color: #333;
        }
        .resume-preview {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          padding: ${resumeSettings.margin}px;
        }
        .personal-section {
          padding-bottom: 20px;
          margin-bottom: ${resumeSettings.sectionSpacing}px;
        }
        .personal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }
        .avatar-img {
          width: 100px;
          height: 100px;
          border-radius: 0;
          object-fit: cover;
        }
        .name {
          font-size: 28px;
          margin: 0 0 10px 0;
          color: ${resumeSettings.themeColor};
        }
        .contact-info, .basic-info {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
          font-size: 14px;
          color: #666;
        }
        .section-title {
          font-size: 20px;
          color: ${resumeSettings.themeColor};
          border-bottom: 2px solid ${resumeSettings.themeColor};
          padding-bottom: 5px;
          margin: ${resumeSettings.sectionSpacing}px 0 15px 0;
        }
        .section-item {
          margin-bottom: 20px;
        }
        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 5px;
        }
        .item-header h3 {
          margin: 0;
          font-size: 16px;
        }
        .item-period {
          color: #999;
          font-size: 14px;
        }
        .item-meta {
          color: #666;
          font-size: 14px;
          margin: 5px 0;
        }
        .item-content {
          line-height: ${resumeSettings.lineHeight};
          font-size: ${resumeSettings.fontSize}px;
        }
        @media print {
          body { padding: 0; }
          .resume-preview { padding: ${resumeSettings.margin}px; }
        }
      </style>
    </head>
    <body>
      ${printContent}
    </body>
    </html>
  `)
  
  printWindow.document.close()
  setTimeout(() => {
    printWindow.print()
  }, 250)
}

// 监听设置变化
watch(resumeSettings, () => {
  localStorage.setItem('resumeSettings', JSON.stringify(resumeSettings))
}, { deep: true })

onMounted(() => {
  initResumeData()
  const savedSettings = localStorage.getItem('resumeSettings')
  if (savedSettings) {
    try {
      Object.assign(resumeSettings, JSON.parse(savedSettings))
    } catch (e) {
      console.error('加载设置失败:', e)
    }
  }
})

// 组件卸载时清理事件监听器
onUnmounted(() => {
  stopDrag()
})
</script>

<style scoped>
.resume-builder-page {
  min-height: 100vh;
  background-color: #ffffff;
  padding-top: 80px;
  position: relative;
}

/* 背景透明化和紫色雾蒙 */
.resume-builder-page::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(149, 117, 181, 0.05);
  pointer-events: none;
}

.main-container {
  display: flex;
  height: calc(100vh - 80px);
  position: relative;
  z-index: 3;
  padding: 0 20px;
  gap: 20px;
}
/* .main-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(149, 117, 181, 0.05);
} */

.left-panel {
  width: 500px;
  background: white;
  overflow-y: auto;
  padding: 20px;
  border-right: 1px solid #e0e0e0;
}


.action-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.form-sections {
  margin-top: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-column {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.edu-item,
.project-item,
.work-item {
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  margin-bottom: 15px;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.avatar-uploader {
  width: 100px;
  height: 100px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-uploader:hover {
  border-color: #7d5196;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}


.right-panel {
  flex: 1;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eaf6 100%);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.preview-header {
  padding: 15px 20px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.preview-outline {
  position: absolute;
  left: 0;
  top: 60px;
  width: 150px;
  background: white;
  border-right: 1px solid #e0e0e0;
  padding: 20px 0;
  z-index: 10;
  height: calc(100% - 60px);
  overflow-y: auto;
}

.outline-item {
  padding: 12px 20px;
  cursor: pointer;
  color: #7f8c8d;
  transition: all 0.3s;
  border-left: 3px solid transparent;
}

.outline-item:hover {
  background: rgba(184, 160, 200, 0.1);
  color: #7d5196;
}

.outline-item.active {
  background: rgba(184, 160, 200, 0.1);
  color: rgb(48, 20, 97);
  font-weight: 700;
}

.preview-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  padding-left: 170px;
  display: flex;
  justify-content: center;
}

.resume-preview {
  width: 210mm;
  min-height: 297mm;
  background: white;
  padding: var(--margin, 40px);
  cursor: grab;
  user-select: none;
  position: relative;
  transition: transform 0.1s ease;

}

.resume-preview:active,
.resume-preview.dragging {
  cursor: grabbing;
}

.personal-section {
  padding-bottom: 20px;
  margin-bottom: var(--section-spacing, 30px);
}

.personal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.avatar-wrapper {
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
}

.avatar-container {
  flex-shrink: 0;
  width: 100px;
  height: 100px;
  border-radius: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(184, 160, 200, 0.1);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7f8c8d;
  font-size: 14px;
  background: rgba(184, 160, 200, 0.1);
}

.personal-info {
  flex: 1;
}

.name {
  font-size: 28px;
  margin: 0 0 10px 0;
  color: var(--theme-color, #7d5196);
}

.contact-info,
.basic-info {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  font-size: 14px;
  color: #666;
  margin-top: 8px;
}

.resume-section {
  margin-bottom: var(--section-spacing, 30px);
}

.section-title {
  font-size: 20px;
  color: var(--theme-color, #7d5196);
  border-bottom: 2px solid var(--theme-color, #7d5196);
  padding-bottom: 5px;
  margin: var(--section-spacing, 30px) 0 15px 0;
}

.section-item {
  margin-bottom: 20px;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.item-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.item-period {
  color: #999;
  font-size: 14px;
}

.item-meta {
  color: #666;
  font-size: 14px;
  margin: 5px 0;
}

.item-content {
  line-height: var(--line-height, 1.6);
  font-size: var(--font-size, 14px);
  color: #333;
}

.item-content :deep(p) {
  margin: 8px 0;
}

.item-content :deep(strong) {
  font-weight: 600;
}

.item-content :deep(ul),
.item-content :deep(ol) {
  margin: 8px 0;
  padding-left: 20px;
}

.item-content :deep(li) {
  margin: 4px 0;
}

/* Element Plus 组件样式覆盖 - 与成长记录页面一致 */
:deep(.el-button--primary) {
  background: #7d5196;
  border-color: #7d5196;
}

:deep(.el-button--primary:hover) {
  background: #b8a0c8;
  border-color: #b8a0c8;
  color: #fff;
}

/* 普通按钮hover样式 */
:deep(.el-button:not(.el-button--primary):not(.el-button--danger):hover) {
  background: rgba(184, 160, 200, 0.1);
  border-color: #b8a0c8;
  color: #b8a0c8;
}

/* 危险按钮hover样式 */
:deep(.el-button--danger:hover) {
  background: #b8a0c8;
  border-color: #b8a0c8;
  color: #fff;
}

/* 输入框focus样式 */
:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #b8a0c8 inset;
}

:deep(.el-input__inner:focus) {
  border-color: #b8a0c8;
}

/* 文本域focus样式 */
:deep(.el-textarea__inner:focus) {
  border-color: #b8a0c8;
  box-shadow: 0 0 0 1px #b8a0c8 inset;
}

/* 选择框focus样式 */
:deep(.el-select .el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 1px #b8a0c8 inset;
}

/* 日期选择器focus样式 */
:deep(.el-date-editor.is-active) {
  border-color: #b8a0c8;
}

:deep(.el-date-editor.is-active .el-input__wrapper) {
  box-shadow: 0 0 0 1px #b8a0c8 inset;
}

:deep(.el-dialog__header) {
  color: white;
  padding: 20px;
}

:deep(.el-dialog__title) {
  color: #7d5196;
  font-weight: 800;
}

:deep(.el-collapse-item__header) {
  color: #0b2a4a;
  font-weight: 600;
}

:deep(.el-form-item__label) {
  color: #7f8c8d;
}

/* 简历制作页面导航栏紫色下边框 */
:deep(.navbar) {
  border-bottom: 2px solid #7d5196;
}
</style>
