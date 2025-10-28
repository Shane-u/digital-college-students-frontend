# 数字大学生前端 - API接口集成说明

## 概述

本项目已成功集成了用户登录注册相关的API接口，使用axios进行HTTP请求封装，支持图形验证码、短信/邮箱验证码、用户登录和注册功能。

## 已实现的功能

### 1. API接口封装 (`src/api/userApi.js`)

- **获取图形验证码**: `GET /user/captcha`
- **发送验证码**: `POST /user/sendCode` (支持手机号和邮箱)
- **账号密码登录**: `POST /user/login/account`
- **验证码登录**: `POST /user/login/code`
- **用户注册**: `POST /user/register`
- **用户登录**: `POST /user/login`
- **用户注销**: `POST /user/logout`
- **获取当前用户**: `GET /user/get/login`

### 2. 登录页面功能 (`src/views/LoginPage.vue`)

#### 登录方式
- **密码登录**: 账号/密码 + 图形验证码
- **验证码登录**: 手机号/邮箱 + 图形验证码 + 短信/邮箱验证码

#### 注册功能
- 手机号/邮箱 (必选其一)
- 密码 + 确认密码
- 图形验证码 (防机器人)
- 短信/邮箱验证码

#### 忘记密码
- 手机号/邮箱
- 图形验证码
- 新密码 + 确认密码

### 3. 测试页面 (`src/views/TestPage.vue`)

访问 `/test` 路由可以测试所有API接口功能。

## 技术实现

### 依赖包
- `axios`: HTTP请求库
- `element-plus`: UI组件库 (已安装但未使用，使用原生alert替代)

### 核心文件
- `src/api/userApi.js`: API接口封装
- `src/views/LoginPage.vue`: 登录注册页面
- `src/views/TestPage.vue`: API测试页面

### 接口配置
- 基础URL: `http://172.27.66.37:8121/api`
- 请求超时: 10秒
- 支持请求/响应拦截器

## 使用说明

### 1. 启动项目
```bash
npm run dev
```

### 2. 访问页面
- 登录页面: `http://localhost:3000/login`
- 测试页面: `http://localhost:3000/test`
- 首页: `http://localhost:3000/home`

### 3. 测试API接口
1. 访问测试页面 `/test`
2. 点击"获取验证码"测试图形验证码接口
3. 输入手机号/邮箱测试发送验证码接口
4. 测试登录和注册功能

## 接口参数说明

### 获取图形验证码
- **接口**: `GET /user/captcha`
- **返回**: 验证码图片数据 (base64或URL)

### 发送验证码
- **接口**: `POST /user/sendCode`
- **参数**: `account` (手机号或邮箱)
- **后端逻辑**: 自动判断是手机号还是邮箱，分别发送短信或邮件

### 用户注册
- **接口**: `POST /user/register`
- **参数**:
  - `userAccount`: 用户账号 (手机号或邮箱)
  - `userPassword`: 密码
  - `checkPassword`: 确认密码
  - `code`: 短信/邮箱验证码
  - `captcha`: 图形验证码

### 用户登录
- **密码登录**: `POST /user/login/account`
  - `account`: 账号
  - `password`: 密码
  - `captcha`: 图形验证码

- **验证码登录**: `POST /user/login/code`
  - `account`: 手机号/邮箱
  - `code`: 短信/邮箱验证码
  - `captcha`: 图形验证码

## 注意事项

1. **图形验证码**: 使用hutools生成，每次获取都会生成新的验证码
2. **验证码发送**: 后端会根据输入自动判断是手机号还是邮箱
3. **错误处理**: 所有API调用都有完整的错误处理机制
4. **用户体验**: 使用alert进行消息提示，可根据需要替换为更优雅的UI组件

## 后续优化建议

1. 替换alert为更优雅的消息提示组件
2. 添加loading状态指示器
3. 实现token自动刷新机制
4. 添加请求重试机制
5. 完善错误码处理

## 文件结构

```
src/
├── api/
│   ├── userApi.js          # 用户相关API接口
│   └── testApi.js          # API测试脚本
├── views/
│   ├── LoginPage.vue       # 登录注册页面
│   └── TestPage.vue        # API测试页面
└── router/
    └── index.js            # 路由配置
```

## 开发环境

- Node.js: 推荐 16.x 或更高版本
- Vue 3 + Vite
- 后端API: `http://172.27.66.37:8121/api`

## 联系方式

如有问题，请检查控制台错误信息或联系开发团队。

