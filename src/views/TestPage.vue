<template>
  <div class="test-page">
    <h1>API接口测试页面</h1>
    
    <div class="test-section">
      <h2>1. 测试获取图形验证码</h2>
      <button @click="testGetCaptcha" :disabled="loading">获取验证码</button>
      <div v-if="captchaImage" class="captcha-display">
        <img :src="captchaImage" alt="验证码" />
      </div>
    </div>

    <div class="test-section">
      <h2>2. 测试发送验证码</h2>
      <input v-model="testAccount" placeholder="输入手机号或邮箱" />
      <button @click="testSendCode" :disabled="loading">发送验证码</button>
      <p v-if="sendCodeResult">{{ sendCodeResult }}</p>
    </div>

    <div class="test-section">
      <h2>3. 测试登录</h2>
      <input v-model="loginAccount" placeholder="账号" />
      <input v-model="loginPassword" type="password" placeholder="密码" />
      <input v-model="loginCaptcha" placeholder="验证码" />
      <button @click="testLogin" :disabled="loading">测试登录</button>
      <p v-if="loginResult">{{ loginResult }}</p>
    </div>

    <div class="test-section">
      <h2>4. 测试注册</h2>
      <input v-model="registerAccount" placeholder="账号" />
      <input v-model="registerPassword" type="password" placeholder="密码" />
      <input v-model="registerConfirmPassword" type="password" placeholder="确认密码" />
      <input v-model="registerCode" placeholder="验证码" />
      <input v-model="registerCaptcha" placeholder="图形验证码" />
      <button @click="testRegister" :disabled="loading">测试注册</button>
      <p v-if="registerResult">{{ registerResult }}</p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { userApi } from '../api/userApi'

export default {
  name: 'TestPage',
  setup() {
    const loading = ref(false)
    const captchaImage = ref('')
    const testAccount = ref('')
    const sendCodeResult = ref('')
    const loginAccount = ref('')
    const loginPassword = ref('')
    const loginCaptcha = ref('')
    const loginResult = ref('')
    const registerAccount = ref('')
    const registerPassword = ref('')
    const registerConfirmPassword = ref('')
    const registerCode = ref('')
    const registerCaptcha = ref('')
    const registerResult = ref('')

    const testGetCaptcha = async () => {
      loading.value = true
      try {
        const response = await userApi.getCaptcha()
        console.log('验证码响应:', response)
        if (response.data) {
          captchaImage.value = `data:image/png;base64,${response.data}`
        } else {
          captchaImage.value = response.data
        }
        alert('获取验证码成功')
      } catch (error) {
        console.error('获取验证码失败:', error)
        alert('获取验证码失败: ' + error.message)
      } finally {
        loading.value = false
      }
    }

    const testSendCode = async () => {
      if (!testAccount.value) {
        alert('请输入手机号或邮箱')
        return
      }
      loading.value = true
      try {
        const response = await userApi.sendCode(testAccount.value)
        console.log('发送验证码响应:', response)
        sendCodeResult.value = `发送成功: ${JSON.stringify(response)}`
        alert('发送验证码成功')
      } catch (error) {
        console.error('发送验证码失败:', error)
        sendCodeResult.value = `发送失败: ${error.message}`
        alert('发送验证码失败: ' + error.message)
      } finally {
        loading.value = false
      }
    }

    const testLogin = async () => {
      if (!loginAccount.value || !loginPassword.value) {
        alert('请输入账号和密码')
        return
      }
      loading.value = true
      try {
        const response = await userApi.loginByPassword({
          account: loginAccount.value,
          password: loginPassword.value,
          captcha: loginCaptcha.value
        })
        console.log('登录响应:', response)
        loginResult.value = `登录结果: ${JSON.stringify(response)}`
        alert('登录测试完成')
      } catch (error) {
        console.error('登录失败:', error)
        loginResult.value = `登录失败: ${error.message}`
        alert('登录失败: ' + error.message)
      } finally {
        loading.value = false
      }
    }

    const testRegister = async () => {
      if (!registerAccount.value || !registerPassword.value || !registerConfirmPassword.value) {
        alert('请填写完整信息')
        return
      }
      if (registerPassword.value !== registerConfirmPassword.value) {
        alert('两次密码不一致')
        return
      }
      loading.value = true
      try {
        const response = await userApi.register({
          userAccount: registerAccount.value,
          userPassword: registerPassword.value,
          checkPassword: registerConfirmPassword.value,
          code: registerCode.value,
          captcha: registerCaptcha.value
        })
        console.log('注册响应:', response)
        registerResult.value = `注册结果: ${JSON.stringify(response)}`
        alert('注册测试完成')
      } catch (error) {
        console.error('注册失败:', error)
        registerResult.value = `注册失败: ${error.message}`
        alert('注册失败: ' + error.message)
      } finally {
        loading.value = false
      }
    }

    return {
      loading,
      captchaImage,
      testAccount,
      sendCodeResult,
      loginAccount,
      loginPassword,
      loginCaptcha,
      loginResult,
      registerAccount,
      registerPassword,
      registerConfirmPassword,
      registerCode,
      registerCaptcha,
      registerResult,
      testGetCaptcha,
      testSendCode,
      testLogin,
      testRegister
    }
  }
}
</script>

<style scoped>
.test-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.test-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.test-section h2 {
  margin-top: 0;
  color: #333;
}

.test-section input {
  display: block;
  width: 100%;
  margin: 10px 0;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.test-section button {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin: 5px;
}

.test-section button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.captcha-display {
  margin-top: 10px;
}

.captcha-display img {
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>

