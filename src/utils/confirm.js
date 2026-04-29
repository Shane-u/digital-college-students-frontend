import { ElMessageBox } from 'element-plus'

/**
 * 统一平台确认弹窗样式与行为。
 * @param {string} message
 * @param {{
 *   title?: string
 *   confirmButtonText?: string
 *   cancelButtonText?: string
 *   type?: 'warning' | 'info' | 'success' | 'error'
 * }} options
 * @returns {Promise<boolean>}
 */
export async function confirmAction(message, options = {}) {
  const {
    title = '提示',
    confirmButtonText = '确定',
    cancelButtonText = '取消',
    type = 'warning',
  } = options

  try {
    await ElMessageBox.confirm(message, title, {
      confirmButtonText,
      cancelButtonText,
      type,
      showClose: true,
      autofocus: false,
      closeOnClickModal: false,
      closeOnPressEscape: true,
      customClass: 'dc-confirm-dialog',
    })
    return true
  } catch (_) {
    return false
  }
}
