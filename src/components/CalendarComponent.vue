<template>
  <div class="calendar-container">
    <div class="calendar-header">
      <button @click="previousMonth" class="month-nav-btn">← 上个月</button>
      <div class="current-month-wrapper">
        <div class="current-month">{{ currentYear }}年 {{ currentMonth }}月</div>
        <a @click="returnToToday" class="return-today">回到今天</a>
      </div>
      <button @click="nextMonth" class="month-nav-btn">下个月 →</button>
    </div>

    <div class="calendar-grid">
      <!-- 星期标题 -->
      <div class="weekday-header">日</div>
      <div class="weekday-header">一</div>
      <div class="weekday-header">二</div>
      <div class="weekday-header">三</div>
      <div class="weekday-header">四</div>
      <div class="weekday-header">五</div>
      <div class="weekday-header">六</div>

      <!-- 日期格子 -->
      <div
        v-for="day in calendarDays"
        :key="day.key"
        :class="[
          'calendar-day',
          { 'other-month': !day.isCurrentMonth },
          { 'today': day.isToday },
          { 'selected': day.isSelected },
          { 'has-record': day.hasRecord }
        ]"
        @click="selectDay(day)"
      >
        <div class="day-number">{{ day.day }}</div>
        <div v-if="day.hasRecord && day.recordDescription" class="day-description">
          {{ day.recordDescription }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  records: {
    type: Array,
    default: () => []
  },
  selectedDate: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['selectDate'])

// 当前显示的年月
const today = new Date()
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth() + 1)
const selectedDay = ref(null)

// 上个月
const previousMonth = () => {
  if (currentMonth.value === 1) {
    currentMonth.value = 12
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

// 下个月
const nextMonth = () => {
  if (currentMonth.value === 12) {
    currentMonth.value = 1
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

// 回到今天
const returnToToday = () => {
  currentYear.value = today.getFullYear()
  currentMonth.value = today.getMonth() + 1
}

// 获取某月的天数
const getDaysInMonth = (year, month) => {
  return new Date(year, month, 0).getDate()
}

// 获取某月第一天是星期几（0=周日，1=周一，...，6=周六）
const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month - 1, 1).getDay()
}

// 生成日历数据
const calendarDays = computed(() => {
  const days = []
  const year = currentYear.value
  const month = currentMonth.value
  
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  
  // 上个月的日期
  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth)
  
  // 填充上个月的日期
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i
    const dateStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const record = props.records.find(r => r.date === dateStr)
    
    days.push({
      day,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
      hasRecord: !!record,
      recordDescription: record?.description || '',
      dateStr,
      key: `prev-${day}`
    })
  }
  
  // 当前月的日期
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const record = props.records.find(r => r.date === dateStr)
    const isToday = year === today.getFullYear() && 
                    month === today.getMonth() + 1 && 
                    day === today.getDate()
    const isSelected = selectedDay.value === dateStr
    
    days.push({
      day,
      isCurrentMonth: true,
      isToday,
      isSelected,
      hasRecord: !!record,
      recordDescription: record?.description || '',
      dateStr,
      key: `current-${day}`
    })
  }
  
  // 下个月的日期（填充到42个格子，6行7列）
  const remainingDays = 42 - days.length
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year
  
  for (let day = 1; day <= remainingDays; day++) {
    const dateStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const record = props.records.find(r => r.date === dateStr)
    
    days.push({
      day,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
      hasRecord: !!record,
      recordDescription: record?.description || '',
      dateStr,
      key: `next-${day}`
    })
  }
  
  return days
})

// 选择日期
const selectDay = (day) => {
  console.log('日历组件：点击了日期', day)
  if (!day.isCurrentMonth) {
    console.log('日历组件：这不是当前月份的日期，忽略点击')
    return
  }
  console.log('日历组件：设置选中日期为', day.dateStr)
  selectedDay.value = day.dateStr
  console.log('日历组件：触发 selectDate 事件，参数为', day.dateStr)
  emit('selectDate', day.dateStr)
}

// 监听外部传入的选中日期
watch(() => props.selectedDate, (newVal) => {
  if (newVal) {
    selectedDay.value = newVal
  }
})
</script>

<style scoped>
.calendar-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.month-nav-btn {
  background: #7d5196;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.month-nav-btn:hover {
  background: #9575b5;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(184, 160, 200, 0.4);
}

.current-month-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.current-month {
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
}

.return-today {
  font-size: 14px;
  color: #b8a0c8;
  cursor: pointer;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
}

.return-today:hover {
  color: #9575b5;
  text-decoration: underline;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.weekday-header {
  text-align: center;
  font-weight: 700;
  color: #b8a0c8;
  padding: 12px;
  font-size: 14px;
  background: #f8f9ff;
  border-right: 1px solid #e0e0e0;
  border-bottom: 2px solid #e0e0e0;
}

.weekday-header:last-child {
  border-right: none;
}

.calendar-day {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  border-radius: 0;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
  border-right: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
  position: relative;
  min-height: 100px;
  padding: 8px;
}

.calendar-day:nth-child(7n) {
  border-right: none;
}

.calendar-day:hover {
  background: #f8f9ff;
  box-shadow: inset 0 0 0 2px #b8a0c8;
  z-index: 1;
}

.calendar-day.other-month {
  opacity: 0.3;
  cursor: default;
}

.calendar-day.other-month:hover {
  background: white;
  box-shadow: none;
  z-index: 0;
}

.calendar-day.today {
  color: #b8a0c8;
}

.calendar-day.today .day-number {
  color: #7d5196;
  font-weight: 700;
  font-size: 20px;
}

.calendar-day.selected {
  background: rgba(184, 160, 200, 0.1);
  box-shadow: inset 0 0 0 3px #b8a0c8;
}

.calendar-day.has-record {
  background: rgba(184, 160, 200, 0.08);
}

.day-number {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
  align-self: flex-start;
}

.day-description {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  word-break: break-all;
  width: 100%;
}

.calendar-day.today .day-weight {
  background: rgba(255, 255, 255, 0.3);
  /* color: white; */
}

.calendar-day.today .day-description {
  color: rgba(255, 255, 255, 0.9);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .calendar-container {
    padding: 16px;
  }
  
  .calendar-day {
    min-height: 60px;
  }
  
  .day-number {
    font-size: 14px;
  }
  
  .day-weight {
    font-size: 10px;
  }
}
</style>

