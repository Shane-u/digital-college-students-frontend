// 表单验证工具函数

// 验证规则
export const validationRules = {
  // 手机号验证
  phone: {
    pattern: /^1[3-9]\d{9}$/,
    message: '请输入正确的手机号'
  },
  
  // 邮箱验证
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: '请输入正确的邮箱格式'
  },
  
  // 密码验证
  password: {
    minLength: 6,
    message: '密码至少6位'
  },
  
  // 确认密码验证
  confirmPassword: (password, confirmPassword) => {
    if (!confirmPassword) return '请确认密码'
    if (password !== confirmPassword) return '两次密码不一致'
    return null
  },
  
  // 必填字段验证
  required: (value, fieldName) => {
    if (!value || value.trim() === '') return `请填写${fieldName}`
    return null
  },
  
  // 验证码验证
  captcha: {
    pattern: /^[A-Za-z0-9]{4}$/,
    message: '请输入4位验证码'
  },
  
  // 短信验证码验证
  smsCode: {
    pattern: /^\d{6}$/,
    message: '请输入6位短信验证码'
  }
}

// 验证函数
export const validateField = (value, rule, fieldName = '') => {
  if (!value || value.trim() === '') {
    return validationRules.required(value, fieldName)
  }
  
  if (typeof rule === 'function') {
    return rule(value)
  }
  
  if (rule.pattern && !rule.pattern.test(value)) {
    return rule.message
  }
  
  if (rule.minLength && value.length < rule.minLength) {
    return rule.message
  }
  
  return null
}

// 验证整个表单
export const validateForm = (formData, rules) => {
  const errors = {}
  let hasErrors = false
  
  for (const [field, rule] of Object.entries(rules)) {
    const error = validateField(formData[field], rule, field)
    if (error) {
      errors[field] = error
      hasErrors = true
    }
  }
  
  return { errors, hasErrors }
}



