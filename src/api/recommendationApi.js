import request from "./request";
import { getContestList, getHonorContestList } from "./competitionApi";

const trimDescription = (text) => {
  if (!text) return "点击查看详情";
  return text.length > 58 ? `${text.slice(0, 58)}...` : text;
};

export async function getEduCompetitionRecommendations() {
  const data = await getHonorContestList({ current: 1, pageSize: 6 });
  const records = (data && data.records) || [];
  return records.map((item) => ({
    id: item.contestId || item.id,
    title: item.contestName || item.title || "竞赛推荐",
    description: trimDescription(
      [item.organiserName && `主办方：${item.organiserName}`, item.timeName && `状态：${item.timeName}`]
        .filter(Boolean)
        .join("，")
    ),
    meta: item.levelName || item.contestClassFirst || "竞赛活动",
    badge: "热门",
    to: `/competition/detail/${item.contestId || item.id}`
  }));
}

export async function getSubjectCompetitionRecommendations() {
  const data = await getContestList({ current: 1, pageSize: 6 });
  const records = (data && data.records) || [];
  return records.map((item) => ({
    id: item.contestId || item.id,
    title: item.contestName || item.title || "竞赛推荐",
    description: trimDescription(
      [item.organiserName && `主办方：${item.organiserName}`, item.timeName && `状态：${item.timeName}`]
        .filter(Boolean)
        .join("，")
    ),
    meta: item.contestClassSecond || item.contestClassFirst || "学科竞赛",
    badge: "精选",
    to: `/competition/detail/${item.contestId || item.id}`
  }));
}

export async function getCareerRecommendations() {
  const data = await request.get("/crawler/job-info/list/page", {
    params: { current: 1, pageSize: 6 }
  });
  const records = (data && data.records) || [];
  return records.map((item) => ({
    id: item.id,
    title: item.workName || "职业推荐",
    description: trimDescription(item.workContent || ""),
    meta: item.companyName || item.workAddress || "职业展示",
    badge: "上新",
    to: "/career/showcase",
    externalUrl: item.url || ""
  }));
}
