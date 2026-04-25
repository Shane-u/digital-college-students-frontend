<template>
  <main class="cp-panel cp-panel--report cp-immerse">
    <div class="cp-immerse__scene" aria-hidden="true">
      <div class="cp-immerse__gradient" />
      <div class="cp-immerse__orb cp-immerse__orb--a" />
      <div class="cp-immerse__orb cp-immerse__orb--b" />
      <div class="cp-immerse__orb cp-immerse__orb--c" />
      <div class="cp-immerse__grain" />
    </div>
    <div class="cp-report__inner">
      <div class="cp-report__topbar">
        <button type="button" class="cp-btn-secondary cp-btn-secondary--back" @click="$emit('back')">返回</button>
      </div>
      <div id="reportBox" class="cp-report__body markdown-body markdown-body-custom" v-html="reportHtml" />
      <div id="linksBox" class="cp-report__links workflow-links" v-html="linksHtml" />
    </div>
  </main>
</template>

<script setup>
defineProps({
  reportHtml: { type: String, required: true },
  linksHtml: { type: String, required: true }
})

defineEmits(['back'])
</script>

<style scoped>
.cp-panel { flex: 1; display: flex; flex-direction: column; min-height: calc(100vh - var(--cp-nav-offset)); box-sizing: border-box; }
.cp-immerse { position: relative; isolation: isolate; overflow-x: hidden; }
.cp-immerse__scene { position: absolute; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; }
.cp-immerse__gradient { position: absolute; inset: 0; background: var(--cp-bg); }
.cp-immerse__orb,.cp-immerse__grain { display: none; }
.cp-panel--report { position: relative; padding: 20px clamp(14px, 4vw, 36px) max(40px, env(safe-area-inset-bottom)); }
.cp-report__inner { position: relative; z-index: 1; max-width: 1080px; margin: 0 auto; width: 100%; }
.cp-report__topbar { display: flex; justify-content: flex-end; margin-bottom: 12px; }
.cp-btn-secondary { padding: 12px 20px; border-radius: 10px; border: 1px solid var(--cp-border); background: var(--cp-surface); color: var(--cp-text); font-size: 14px; font-weight: 500; cursor: pointer; transition: border-color 0.2s, background 0.2s; }
.cp-btn-secondary--back { padding: 10px 18px; border-radius: 999px; font-weight: 600; background: rgba(255, 255, 255, 0.85); }
.cp-btn-secondary:hover:not(:disabled) { border-color: rgba(37, 99, 235, 0.35); background: var(--cp-brand-soft); }
.cp-report__body { min-height: 200px; }
.cp-report__links { margin-top: 20px; }
.workflow-links-title { margin: 0 0 8px; font-size: 16px; font-weight: 600; color: var(--cp-text); }
.workflow-link-item { display: block; margin-bottom: 6px; color: var(--cp-brand); text-decoration: underline; text-underline-offset: 2px; word-break: break-all; font-size: 16px; }
.markdown-body-custom { padding: 22px clamp(18px, 3vw, 28px); border-radius: 20px; font-size: 16px; line-height: 1.75; background: rgba(255, 255, 255, 0.78); border: 1px solid var(--cp-glass-border); color: var(--cp-text); backdrop-filter: blur(14px); box-shadow: 0 8px 40px rgba(15, 23, 42, 0.06); }
.markdown-body-custom :deep(h1) { font-size: 2rem; line-height: 1.25; }
.markdown-body-custom :deep(h2) { font-size: 1.6rem; line-height: 1.3; }
.markdown-body-custom :deep(h3) { font-size: 1.35rem; line-height: 1.35; }
.empty-state { color: var(--cp-muted); text-align: center; padding: 40px 0; font-size: 16px; }
</style>
