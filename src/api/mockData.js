import Mock from 'mockjs';
// 模拟竞赛数据
const competitionData = Mock.mock({
  'list|10': [
    {
      'id|+1': 1,
      title: '@ctitle(20,30)',
      viewCount: '@integer(100, 10000)'
    }
  ]
});
// 定义接口：使用正则以适配完整域名路径
Mock.mock(/\/api\/competitionList$/, 'get', () => {
  return {
    code: 200,
    data: competitionData.list,
    message: '请求成功'
  };
});