<template>
  <div class="captcha-container">
    <div class="captcha-input">
      <!-- <input
        type="text"
        v-model="inputValue"
        class="form-input"
        :class="{ 'error': hasError }"
        :placeholder="placeholder"
        @input="handleInput"
        maxlength="4"
      /> -->
    </div>
    <div class="captcha-image" @click="refreshCaptcha">
      <canvas ref="captchaCanvas" width="120" height="48"></canvas>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'

export default {
  name: 'CaptchaComponent',
  props: {
    placeholder: {
      type: String,
      default: '请输入验证码'
    },
    modelValue: {
      type: String,
      default: ''
    },
    hasError: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const captchaCanvas = ref(null)
    const inputValue = ref(props.modelValue)
    const captchaCode = ref('')

    // 生成随机验证码
    const generateCaptcha = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      let result = ''
      for (let i = 0; i < 4; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      captchaCode.value = result
      return result
    }

    // 绘制验证码
    const drawCaptcha = () => {
      const canvas = captchaCanvas.value
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      const code = generateCaptcha()

      // 清空画布
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 设置背景
      ctx.fillStyle = '#F8FAFC'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 添加干扰线
      for (let i = 0; i < 5; i++) {
        ctx.strokeStyle = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.3)`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height)
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height)
        ctx.stroke()
      }

      // 绘制验证码文字
      for (let i = 0; i < code.length; i++) {
        ctx.fillStyle = `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`
        ctx.font = `${Math.floor(Math.random() * 10) + 16}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        
        const x = (canvas.width / code.length) * i + (canvas.width / code.length) / 2
        const y = canvas.height / 2 + (Math.random() - 0.5) * 10
        
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate((Math.random() - 0.5) * 0.4)
        ctx.fillText(code[i], 0, 0)
        ctx.restore()
      }

      // 添加干扰点
      for (let i = 0; i < 50; i++) {
        ctx.fillStyle = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.3)`
        ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1, 1)
      }
    }

    // 刷新验证码
    const refreshCaptcha = () => {
      drawCaptcha()
      inputValue.value = ''
      emit('update:modelValue', '')
    }

    // 处理输入
    const handleInput = () => {
      emit('update:modelValue', inputValue.value)
      emit('change', inputValue.value)
    }

    // 验证验证码
    const validateCaptcha = () => {
      return inputValue.value.toUpperCase() === captchaCode.value.toUpperCase()
    }

    // 监听modelValue变化
    watch(() => props.modelValue, (newValue) => {
      inputValue.value = newValue
    })

    onMounted(() => {
      drawCaptcha()
    })

    return {
      captchaCanvas,
      inputValue,
      refreshCaptcha,
      handleInput,
      validateCaptcha,
      hasError: props.hasError
    }
  }
}
</script>

<style scoped>
.captcha-container {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.captcha-input {
  flex: 1;
}

.captcha-image {
  width: 120px;
  height: 48px;
  border: 1px solid var(--medium-gray);
  border-radius: var(--border-radius);
  cursor: pointer;
  background: var(--light-gray);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  overflow: hidden;
}

.captcha-image:hover {
  border-color: var(--primary-blue);
}

.captcha-image canvas {
  display: block;
}
</style>

