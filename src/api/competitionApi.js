
import axios from 'axios';
// 封装获取竞赛列表的接口请求
export const getCompetitionList = async () => {
  try {
    const response = await axios.get('/api/competitionList');
    if (response.data.code === 200) {
      console.log(response.data.data);
      return response.data.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error('获取竞赛列表失败:', error);
    throw error;
  }
};