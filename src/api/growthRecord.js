import request from './request'

/**
 * 上传图片
 * @param {File} file - 图片文件
 * @param {number} type - 类型：1-单纯作为照片存储，2-成长记录中的照片
 * @param {string} uploadTime - 目标上传时间（格式：yyyy-MM-dd HH:mm:ss 或 yyyy-MM-dd）
 * @returns {Promise}
 */
export function uploadImage(file, type = 2, uploadTime = null) {
  const formData = new FormData()
  formData.append('file', file)
  
  const params = { type }
  if (uploadTime) {
    params.uploadTime = uploadTime
  }
  
  return request({
    url: '/growth-record/upload/image',
    method: 'post',
    data: formData,
    params,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 上传文件
 * @param {File} file - 文件
 * @returns {Promise}
 */
export function uploadFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  
  return request({
    url: '/growth-record/upload/file',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 创建成长记录
 * @param {Object} data - 成长记录数据
 * @returns {Promise}
 */
export function addGrowthRecord(data) {
  return request({
    url: '/growth-record/add',
    method: 'post',
    data
  })
}

/**
 * 更新成长记录
 * @param {Object} data - 成长记录数据
 * @returns {Promise}
 */
export function updateGrowthRecord(data) {
  return request({
    url: '/growth-record/update',
    method: 'post',
    data
  })
}

/**
 * 删除成长记录
 * @param {number} id - 成长记录ID
 * @returns {Promise}
 */
export function deleteGrowthRecord(id) {
  return request({
    url: '/growth-record/delete',
    method: 'post',
    data: { id }
  })
}

/**
 * 根据 ID 获取成长记录
 * @param {number} id - 成长记录ID
 * @returns {Promise}
 */
export function getGrowthRecord(id) {
  return request({
    url: '/growth-record/get',
    method: 'get',
    params: { id }
  })
}

/**
 * 分页获取成长记录列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getGrowthRecordList(params) {
  return request({
    url: '/growth-record/list/page',
    method: 'post',
    data: params
  })
}

/**
 * 获取统计信息（记录总数、照片总数、文件总数）
 * @returns {Promise}
 */
export function getStatistics() {
  return request({
    url: '/growth-record/statistics',
    method: 'get'
  })
}

/**
 * 获取事件列表（id 和事件描述）
 * @returns {Promise}
 */
export function getEventList() {
  return request({
    url: '/growth-record/event/list',
    method: 'get'
  })
}

/**
 * 模糊查询成长记录（根据事件描述）
 * @param {string} eventDesc - 事件描述
 * @returns {Promise}
 */
export function searchGrowthRecords(eventDesc) {
  return request({
    url: '/growth-record/search',
    method: 'get',
    params: { eventDesc }
  })
}

/**
 * 获取里程碑统计信息（4星及以上）
 * @returns {Promise}
 */
export function getMilestoneStatistics() {
  return request({
    url: '/growth-record/milestone/statistics',
    method: 'get'
  })
}

/**
 * 获取照片墙统计信息
 * @returns {Promise}
 */
export function getPhotoWallStatistics() {
  return request({
    url: '/growth-record/photo-wall/statistics',
    method: 'get'
  })
}

/**
 * 删除图片
 * @param {number} id - 图片ID
 * @returns {Promise}
 */
export function deleteImage(id) {
  return request({
    url: '/growth-record/image/delete',
    method: 'post',
    params: { id }
  })
}




