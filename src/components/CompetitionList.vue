<template>
  <div class="competition-list">
    <div v-if="competitions.length === 0" class="empty-state">
      暂无竞赛数据
    </div>
    <div 
      v-for="competition in competitions" 
      :key="competition.id"
      class="competition-item"
    >
      <div class="competition-image">
        <img :src="competition.image" :alt="competition.title">
      </div>
      <div class="competition-info">
        <h3 class="competition-title">
          <a :href="competition.link" target="_blank">{{ competition.title }}</a>
        </h3>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CompetitionList',
  props: {
    competitions: {
      type: Array,
      required: true
    }
  }
};
</script>

<style scoped>
.competition-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.competition-item {
  display: flex;
  gap: 20px;
  padding: 15px;
  border-radius: 8px;
  background-color: #f9f9f9;
  transition: transform 0.2s, box-shadow 0.2s;
}

.competition-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.competition-image {
  flex-shrink: 0;
  width: 200px;
  height: 120px;
  overflow: hidden;
  border-radius: 6px;
}

.competition-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.competition-item:hover .competition-image img {
  transform: scale(1.05);
}

.competition-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.competition-title {
  font-size: 18px;
  margin: 0 0 8px;
}

.competition-title a {
  color: #333;
  text-decoration: none;
  transition: color 0.2s;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.competition-title a:hover {
  color: #3b82f6;
}

.empty-state {
  padding: 40px 0;
  text-align: center;
  color: #999;
  font-size: 16px;
}

@media (max-width: 768px) {
  .competition-item {
    flex-direction: column;
  }
  
  .competition-image {
    width: 100%;
    height: 180px;
  }
}
</style>

