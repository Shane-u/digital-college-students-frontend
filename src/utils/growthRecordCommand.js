/**
 * 处理添加成长记录的命令
 * 与后端 addGrowthRecord 工具对接
 */

import { switchNavTab } from './navCommand';

/**
 * 触发打开成长记录对话框
 * 通过路由查询参数传递数据到 GrowthRecordPage，使其打开对话框并填充数据
 * @param {import('vue-router').Router} router - Vue Router 实例
 * @param {string} dateStr - 日期字符串，格式为 YYYY-MM-DD
 * @param {string} eventName - 事件名称，默认为空字符串
 * @param {number} importance - 重要程度，默认为 0
 * @param {string} personalInsight - 个人感悟，默认为空字符串
 */
export const triggerOpenGrowthRecordDialog = (router, dateStr, eventName = '', importance = 0, personalInsight = '') => {
  const queryParams = {
    openGrowthDialog: 'true', // 指示 GrowthRecordPage 打开对话框
    date: dateStr,
    eventName: eventName,
    importance: importance.toString(), // 确保是字符串
    personalInsight: personalInsight
  };
  console.log('triggerOpenGrowthRecordDialog: pushing route with queryParams:', queryParams); // 添加日志
  // 导航到成长记录页面，并附带查询参数
  router.push({ path: '/growth/record', query: queryParams }).catch(() => {});
};
