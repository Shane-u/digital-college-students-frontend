import request from './request.js'

/**
 * 分页查询竞赛列表
 * @param {Object} params - 查询参数
 * @param {number} params.current - 当前页（默认1）
 * @param {number} params.pageSize - 每页数量（默认10）
 * @param {string} params.classId - 分类ID（多个用逗号分隔）
 * @param {number} params.level - 级别：0-不限，1-校级，2-市级，3-省级，4-全国性，5-全球性，6-自由，7-其他
 * @param {string} params.contestName - 竞赛名称（模糊查询）
 * @param {number} params.timeStatus - 时间状态：13-报名结束，22-比赛进行中，23-比赛结束
 * @returns {Promise} 返回竞赛列表数据
 */
export const getContestList = async (params = {}) => {
  try {
    const response = await request.get('/contest/list', { params })
    return response
  } catch (error) {
    console.error('获取竞赛列表失败:', error)
    throw error
  }
}

/**
 * 分页查询榜单竞赛列表
 * @param {Object} params - 查询参数
 * @param {number} params.current - 当前页（默认1）
 * @param {number} params.pageSize - 每页数量（默认10）
 * @param {string} params.classId - 分类ID（多个用逗号分隔）
 * @param {string} params.contestName - 竞赛名称（模糊查询）
 * @param {number} params.timeStatus - 时间状态
 * @returns {Promise} 返回榜单竞赛列表数据
 */
export const getHonorContestList = async (params = {}) => {
  try {
    const response = await request.get('/contest/listHonor', { params })
    return response
  } catch (error) {
    console.error('获取榜单竞赛列表失败:', error)
    throw error
  }
}

/**
 * 获取竞赛详情
 * @param {number} contestId - 竞赛ID
 * @returns {Promise} 返回竞赛详情数据
 */
export const getContestDetail = async (contestId) => {
  try {
    const response = await request.get('/contest/detail', {
      params: { contestId }
    })
    return response
  } catch (error) {
    console.error('获取竞赛详情失败:', error)
    throw error
  }
}