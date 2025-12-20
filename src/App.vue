<template>
  <div id="app">
    <MouseFollower />
    <router-view v-slot="{ Component }">
      <transition name="page-fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <!-- 全局看板娘组件 -->
    <WankoAssistant />
  </div>
</template>

<script>
import WankoAssistant from './components/WankoAssistant.vue';
import MouseFollower from './components/MouseFollower.vue';

export default {
  name: 'App',
  components: {
    WankoAssistant,
    MouseFollower
  }
}
</script>

<style>
#app {
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
  padding: 0;
  min-height: 100vh;
}

/* 页面切换过渡动画 */
.page-fade-enter-active {
  transition: all 0.4s ease-out;
}

.page-fade-leave-active {
  transition: all 0.3s ease-in;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.page-fade-enter-to,
.page-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>





