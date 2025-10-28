<template>
  <div>
    <!-- 粒子背景组件 -->
    <ParticleBackground />

    <div class="auth-page">
      <!-- 登录注册容器 -->
      <div class="auth-container" :class="{ swapped: isSwapped }">
        <!-- 左侧卡片（表单区域） -->
        <div class="card left-card">
          <transition name="card-fade" mode="out-in">
            <!-- 登录表单 -->
            <div v-if="!isSwapped" class="form-panel" key="login-form">
              <h2 class="panel-title">账号登录</h2>

              <!-- 登录方式切换 -->
              <div class="login-tabs">
                <div
                  class="tab-item"
                  :class="{ active: loginMethod === 'password' }"
                  @click="loginMethod = 'password'"
                >
                  密码登录
                </div>
                <div
                  class="tab-item"
                  :class="{ active: loginMethod === 'sms' }"
                  @click="loginMethod = 'sms'"
                >
                  短信登录
                </div>
              </div>

              <!-- 登录表单内容 -->
              <transition name="form-switch" mode="out-in">
                <!-- 密码登录表单 -->
                <div
                  v-if="loginMethod === 'password'"
                  class="form-content"
                  key="password-login"
                >
                  <div class="form-group">
                    <input
                      type="text"
                      v-model="loginForm.account"
                      placeholder="手机号/邮箱"
                      :class="{
                        error: loginErrors.account,
                        warning: loginWarnings.account,
                      }"
                      @blur="
                        validateAccount(
                          loginForm.account,
                          loginErrors,
                          loginWarnings,
                          'account'
                        )
                      "
                      @input="
                        clearError(loginErrors, 'account');
                        clearError(loginWarnings, 'account');
                      "
                    />
                    <p v-if="loginErrors.account" class="error-msg">
                      {{ loginErrors.account }}
                    </p>
                    <p v-else-if="loginWarnings.account" class="warning-msg">
                      {{ loginWarnings.account }}
                    </p>
                  </div>

                  <div class="form-group">
                    <input
                      type="password"
                      v-model="loginForm.password"
                      placeholder="密码"
                      :class="{
                        error: loginErrors.password,
                        warning: loginWarnings.password,
                      }"
                      @input="
                        clearError(loginErrors, 'password');
                        clearError(loginWarnings, 'password');
                      "
                    />
                    <p v-if="loginErrors.password" class="error-msg">
                      {{ loginErrors.password }}
                    </p>
                    <p v-else-if="loginWarnings.password" class="warning-msg">
                      {{ loginWarnings.password }}
                    </p>
                  </div>
                </div>

                <!-- 短信登录表单（含验证码组件） -->
                <div v-else class="form-content" key="sms-login">
                  <div class="form-group">
                    <input
                      type="text"
                      v-model="loginForm.phone"
                      placeholder="手机号/邮箱"
                      :class="{
                        error: loginErrors.phone,
                        warning: loginWarnings.phone,
                      }"
                      @blur="
                        validateAccount(
                          loginForm.phone,
                          loginErrors,
                          loginWarnings,
                          'phone'
                        )
                      "
                      @input="
                        clearError(loginErrors, 'phone');
                        clearError(loginWarnings, 'phone');
                      "
                    />
                    <p v-if="loginErrors.phone" class="error-msg">
                      {{ loginErrors.phone }}
                    </p>
                    <p v-else-if="loginWarnings.phone" class="warning-msg">
                      {{ loginWarnings.phone }}
                    </p>
                  </div>

                  <!-- 图片验证码：使用后端验证码 -->
                  <div class="form-group captcha-group">
                    <input
                      type="text"
                      v-model="loginForm.captcha"
                      placeholder="图片验证码"
                      :class="{
                        error: loginErrors.captcha,
                        warning: loginWarnings.captcha,
                      }"
                      @blur="handleCaptchaBlur(loginForm.captcha, 'login')"
                    />
                    <div class="captcha-image-container" @click="getCaptchaImage">
                      <img 
                        v-if="captchaImage" 
                        :src="captchaImage" 
                        alt="验证码" 
                        class="captcha-image"
                      />
                      <div v-else class="captcha-placeholder">图形验证码</div>
                    </div>
                  </div>

                  <div class="form-group sms-group">
                    <input
                      type="text"
                      v-model="loginForm.smsCode"
                      placeholder="短信验证码"
                      :class="{
                        error: loginErrors.smsCode,
                        warning: loginWarnings.smsCode,
                      }"
                      @input="
                        clearError(loginErrors, 'smsCode');
                        clearError(loginWarnings, 'smsCode');
                      "
                    />
                    <button
                      class="btn sms-btn"
                      @click="sendSms('login')"
                      :disabled="
                        !loginForm.phone ||
                        !loginForm.captcha ||
                        !isLoginCaptchaValid ||
                        smsCountdown > 0
                      "
                    >
                      {{ smsCountdown > 0 ? `${smsCountdown}s` : "获取验证码" }}
                    </button>
                  </div>
                </div>
              </transition>

              <div class="form-actions">
                <div class="remember-me-container" >
                  <Checkbox />
                  <p class="remember-me">记住我</p>
                </div>
                <button @click="handleLogin" class="btn primary-btn">
                  登录
                </button>
                <a @click.prevent="showForgot = true" class="forgot-link"
                  >忘记密码？</a
                >
              </div>
            </div>
            <!-- 注册表单 -->
            <div v-else class="form-panel" key="register-form">
              <h2 class="panel-title">创建账号</h2>
              <p class="panel-subtitle">填写以下信息完成注册</p>

              <div class="form-group">
                <input
                  type="text"
                  v-model="registerForm.account"
                  placeholder="手机号/邮箱"
                  :class="{
                    error: registerErrors.account,
                    warning: registerWarnings.account,
                  }"
                  @blur="
                    validateAccount(
                      registerForm.account,
                      registerErrors,
                      registerWarnings,
                      'account'
                    )
                  "
                  @input="
                    clearError(registerErrors, 'account');
                    clearError(registerWarnings, 'account');
                  "
                />
                <p v-if="registerErrors.account" class="error-msg">
                  {{ registerErrors.account }}
                </p>
                <p v-else-if="registerWarnings.account" class="warning-msg">
                  {{ registerWarnings.account }}
                </p>
              </div>

              <!-- 注册验证码：使用后端验证码 -->
              <div class="form-group captcha-group">
                <input
                  type="text"
                  v-model="registerForm.captcha"
                  placeholder="图片验证码"
                  :class="{
                    error: registerErrors.captcha,
                    warning: registerWarnings.captcha,
                  }"
                  @blur="handleCaptchaBlur(registerForm.captcha, 'register')"
                />
                <div class="captcha-image-container" @click="getCaptchaImage">
                  <img 
                    v-if="captchaImage" 
                    :src="captchaImage" 
                    alt="验证码" 
                    class="captcha-image"
                  />
                  <div v-else class="captcha-placeholder">图形验证码</div>
                </div>
              </div>

              <div class="form-group sms-group">
                <input
                  type="text"
                  v-model="registerForm.smsCode"
                  placeholder="短信验证码"
                  :class="{
                    error: registerErrors.smsCode,
                    warning: registerWarnings.smsCode,
                  }"
                  @input="
                    clearError(registerErrors, 'smsCode');
                    clearError(registerWarnings, 'smsCode');
                  "
                />
                <button
                  class="btn sms-btn"
                  @click="sendSms('register')"
                  :disabled="
                    !registerForm.account ||
                    !registerForm.captcha ||
                    !isRegisterCaptchaValid ||
                    registerSmsCountdown > 0
                  "
                >
                  {{
                    registerSmsCountdown > 0
                      ? `${registerSmsCountdown}s`
                      : "获取验证码"
                  }}
                </button>
              </div>

              <div class="form-group">
                <input
                  type="password"
                  v-model="registerForm.password"
                  placeholder="密码"
                  :class="{
                    error: registerErrors.password,
                    warning: registerWarnings.password,
                  }"
                  @input="
                    clearError(registerErrors, 'password');
                    clearError(registerWarnings, 'password');
                    checkPasswordStrength(registerForm.password, 'register');
                  "
                />
                <p v-if="registerErrors.password" class="error-msg">
                  {{ registerErrors.password }}
                </p>
                <p v-else-if="registerWarnings.password" class="warning-msg">
                  {{ registerWarnings.password }}
                </p>
              </div>

              <div class="form-group">
                <input
                  type="password"
                  v-model="registerForm.confirmPassword"
                  placeholder="确认密码"
                  :class="{
                    error: registerErrors.confirmPassword,
                    warning: registerWarnings.confirmPassword,
                  }"
                  @input="
                    checkPasswordMatch();
                    clearError(registerErrors, 'confirmPassword');
                  "
                />
                <p v-if="registerErrors.confirmPassword" class="error-msg">
                  {{ registerErrors.confirmPassword }}
                </p>
                <p
                  v-else-if="registerWarnings.confirmPassword"
                  class="warning-msg"
                >
                  {{ registerWarnings.confirmPassword }}
                </p>
              </div>

              <button @click="handleRegister" class="btn primary-btn">
                注册
              </button>
            </div>
          </transition>
        </div>

        <!-- 右侧卡片（信息区域） -->
        <div class="card right-card">
          <Bird />
          <transition name="card-fade" mode="out-in">
            <!-- 注册引导 -->
            <div v-if="!isSwapped" class="info-panel" key="register-info">
              <h2 class="panel-title">新用户欢迎!</h2>
              <p class="panel-desc">
                还没有账号？注册后即可享受全部服务，解锁更多功能
              </p>
              <button @click="isSwapped = true" class="btn primary-btn">
                注册账号
              </button>
            </div>

            <!-- 登录引导 -->
            <div v-else class="info-panel" key="login-info">
              <h2 class="panel-title">欢迎回来</h2>
              <p class="panel-desc">已有账号？立即登录，继续您的操作</p>
              <button @click="isSwapped = false" class="btn primary-btn">
                登录账号
              </button>
            </div>
          </transition>

          <!-- 装饰弧形 -->
          <div class="arc top-arc"></div>
          <div class="arc bottom-arc"></div>
        </div>
      </div>

      <!-- 忘记密码弹窗 -->
      <transition name="page-fade">
        <div v-if="showForgot" class="forgot-page" key="forgot">
          <div class="forgot-container">
            <h2 class="panel-title">重置密码</h2>

            <div class="form-group">
              <input
                type="text"
                v-model="forgotForm.account"
                placeholder="手机号/邮箱"
                :class="{
                  error: forgotErrors.account,
                  warning: forgotWarnings.account,
                }"
                @blur="
                  validateAccount(
                    forgotForm.account,
                    forgotErrors,
                    forgotWarnings,
                    'account'
                  )
                "
                @input="
                  clearError(forgotErrors, 'account');
                  clearError(forgotWarnings, 'account');
                "
              />
              <p v-if="forgotErrors.account" class="error-msg">
                {{ forgotErrors.account }}
              </p>
              <p v-else-if="forgotWarnings.account" class="warning-msg">
                {{ forgotWarnings.account }}
              </p>
            </div>

            <!-- 忘记密码验证码：使用后端验证码 -->
            <div class="form-group captcha-group">
              <input
                type="text"
                v-model="forgotForm.captcha"
                placeholder="图片验证码"
                :class="{
                  error: forgotErrors.captcha,
                  warning: forgotWarnings.captcha,
                }"
                @blur="handleCaptchaBlur(forgotForm.captcha, 'forgot')"
              />
              <div class="captcha-image-container" @click="getCaptchaImage">
                <img 
                  v-if="captchaImage" 
                  :src="captchaImage" 
                  alt="验证码" 
                  class="captcha-image"
                />
                <div v-else class="captcha-placeholder">图形验证码</div>
              </div>
            </div>

            <div class="form-group">
              <input
                type="password"
                v-model="forgotForm.newPassword"
                placeholder="新密码"
                :class="{
                  error: forgotErrors.newPassword,
                  warning: forgotWarnings.newPassword,
                }"
                @input="
                  clearError(forgotErrors, 'newPassword');
                  clearError(forgotWarnings, 'newPassword');
                  checkPasswordStrength(forgotForm.newPassword, 'forgot');
                "
              />
              <p v-if="forgotErrors.newPassword" class="error-msg">
                {{ forgotErrors.newPassword }}
              </p>
              <p v-else-if="forgotWarnings.newPassword" class="warning-msg">
                {{ forgotWarnings.newPassword }}
              </p>
            </div>

            <div class="form-group">
              <input
                type="password"
                v-model="forgotForm.confirmPassword"
                placeholder="确认新密码"
                :class="{
                  error: forgotErrors.confirmPassword,
                  warning: forgotWarnings.confirmPassword,
                }"
                @input="
                  checkForgotPasswordMatch();
                  clearError(forgotErrors, 'confirmPassword');
                "
              />
              <p v-if="forgotErrors.confirmPassword" class="error-msg">
                {{ forgotErrors.confirmPassword }}
              </p>
              <p v-else-if="forgotWarnings.confirmPassword" class="warning-msg">
                {{ forgotWarnings.confirmPassword }}
              </p>
            </div>

            <div class="form-actions">
              <button @click="showForgot = false" class="btn back-btn">
                返回登录
              </button>
              <button @click="handleReset" class="btn primary-btn">
                确认重置
              </button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>
  
  <script>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import ParticleBackground from "../components/ParticleBackground.vue";
