import request from './request'

/**
 * 上传用户头像（返回可访问 URL）
 * POST /user/upload/avatar
 * @param {File} file
 * @returns {Promise<string>} 返回头像 URL
 */
export function uploadUserAvatar(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/user/upload/avatar',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

/**
 * 更新个人信息
 * POST /user/update/my
 * @param {Object} data
 * @param {string} data.userName
 * @param {string} data.userAvatar
 * @param {string} data.userProfile
 * @param {string} data.gender
 * @param {string} data.grade
 * @param {string} data.major
 * @param {string} data.school
 * @returns {Promise<boolean>}
 */
export function updateMyProfile(data) {
  return request({
    url: '/user/update/my',
    method: 'post',
    data
  })
}

export function getMyProfile() {
  return request({
    url: '/user/get/login',
    method: 'get'
  })
}



