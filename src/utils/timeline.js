const DEFAULT_TIMELINE = [
  {
    id: 1,
    date: '2018',
    title: '大一',
    content: '探索方向，在新鲜与迷茫中锚定初心',
    isShow: true,
    children: [
      {
        name: '2018.9.15',
        content: '加入校学生会文艺部，参与迎新晚会策划'
      },
      {
        name: '2018.11.3',
        content: '首次参加校级数学建模竞赛，获优秀奖'
      },
      {
        name: '2018.12.20',
        content: '加入英语角社团，坚持每周口语练习'
      }
    ]
  },
  {
    id: 2,
    date: '2019',
    title: '大二',
    content: '打牢基础，在实战中不断历练成长',
    isShow: true,
    children: [
      {
        name: '2019.5.10',
        content: '带队参加全国大学生创新创业大赛，获省级二等奖'
      },
      {
        name: '2019.8.1',
        content: '暑期社会实践，深入基层开展调研'
      },
      {
        name: '2019.10.15',
        content: '担任学院学习委员，组织期末冲刺学习营'
      }
    ]
  },
  {
    id: 3,
    date: '2020',
    title: '大三',
    content: '勇于突破，探索科研与竞赛的无限可能',
    isShow: true,
    children: [
      {
        name: '2020.3.20',
        content: '加入导师科研团队，负责数据可视化模块'
      },
      {
        name: '2020.7.12',
        content: '作为主力完成智能车竞赛全国总决赛'
      },
      {
        name: '2020.12.5',
        content: '在核心期刊发表第一篇论文'
      }
    ]
  }
]

export const getDefaultTimeline = () =>
  DEFAULT_TIMELINE.map((item) => ({
    ...item,
    children: item.children ? item.children.map((child) => ({ ...child })) : []
  }))

export const buildTimelineFromRecords = (records = []) => {
  if (!Array.isArray(records) || records.length === 0) {
    return getDefaultTimeline()
  }

  const yearGroups = {}

  records.forEach((record) => {
    if (!record?.recordTime) return
    const time = new Date(record.recordTime)
    if (Number.isNaN(time.getTime())) return
    const year = time.getFullYear()
    if (!yearGroups[year]) {
      yearGroups[year] = []
    }
    yearGroups[year].push(record)
  })

  const timeline = []
  let id = 1

  Object.keys(yearGroups)
    .sort()
    .forEach((year) => {
      const yearRecords = yearGroups[year]
      yearRecords.sort((a, b) => {
        if (!a.recordTime || !b.recordTime) return 0
        return new Date(a.recordTime) - new Date(b.recordTime)
      })

      timeline.push({
        id: id++,
        date: year,
        title: `${year}年`,
        content: `共${yearRecords.length}个重要里程碑`,
        isShow: true,
        children: yearRecords.map((record) => ({
          name: record.recordTime ? record.recordTime.split('T')[0] : '',
          content: record.eventDesc || record.reflection || '重要事件'
        }))
      })
    })

  return timeline.length > 0 ? timeline : getDefaultTimeline()
}





