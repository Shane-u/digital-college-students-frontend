<template>
  <transition name="gyl-fade">
    <div v-if="visible" class="gyl-modal-mask" @click.self="$emit('close')">
      <div class="gyl-noise"></div>
      <div class="gyl-glow gyl-glow-a"></div>
      <div class="gyl-glow gyl-glow-b"></div>
      <div class="gyl-ring gyl-ring-a"></div>
      <div class="gyl-ring gyl-ring-b"></div>

      <section
        v-if="visible"
        class="gyl-modal-panel animate__animated animate__zoomIn"
        role="dialog"
        aria-modal="true"
        aria-label="猜你想看"
      >
          <header class="gyl-header">
            <div class="gyl-title-wrap">
              <span class="gyl-kicker">智能推荐</span>
              <div class="gyl-title-row">
                <h2 class="gyl-title">{{ title || '猜你想看' }}</h2>
                <button
                  v-if="canSwitchBatch"
                  class="gyl-switch"
                  :class="{ 'gyl-switch--pulse': switchPulse }"
                  type="button"
                  @click="switchBatch"
                >
                  <span class="gyl-switch-icon">⟳</span>
                  <span>换一批</span>
                </button>
              </div>
              <p class="gyl-subtitle">{{ subtitle }}</p>
            </div>
            <button class="gyl-close" type="button" @click="$emit('close')" aria-label="关闭">
              ✕
            </button>
          </header>

          <div class="gyl-body">
            <div v-if="loading" class="gyl-loading">
              <span class="gyl-spinner"></span>
              <span>正在为你挑选内容...</span>
            </div>

            <div v-else-if="error" class="gyl-empty">
              <p>{{ error }}</p>
            </div>

            <div v-else-if="!items || !items.length" class="gyl-empty">
              <p>暂无推荐内容，稍后再来看看。</p>
            </div>

            <div v-if="!loading && !error && items && items.length" :key="`batch-${pageIndex}`" class="gyl-grid">
              <button
                v-for="item in displayedItems"
                :key="item.id"
                class="gyl-card"
                type="button"
                @click="$emit('select', item)"
              >
                <div class="gyl-card-head">
                  <h3 class="gyl-card-title">{{ item.title }}</h3>
                  <span v-if="item.badge" class="gyl-card-badge">{{ item.badge }}</span>
                </div>
                <p class="gyl-card-desc">{{ item.description }}</p>
                <div class="gyl-card-foot">
                  <span class="gyl-card-meta">{{ item.meta || '为你推荐' }}</span>
                  <span class="gyl-card-action">去看看 →</span>
                </div>
              </button>
            </div>
          </div>

          <footer class="gyl-footer">
            <button class="gyl-btn gyl-btn-ghost" type="button" @click="$emit('close')">稍后再看</button>
          </footer>
      </section>
    </div>
  </transition>
</template>

<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: "猜你想看" },
  subtitle: { type: String, default: "根据你当前访问页面，为你挑选了这些内容" },
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: String, default: "" }
});

const pageIndex = ref(0);
const pageSize = 3;
const switchPulse = ref(false);
let switchPulseTimer = null;

const chunks = computed(() => {
  const source = Array.isArray(props.items) ? props.items : [];
  if (!source.length) return [];
  const result = [];
  for (let i = 0; i < source.length; i += pageSize) {
    result.push(source.slice(i, i + pageSize));
  }
  return result;
});

const displayedItems = computed(() => {
  if (!chunks.value.length) return [];
  const safeIndex = pageIndex.value % chunks.value.length;
  return chunks.value[safeIndex];
});

const canSwitchBatch = computed(() => chunks.value.length > 1);

const switchBatch = () => {
  if (!chunks.value.length) return;
  switchPulse.value = true;
  window.clearTimeout(switchPulseTimer);
  switchPulseTimer = window.setTimeout(() => {
    switchPulse.value = false;
  }, 380);
  pageIndex.value = (pageIndex.value + 1) % chunks.value.length;
};

watch(
  () => props.items,
  () => {
    pageIndex.value = 0;
  }
);

defineEmits(["close", "select"]);
</script>