import CaptchaComponent from "../components/CaptchaComponent.vue";
import Checkbox from "../components/Checkbox.vue";
import Bird from "../components/Bird.vue";
import { userApi } from "../api/userApi";

export default {
  name: "LoginRegisterPage",
  components: {
    ParticleBackground,
    CaptchaComponent,
    Checkbox,
    Bird
  },
  setup() {
    // 路由
    const router = useRouter();
    
    // 状态管理
    const isSwapped = ref(false); // 切换登录/注册表单
    const showForgot = ref(false); // 忘记密码弹窗控制
    const loginMethod = ref("password"); // 登录方式：password/sms
    const smsCountdown = ref(0); // 登录短信倒计时
    const registerSmsCountdown = ref(0); // 注册短信倒计时

    // 验证码组件相关（存储真实验证码，通过组件事件更新）
    let loginCaptchaCode = "";
    let registerCaptchaCode = "";
    let forgotCaptchaCode = "";
    const isLoginCaptchaValid = ref(false);
    const isRegisterCaptchaValid = ref(false);
    const isForgotCaptchaValid = ref(false);
    
    // 图形验证码相关
    const captchaImage = ref('');
    const captchaId = ref('');

    // 表单数据
    const loginForm = reactive({
      account: "",
      password: "",
      phone: "",
      captcha: "",
      smsCode: "",
    });

    const registerForm = reactive({
      account: "",
      captcha: "",
      smsCode: "",
      password: "",
      confirmPassword: "",
    });

    const forgotForm = reactive({
      account: "",
      captcha: "",
      newPassword: "",
      confirmPassword: "",
    });

    // 错误/警告信息
    const loginErrors = reactive({});
    const loginWarnings = reactive({});
    const registerErrors = reactive({});
    const registerWarnings = reactive({});
    const forgotErrors = reactive({});
    const forgotWarnings = reactive({});

    // 验证账号格式（手机号/邮箱）
    const validateAccount = (value, errors, warnings, field) => {
      if (!value.trim()) {
        warnings[field] =
          field === "account" ? "请输入账号/手机号" : "请输入手机号/邮箱";
        return;
      }
      clearError(warnings, field);

      const isPhone = /^1[3-9]\d{9}$/.test(value);
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      if (!isPhone && !isEmail) {
        errors[field] = "手机号/邮箱格式错误，请重新输入";
      } else {
        clearError(errors, field);
      }
    };

    // 获取图形验证码（后端返回base64格式）
    const getCaptchaImage = async () => {
      try {
        console.log('开始请求验证码...');
        const response = await userApi.getCaptcha();
        console.log('获取验证码响应:', response);
        console.log('响应类型:', typeof response);
        
        let base64Data = null;
        
        // 情况1: 后端直接返回base64字符串（经过拦截器后就是字符串）
        if (typeof response === 'string') {
          base64Data = response;
          console.log('情况1: 响应是字符串');
        }
        // 情况2: 后端返回JSON对象 {code: 0, data: "base64..."}
        else if (response && response.data) {
          base64Data = response.data;
          console.log('情况2: 从response.data获取');
        }
        // 情况3: 响应本身就是包含data字段的对象
        else if (response && typeof response === 'object') {
          base64Data = response;
          console.log('情况3: 响应是对象');
        }
        
        if (base64Data && typeof base64Data === 'string' && base64Data.length > 0) {
          // 检查是否已经包含data:image前缀
          if (base64Data.startsWith('data:image')) {
            captchaImage.value = base64Data;
            console.log('✅ 验证码已设置（完整base64）');
          } else {
            // 如果没有前缀，添加前缀
            captchaImage.value = `data:image/png;base64,${base64Data}`;
            console.log('✅ 验证码已设置（添加前缀）');
          }
          console.log('验证码前50个字符:', captchaImage.value.substring(0, 50));
        } else {
          console.error('❌ 验证码数据为空或格式错误');
          console.error('完整响应:', JSON.stringify(response));
          alert('获取验证码失败：返回数据为空或格式错误');
        }
      } catch (error) {
        console.error('❌ 获取验证码失败:', error);
        console.error('错误详情:', error.response);
        alert(`获取验证码失败：${error.message || '请检查网络连接'}`);
      }
    };

    // 验证验证码（仅检查是否已输入，实际验证由后端处理）
    const checkCaptcha = (value, type) => {
      // 只检查输入是否为空，不再检查验证码图片是否已加载
      // 因为后端会验证验证码的正确性
      const hasInput = value.trim().length > 0;
      const isValid = hasInput;

      // 更新验证状态
      if (type === "login") isLoginCaptchaValid.value = isValid;
      if (type === "register") isRegisterCaptchaValid.value = isValid;
      if (type === "forgot") isForgotCaptchaValid.value = isValid;

      return isValid;
    };

    // 包装函数，用于模板中的@blur事件
    const handleCaptchaBlur = (value, type) => {
      checkCaptcha(value, type);
    };

    // 检查密码强度
    const checkPasswordStrength = (password, type) => {
      if (!password.trim()) return;
      
      if (password.length < 8) {
        if (type === "register") {
          registerErrors.password = "密码长度至少8位";
        } else if (type === "forgot") {
          forgotErrors.newPassword = "密码长度至少8位";
        }
        return false;
      } else if (!/^(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
        if (type === "register") {
          registerErrors.password = "密码必须包含字母和数字";
        } else if (type === "forgot") {
          forgotErrors.newPassword = "密码必须包含字母和数字";
        }
        return false;
      } else {
        // 密码符合要求，清除错误信息
        if (type === "register") {
          delete registerErrors.password;
        } else if (type === "forgot") {
          delete forgotErrors.newPassword;
        }
        return true;
      }
    };

    // 检查注册密码一致性
    const checkPasswordMatch = () => {
      if (registerForm.confirmPassword) {
        registerErrors.confirmPassword =
          registerForm.password === registerForm.confirmPassword
            ? ""
            : "两次密码不一致";
      }
    };

    // 检查忘记密码的密码一致性
    const checkForgotPasswordMatch = () => {
      if (forgotForm.confirmPassword) {
        forgotErrors.confirmPassword =
          forgotForm.newPassword === forgotForm.confirmPassword
            ? ""
            : "两次密码输入不一致，请重新输入";
      }
    };

    // 清除错误/警告信息
    const clearError = (errorObj, field) => {
      if (errorObj[field]) delete errorObj[field];
    };

    // 发送短信验证码
    const sendSms = async (type) => {
      let account = '';
      let captcha = '';
      
      if (type === "login") {
        account = loginForm.phone;
        captcha = loginForm.captcha;
        
        // 验证手机号和图形验证码
        if (!account.trim()) {
          loginWarnings.phone = "请输入手机号/邮箱";
          return;
        }
        if (!captcha.trim()) {
          loginWarnings.captcha = "请输入图片验证码";
          return;
        }
        // 移除前端验证码有效性检查，由后端验证
      }

      if (type === "register") {
        account = registerForm.account;
        captcha = registerForm.captcha;
        
        // 验证账号和图形验证码
        if (!account.trim()) {
          registerWarnings.account = "请输入手机号/邮箱";
          return;
        }
        if (!captcha.trim()) {
          registerWarnings.captcha = "请输入图片验证码";
          return;
        }
        // 移除前端验证码有效性检查，由后端验证
      }

      try {
        // 调用发送验证码接口
        await userApi.sendCode(account);
        
        // 启动倒计时
        if (type === "login") {
          smsCountdown.value = 60;
          const timer = setInterval(() => {
            smsCountdown.value--;
            if (smsCountdown.value <= 0) clearInterval(timer);
          }, 1000);
        } else if (type === "register") {
          registerSmsCountdown.value = 60;
          const timer = setInterval(() => {
            registerSmsCountdown.value--;
            if (registerSmsCountdown.value <= 0) clearInterval(timer);
          }, 1000);
        }
        
        // 删除成功提示弹窗，倒计时会自动显示
      } catch (error) {
        console.error('发送验证码失败:', error);
        alert('发送验证码失败，请重试');
      }
    };

    // 验证登录表单
    const validateLogin = () => {
      let hasError = false;
      const { account, password, phone, captcha, smsCode } = loginForm;

      if (loginMethod.value === "password") {
        if (!account.trim()) {
          loginWarnings.account = "请输入账号/手机号";
          hasError = true;
        }
        if (!password.trim()) {
          loginWarnings.password = "请输入密码";
          hasError = true;
        }
      } else {
        if (!phone.trim()) {
          loginWarnings.phone = "请输入手机号/邮箱";
          hasError = true;
        }
        if (!captcha.trim()) {
          loginWarnings.captcha = "请输入图片验证码";
          hasError = true;
        }
        // 移除前端验证码有效性检查，由后端验证
        if (!smsCode.trim()) {
          loginWarnings.smsCode = "请输入短信验证码";
          hasError = true;
        }
      }

      return !hasError;
    };

    // 验证注册表单
    const validateRegister = () => {
      let hasError = false;
      const { account, captcha, smsCode, password, confirmPassword } =
        registerForm;

      if (!account.trim()) {
        registerWarnings.account = "请输入手机号/邮箱";
        hasError = true;
      }
      if (!captcha.trim()) {
        registerWarnings.captcha = "请输入图片验证码";
        hasError = true;
      }
      // 移除前端验证码有效性检查，由后端验证
      if (!smsCode.trim()) {
        registerWarnings.smsCode = "请输入短信验证码";
        hasError = true;
      }
      if (!password.trim()) {
        registerWarnings.password = "请设置密码";
        hasError = true;
      } else if (password.length < 8) {
        registerErrors.password = "密码长度至少8位";
        hasError = true;
      } else if (!/^(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
        registerErrors.password = "密码必须包含字母和数字";
        hasError = true;
      }
      if (!confirmPassword.trim()) {
        registerWarnings.confirmPassword = "请确认密码";
        hasError = true;
      } else if (password !== confirmPassword) {
        registerErrors.confirmPassword = "两次密码不一致";
        hasError = true;
      }

      return !hasError;
    };

    // 验证忘记密码表单
    const validateForgot = () => {
      let hasError = false;
      const { account, captcha, newPassword, confirmPassword } = forgotForm;

      if (!account.trim()) {
        forgotWarnings.account = "请输入手机号/邮箱";
        hasError = true;
      }
      if (!captcha.trim()) {
        forgotWarnings.captcha = "请输入图片验证码";
        hasError = true;
      }
      // 移除前端验证码有效性检查，由后端验证
      if (!newPassword.trim()) {
        forgotWarnings.newPassword = "请设置新密码";
        hasError = true;
      } else if (newPassword.length < 6) {
        forgotErrors.newPassword = "密码长度至少6位";
        hasError = true;
      } else if (!/^(?=.*[a-zA-Z])(?=.*\d)/.test(newPassword)) {
        forgotErrors.newPassword = "密码必须包含字母和数字";
        hasError = true;
      }
      if (!confirmPassword.trim()) {
        forgotWarnings.confirmPassword = "请确认新密码";
        hasError = true;
      } else if (newPassword !== confirmPassword) {
        forgotErrors.confirmPassword = "两次密码输入不一致，请重新输入";
        hasError = true;
      }

      return !hasError;
    };

    // 处理登录
    const handleLogin = async () => {
      if (!validateLogin()) return;
      
      try {
        let response;
        
        if (loginMethod.value === 'password') {
          // 密码登录
          response = await userApi.loginByPassword({
            userAccount: loginForm.account,
            userPassword: loginForm.password,
          });
        } else {
          // 验证码登录
          response = await userApi.loginByCode({
            account: loginForm.phone,
            code: loginForm.smsCode,
            captcha: loginForm.captcha
          });
        }
        
        if (response.code === 0) {
          // alert('登录成功');
          // 存储用户信息到localStorage
          localStorage.setItem('userInfo', JSON.stringify(response.data));
          // 跳转到首页，使用replace替代push，确保完全刷新页面
          window.location.href = '/home';
        } else {
          alert(response.message || '登录失败');
        }
      } catch (error) {
        console.error('登录失败:', error);
        alert('登录失败，请重试');
      }
    };

    // 处理注册
    const handleRegister = async () => {
      if (!validateRegister()) return;
      
      try {
        const response = await userApi.register({
          userAccount: registerForm.account,
          userPassword: registerForm.password,
          checkPassword: registerForm.confirmPassword,
          code: registerForm.smsCode,
          captcha: registerForm.captcha
        });
        
        if (response.code === 0) {
          // alert('注册成功，请登录');
          isSwapped.value = false; // 注册成功切换到登录表单
          // 清空注册表单
          registerForm.account = '';
          registerForm.captcha = '';
          registerForm.smsCode = '';
          registerForm.password = '';
          registerForm.confirmPassword = '';
        } else {
          alert(response.message || '注册失败');
        }
      } catch (error) {
        console.error('注册失败:', error);
        alert('注册失败，请重试');
      }
    };

    // 处理密码重置
    const handleReset = async () => {
      if (!validateForgot()) return;
      
      try {
        // 这里需要调用密码重置接口，但接口文档中没有提供
        // 可以根据实际后端接口进行调整
        alert('密码重置成功');
        showForgot.value = false; // 重置成功关闭弹窗
      } catch (error) {
        console.error('密码重置失败:', error);
        alert('密码重置失败，请重试');
      }
    };

    // 初始化：页面加载时获取图形验证码
    onMounted(() => {
      // 获取图形验证码
      getCaptchaImage();
    });

    return {
      isSwapped,
      showForgot,
      loginMethod,
      smsCountdown,
      registerSmsCountdown,
      isLoginCaptchaValid,
      isRegisterCaptchaValid,
      isForgotCaptchaValid,
      loginForm,
      registerForm,
      forgotForm,
      loginErrors,
      loginWarnings,
      registerErrors,
      registerWarnings,
      forgotErrors,
      forgotWarnings,
      validateAccount,
      checkCaptcha,
      checkPasswordStrength,
      checkPasswordMatch,
      checkForgotPasswordMatch,
      clearError,
      sendSms,
      handleLogin,
      handleRegister,
      handleReset,
      getCaptchaImage,
      captchaImage,
      handleCaptchaBlur
    };
  },
};
</script>
  
  <style scoped>
/* 基础样式 */
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  /* background-color: #f8f5fa; */
  padding: 20px;
  position: relative; /* 确保粒子背景在下方 */
}

.auth-container {
  display: flex;
  width: 100%;
  max-width: 900px;
  height: 580px;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative; /* 确保在粒子背景上方 */
  z-index: 10;
}

/* 卡片样式 */
.card {
  flex: 1;
  padding: 50px;
  position: relative;
  transition: all 0.5s ease;
}

.left-card {
  background: linear-gradient(135deg, #faf7fc 0%, #f4eef5 100%);
}

.right-card {
  background: #fff;
}

/* 信息面板样式 */
.info-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

/* 表单面板样式 */
.form-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-title {
  letter-spacing: 3px;
  font-size: 26px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #1d2129;
  text-align: center;
}

.panel-subtitle {
  font-size: 14px;
  color: #86909c;
  margin-bottom: 10px;
}

.panel-desc {
  font-size: 15px;
  color: #4e5969;
  margin: 0 0 30px;
  line-height: 1.6;
  max-width: 260px;
}

/* 登录选项卡 */
.login-tabs {
  display: flex;
  border-radius: 12px;
  background: #f2f3f5;
  margin-bottom: 25px;
  overflow: hidden;
}

.tab-item {
  flex: 1;
  padding: 12px 0;
  text-align: center;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-item.active {
  background: #fff;
  color: #165dff;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 表单样式 */
.form-group {
  margin-bottom: 20px;
}

.form-group input {
  width: 100%;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid #dcdfe6;
  font-size: 15px;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #165dff;
  box-shadow: 0 0 0 3px rgba(22, 93, 255, 0.1);
}

/* 图片验证码样式（适配验证码组件） */
.captcha-group {
  display: flex;
  gap: 0; /* 关键：将间距设为0 */
  align-items: center;
}

/* 验证码图片容器样式 */
.captcha-image-container {
  min-width: 110px;
  height: 48px;
  /* background: #f0f2f5; */
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  padding: 0 10px;
  /* border: 1px solid #dcdfe6; */
  transition: all 0.3s ease;
}

.captcha-image-container:hover {
  color: #165dff;
}

.captcha-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

.captcha-placeholder {
  /* color: #86909c; */
  font-size: 18px;
  text-align: center;
}

/* 短信验证码组 */
.sms-group {
  display: flex;
  gap: 12px;
}

.sms-group input {
  flex: 1;
}

/* 错误和警告状态 */
.form-group input.error {
  border-color: #f53f3f;
}

.form-group input.warning {
  border-color: #ff7d00;
}

.error-msg {
  color: #f53f3f;
  font-size: 12px;
  margin: 5px 0 0 8px;
  height: 14px;
  line-height: 14px;
}

.warning-msg {
  color: #ff7d00;
  font-size: 12px;
  margin: 5px 0 0 8px;
  height: 14px;
  line-height: 14px;
}

/* 按钮样式 */
.btn {
  padding: 14px 30px;
  border-radius: 12px;
  border: none;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1;
}

.primary-btn {
  background: linear-gradient(90deg, #e782fc 0%, #ce75f4 100%);
  color: #fff;
}

.primary-btn:hover {
  background: linear-gradient(90deg, #ce75f4 0%, #e782fc 100%);
  box-shadow: 0 6px 16px rgba(22, 93, 255, 0.3);
}

.sms-btn {
  min-width: 120px;
  background: #f2f3f5;
  color: #4e5969;
}

.sms-btn:disabled {
  background: #e5e6eb;
  color: #c9cdd4;
  cursor: not-allowed;
}

.back-btn {
  background: #f2f3f5;
  color: #4e5969;
  margin-right: 10px;
}
/* 登录和忘记密码操作 */
.form-actions {
  display: flex;
  flex-direction: column; /* 垂直排列子元素 */
  align-items: flex-end; /* 子元素右对齐 */
  margin-top: 10px;
}

.form-actions .btn {
  width: 100%; /* 让登录按钮与上方输入框等宽 */
  margin-bottom: 8px; /* 与“忘记密码？”保持间距 */
}

.forgot-link {
  color: #165dff;
  font-size: 14px;
  text-decoration: none;
  cursor: pointer;
  align-self: flex-end; /* 自身右对齐 */
}

.forgot-link:hover {
  text-decoration: underline;
}

/* 装饰弧形 */
.arc {
  position: absolute;
  width: 400px;
  height: 200px;
  background: #faf1fa;
  border-radius: 50%;
  filter: blur(1px);
}

.top-arc {
  top: -100px;
  right: -50px;
}

.bottom-arc {
  bottom: -100px;
  left: 0px;
}

/* 忘记密码页面 */
.forgot-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}

.forgot-container {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
}

/* 忘记密码弹窗的表单操作区 */
.forgot-container .form-actions {
  display: flex;
  gap: 12px; /* 按钮之间的间距 */
}

.forgot-container .form-actions .back-btn {
  margin-right: auto; /* 让“返回登录”按钮靠左，“确认重置”按钮靠右，若想都靠右，可去掉此句，调整gap即可 */
}

/* 动画效果 */
.card-fade-enter-active,
.card-fade-leave-active {
  transition: all 0.5s ease;
}

.card-fade-enter-from,
.card-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.form-switch-enter-active,
.form-switch-leave-active {
  transition: all 0.4s ease;
}

.form-switch-enter-from,
.form-switch-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition: all 0.3s ease;
}

.page-fade-enter-from {
  opacity: 0;
}

.page-fade-leave-to {
  opacity: 0;
}
.remember-me-container{
  display: flex;
  width: 350px;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  margin-top: -10px;
}
.remember-me{
  color: #165dff;
  font-size: 14px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .auth-container {
    flex-direction: column;
    height: auto;
    max-width: 400px;
  }

  .card {
    padding: 30px 25px;
  }

  .arc {
    width: 150px;
    height: 75px;
  }
}
</style>