// 测试API接口的简单脚本
import { userApi } from './userApi.js'

// 测试函数
export const testUserApi = async () => {
  try {
    console.log('开始测试用户API接口...')
    
    // 测试获取图形验证码
    console.log('1. 测试获取图形验证码...')
    const captchaResponse = await userApi.getCaptcha()
    console.log('验证码响应:', captchaResponse)
    
    // 测试发送验证码
    console.log('2. 测试发送验证码...')
    const sendCodeResponse = await userApi.sendCode('1554096735@qq.com')
    console.log('发送验证码响应:', sendCodeResponse)
    
    console.log('API测试完成')
  } catch (error) {
    console.error('API测试失败:', error)
  }
}

// 如果直接运行此文件，则执行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  testUserApi()
}