<style scoped>
.gyl-modal-mask {
  position: fixed;
  inset: 0;
  z-index: 4000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px;
  background: radial-gradient(circle at 18% 12%, rgba(236, 238, 242, 0.5), rgba(244, 246, 249, 0.62) 46%, rgba(251, 252, 253, 0.76));
  overflow: hidden;
}

.gyl-noise {
  position: absolute;
  inset: 0;
  opacity: 0.028;
  pointer-events: none;
  background-image: radial-gradient(circle at 1px 1px, rgba(120, 128, 146, 0.24) 1px, transparent 0);
  background-size: 20px 20px;
}

.gyl-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(50px);
  pointer-events: none;
  animation: gyl-float 7s ease-in-out infinite;
}

.gyl-glow-a {
  width: 360px;
  height: 360px;
  left: -80px;
  top: -60px;
  background: rgba(187, 162, 241, 0.2);
}

.gyl-glow-b {
  width: 420px;
  height: 420px;
  right: -90px;
  bottom: -90px;
  background: rgba(215, 178, 240, 0.16);
  animation-delay: 1.2s;
}

.gyl-ring {
  position: absolute;
  border: 1px solid rgba(171, 132, 255, 0.14);
  border-radius: 999px;
  pointer-events: none;
}

.gyl-ring-a {
  width: 540px;
  height: 540px;
  right: -120px;
  top: -210px;
  animation: gyl-rotate 20s linear infinite;
}

.gyl-ring-b {
  width: 420px;
  height: 420px;
  left: -160px;
  bottom: -190px;
  animation: gyl-rotate 16s linear infinite reverse;
}

.gyl-modal-panel {
  position: relative;
  width: min(860px, 100%);
  max-height: min(74vh, 650px);
  border-radius: 26px;
  border: 1px solid rgba(205, 210, 220, 0.72);
  background: linear-gradient(155deg, rgba(250, 251, 253, 0.96), rgba(243, 245, 248, 0.94));
  box-shadow: 0 20px 56px rgba(68, 78, 96, 0.18);
  color: #222b3a;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(24px);
  isolation: isolate;
  overflow: hidden;
  --animate-duration: 720ms;
  --animate-delay: 20ms;
  --animate-repeat: 1;
}

.gyl-modal-panel::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 26px;
  padding: 2px;
  background:
    linear-gradient(
      105deg,
      rgba(148, 163, 184, 0.08) 0%,
      rgba(59, 130, 246, 0.92) 14%,
      rgba(56, 189, 248, 0.98) 26%,
      rgba(37, 99, 235, 0.9) 38%,
      rgba(99, 102, 241, 0.86) 52%,
      rgba(14, 165, 233, 0.96) 66%,
      rgba(96, 165, 250, 0.9) 82%,
      rgba(148, 163, 184, 0.08) 100%
    );
  background-size: 320% 320%;
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
  pointer-events: none;
  opacity: 0.98;
  filter: saturate(1.28) brightness(1.08);
  animation: gyl-border-flow 2.2s linear infinite;
}

.gyl-modal-panel::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 26px;
  padding: 2.4px;
  background:
    linear-gradient(
      -95deg,
      rgba(59, 130, 246, 0) 0%,
      rgba(14, 165, 233, 0.66) 22%,
      rgba(56, 189, 248, 0.72) 42%,
      rgba(59, 130, 246, 0) 72%
    );
  background-size: 250% 250%;
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
  pointer-events: none;
  opacity: 0.82;
  animation: gyl-border-flow-reverse 1.7s linear infinite;
}

.gyl-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 22px 12px;
}

.gyl-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.gyl-kicker {
  display: inline-block;
  font-size: 14px;
  letter-spacing: 0.14em;
  color: #7b8597;
  margin-bottom: 8px;
}

.gyl-title {
  margin: 0;
  font-size: 38px;
  line-height: 1.08;
  background: linear-gradient(92deg, #2563eb 0%, #4f46e5 45%, #0ea5e9 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 1px 8px rgba(59, 130, 246, 0.2));
}

.gyl-switch {
  border: 1px solid rgba(187, 193, 203, 0.86);
  background: rgba(255, 255, 255, 0.92);
  color: #4b5668;
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
}

.gyl-switch:hover {
  transform: translateY(-1px) scale(1.06);
  box-shadow: 0 10px 24px rgba(116, 126, 141, 0.28);
  border-color: rgba(118, 138, 178, 0.92);
}

.gyl-switch--pulse {
  animation: gyl-switch-pop 0.38s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.gyl-switch-icon {
  font-size: 15px;
  animation: gyl-spin-slow 2.8s linear infinite;
}

.gyl-subtitle {
  margin: 6px 0 0;
  font-size: 20px;
  color: rgba(82, 93, 112, 0.85);
}

.gyl-close {
  width: 40px;
  height: 40px;
  border: 1px solid rgba(189, 195, 205, 0.88);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.7);
  color: #627085;
  cursor: pointer;
}

.gyl-body {
  padding: 0 20px 8px;
  overflow: visible;
}

.gyl-loading,
.gyl-empty {
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 12px;
  color: #70569f;
}

.gyl-spinner {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 3px solid rgba(162, 122, 240, 0.24);
  border-top-color: #9b6cf0;
  animation: gyl-spin 0.7s linear infinite;
}

.gyl-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.gyl-card {
  text-align: left;
  border: 1px solid rgba(214, 219, 228, 0.95);
  background: linear-gradient(155deg, rgba(255, 255, 255, 0.98), rgba(245, 247, 250, 0.96));
  border-radius: 16px;
  padding: 12px 14px 10px;
  color: #263044;
  cursor: pointer;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.gyl-card:hover {
  border-color: rgba(173, 181, 194, 0.95);
  box-shadow: 0 10px 24px rgba(97, 108, 125, 0.18);
}

.gyl-card-head {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.gyl-card-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1f64d1;
}

.gyl-card-badge {
  flex-shrink: 0;
  font-size: 12px;
  padding: 4px 9px;
  border-radius: 999px;
  color: #fff;
  background: linear-gradient(90deg, #ff4d4f, #e03131);
}

.gyl-card-desc {
  margin: 8px 0;
  font-size: 14px;
  line-height: 1.45;
  color: rgba(75, 86, 105, 0.9);
  min-height: 36px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.gyl-card-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.gyl-card-meta {
  color: #7c889a;
}

.gyl-card-action {
  color: #5a6780;
  font-weight: 700;
}

.gyl-footer {
  padding: 8px 20px 14px;
  display: flex;
  justify-content: flex-end;
}

.gyl-btn {
  border-radius: 12px;
  border: none;
  padding: 10px 16px;
  font-size: 16px;
  cursor: pointer;
}


.gyl-btn-ghost {
  color: #57647a;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(192, 198, 208, 0.95);
}

.gyl-fade-enter-active,
.gyl-fade-leave-active {
  transition: opacity 0.28s ease;
}

.gyl-fade-enter-from,
.gyl-fade-leave-to {
  opacity: 0;
}

@keyframes gyl-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-16px); }
}

@keyframes gyl-rotate {
  to { transform: rotate(360deg); }
}

@keyframes gyl-spin {
  to { transform: rotate(360deg); }
}

@keyframes gyl-spin-slow {
  to { transform: rotate(360deg); }
}

@keyframes gyl-border-flow {
  0% {
    background-position: 0% 50%;
  }
  25% {
    background-position: 100% 50%;
  }
  50% {
    background-position: 100% 100%;
  }
  75% {
    background-position: 0% 100%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes gyl-border-flow-reverse {
  0% {
    background-position: 100% 50%;
  }
  25% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 0% 0%;
  }
  75% {
    background-position: 100% 0%;
  }
  100% {
    background-position: 100% 50%;
  }
}

@keyframes gyl-switch-pop {
  0% {
    transform: scale(0.92) rotate(-4deg);
    box-shadow: 0 0 0 0 rgba(102, 133, 192, 0.35);
  }
  60% {
    transform: scale(1.1) rotate(3deg);
    box-shadow: 0 0 0 8px rgba(102, 133, 192, 0.14);
  }
  100% {
    transform: scale(1) rotate(0);
    box-shadow: 0 0 0 0 rgba(102, 133, 192, 0);
  }
}


@media (max-width: 900px) {
  .gyl-title-row {
    flex-wrap: wrap;
  }
}
</style>
