<template>
  <main class="cp-panel cp-panel--workflow cp-immerse">
    <div class="cp-immerse__scene" aria-hidden="true">
      <div class="cp-immerse__gradient" />
      <div class="cp-immerse__orb cp-immerse__orb--a" />
      <div class="cp-immerse__orb cp-immerse__orb--b" />
      <div class="cp-immerse__orb cp-immerse__orb--c" />
      <div class="cp-immerse__grain" />
    </div>

    <div v-if="!workflowLaunched && !startBtnDisabled" class="cp-flow__inner cp-flow__inner--idle">
      <p class="cp-flow__idle-title">准备生成你的职业规划</p>
      <p v-if="!hasAssessmentResult" class="cp-flow__idle-desc">请先完成职业测评。</p>
      <template v-else>
        <p class="cp-flow__idle-desc">将基于测评结果启动智能分析，过程无需额外操作。</p>
        <button type="button" class="cp-btn-main cp-flow__start-btn" :disabled="startBtnDisabled" @click="$emit('start')">
          开始生成
        </button>
      </template>
    </div>

    <div v-else-if="!workflowFinished" :ref="workflowAnimRootRef" class="cp-flow__inner cp-flow__inner--cinema">
      <div class="cp-wf-back-glow" aria-hidden="true" />

      <div class="cp-wf-dog-wrap" aria-hidden="true">
        <div class="cp-dog-main">
          <div class="cp-dog">
            <div class="cp-dog__paws">
              <div class="cp-dog-leg cp-dog__bl-leg"><div class="cp-dog-paw cp-dog__bl-paw" /><div class="cp-dog-thigh cp-dog__bl-top" /></div>
              <div class="cp-dog-leg cp-dog__fl-leg"><div class="cp-dog-paw cp-dog__fl-paw" /><div class="cp-dog-thigh cp-dog__fl-top" /></div>
              <div class="cp-dog-leg cp-dog__fr-leg"><div class="cp-dog-paw cp-dog__fr-paw" /><div class="cp-dog-thigh cp-dog__fr-top" /></div>
            </div>
            <div class="cp-dog__body"><div class="cp-dog__tail" /></div>
            <div class="cp-dog__head"><div class="cp-dog__snout"><div class="cp-dog__eyes"><div class="cp-dog__eye-l" /><div class="cp-dog__eye-r" /></div></div></div>
            <div class="cp-dog__head-c"><div class="cp-dog__ear-r" /><div class="cp-dog__ear-l" /></div>
          </div>
        </div>
      </div>

      <p class="cp-flow__progress-label" role="status">{{ workflowFriendlyProgress }}</p>

      <div
        class="cp-wf-track"
        role="progressbar"
        :aria-valuenow="workflowPhasePercent ?? undefined"
        :aria-valuetext="workflowFriendlyProgress"
        aria-label="整体进度"
      >
        <div
          v-if="workflowPhasePercent != null"
          class="cp-wf-track__fill cp-wf-track__fill--value"
          :style="{ width: workflowPhasePercent + '%' }"
        />
        <div v-else :ref="workflowIndeterminateFillRef" class="cp-wf-track__fill cp-wf-track__fill--slide" />
      </div>
    </div>

    <div v-else class="cp-flow__inner cp-flow__inner--done">
      <p class="cp-flow__done-title">报告已就绪</p>
      <p class="cp-flow__done-desc">可以阅读完整职业规划内容。</p>
      <button type="button" class="cp-btn-main" @click="$emit('enter-report')">查看职业规划报告</button>
    </div>
  </main>
</template>

<script setup>
defineProps({
  workflowLaunched: { type: Boolean, required: true },
  workflowFinished: { type: Boolean, required: true },
  startBtnDisabled: { type: Boolean, required: true },
  hasAssessmentResult: { type: Boolean, required: true },
  workflowFriendlyProgress: { type: String, required: true },
  workflowPhasePercent: { type: Number, default: null },
  workflowAnimRootRef: { type: Object, default: null },
  workflowIndeterminateFillRef: { type: Object, default: null }
})

defineEmits(['start', 'enter-report'])
</script>

<style scoped>
.cp-panel { flex: 1; display: flex; flex-direction: column; min-height: calc(100vh - var(--cp-nav-offset)); box-sizing: border-box; }
.cp-immerse { position: relative; isolation: isolate; overflow-x: hidden; }
.cp-immerse__scene { position: absolute; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; }
.cp-immerse__gradient { position: absolute; inset: 0; background: var(--cp-bg); }
.cp-immerse__orb,.cp-immerse__grain { display: none; }
.cp-panel--workflow { position: relative; padding: 16px clamp(14px, 4vw, 36px) max(28px, env(safe-area-inset-bottom)); overflow: hidden; }
.cp-flow__inner { position: relative; z-index: 1; max-width: 560px; margin: 0 auto; width: 100%; }
.cp-flow__inner--idle { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 14px; }
.cp-flow__idle-title { margin: 0; font-size: clamp(1.35rem, 3vw, 1.85rem); font-weight: 800; letter-spacing: -0.02em; color: #0f172a; }
.cp-flow__idle-desc { margin: 0; max-width: 28em; font-size: 15px; line-height: 1.65; color: var(--cp-muted); }
.cp-flow__start-btn { margin-top: 8px; }
.cp-btn-main { display: inline-flex; align-items: center; justify-content: center; gap: 10px; padding: 14px 28px; border: none; border-radius: 12px; font-size: 15px; font-weight: 600; color: #fff; background: var(--cp-brand); cursor: pointer; box-shadow: 0 10px 28px rgba(37, 99, 235, 0.28); transition: background 0.2s, transform 0.15s, box-shadow 0.2s; }
.cp-btn-main:hover:not(:disabled) { background: var(--cp-brand-hover); transform: translateY(-1px); box-shadow: 0 14px 36px rgba(37, 99, 235, 0.32); }
.cp-flow__inner--cinema { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; flex: 1 1 auto; min-height: 0; width: 100%; gap: clamp(28px, 5vh, 48px); overflow: hidden; }
.cp-wf-back-glow { position: absolute; width: min(96vw, 780px); height: min(96vw, 780px); border-radius: 50%; left: 50%; top: 44%; transform: translate(-50%, -50%); filter: blur(42px); pointer-events: none; z-index: 0; }
.cp-wf-dog-wrap { position: relative; z-index: 1; display: flex; justify-content: center; align-items: center; margin: clamp(8px, 2vh, 24px) 0; transform: scale(1.12); transform-origin: center center; }
@media (max-width: 600px) { .cp-wf-dog-wrap { transform: scale(0.95); } }
.cp-dog-main { position: relative; width: 23.5vmax; height: 23.5vmax; display: flex; justify-content: center; align-items: center; }
.cp-dog-leg { position: absolute; bottom: 0; width: 2vmax; height: 2.125vmax; }
.cp-dog-paw { position: absolute; bottom: 2px; left: 0; width: 1.95vmax; height: 1.8vmax; overflow: hidden; }
.cp-dog-paw::before { content: ''; position: absolute; width: 5vmax; height: 3vmax; border-radius: 50%; }
.cp-dog-thigh { position: absolute; bottom: 0; left: 0.75vmax; height: 4.5vmax; width: 2.625vmax; border-top-left-radius: 1.425vmax; border-top-right-radius: 1.425vmax; transform-origin: bottom right; transform: rotateZ(90deg) translateX(-0.1vmax) translateY(1.5vmax); z-index: -1; background-image: linear-gradient(70deg, transparent 20%, #deac80 20%); }
.cp-dog { position: relative; width: 20vmax; height: 8vmax; }
.cp-dog::before { content: ''; position: absolute; bottom: -0.75vmax; right: -0.15vmax; width: 100%; height: 1.5vmax; background-color: #b5c18e; border-radius: 50%; z-index: -1000; animation: cp-dog-kf-shadow 10s cubic-bezier(0.3, 0.41, 0.18, 1.01) infinite; }
.cp-dog__head { position: absolute; left: 4.5vmax; bottom: 0; width: 8vmax; height: 5vmax; border-top-left-radius: 4.05vmax; border-top-right-radius: 4.05vmax; border-bottom-right-radius: 3.3vmax; border-bottom-left-radius: 3.3vmax; background-color: #deac80; animation: cp-dog-kf-head 10s cubic-bezier(0.3, 0.41, 0.18, 1.01) infinite; }
.cp-dog__head-c { position: absolute; left: 1.5vmax; bottom: 0; width: 9.75vmax; height: 8.25vmax; animation: cp-dog-kf-head 10s cubic-bezier(0.3, 0.41, 0.18, 1.01) infinite; z-index: -1; }
.cp-dog__snout { position: absolute; left: -1.5vmax; bottom: 0; width: 7.5vmax; height: 3.75vmax; border-top-right-radius: 3vmax; border-bottom-right-radius: 3vmax; border-bottom-left-radius: 4.5vmax; background-color: #f7dcb9; animation: cp-dog-kf-snout 10s cubic-bezier(0.3, 0.41, 0.18, 1.01) infinite; }
.cp-dog__snout::before { content: ''; position: absolute; left: -0.1125vmax; top: -0.15vmax; width: 1.875vmax; height: 1.125vmax; border-top-right-radius: 3vmax; border-bottom-right-radius: 3vmax; border-bottom-left-radius: 4.5vmax; background-color: #6c4e31; animation: cp-dog-kf-snout-b 10s cubic-bezier(0.3, 0.41, 0.18, 1.01) infinite; }
.cp-dog__eye-l,.cp-dog__eye-r { position: absolute; top: -0.9vmax; width: 0.675vmax; height: 0.375vmax; border-radius: 50%; background-color: #1c3130; animation: cp-dog-kf-eye 10s cubic-bezier(0.3, 0.41, 0.18, 1.01) infinite; }
.cp-dog__eye-l { left: 27%; } .cp-dog__eye-r { left: 65%; }
.cp-dog__ear-l,.cp-dog__ear-r { position: absolute; width: 5vmax; height: 3.3vmax; border-top-left-radius: 3.3vmax; border-top-right-radius: 3vmax; border-bottom-right-radius: 5vmax; border-bottom-left-radius: 5vmax; background-color: #deac80; }
.cp-dog__ear-l { top: 1.5vmax; left: 10vmax; transform-origin: bottom left; transform: rotateZ(-50deg); z-index: -1; animation: cp-dog-kf-ear-l 10s cubic-bezier(0.3, 0.41, 0.18, 1.01) infinite; }
.cp-dog__ear-r { top: 1.5vmax; right: 3vmax; transform-origin: bottom right; transform: rotateZ(25deg); z-index: -2; animation: cp-dog-kf-ear-r 10s cubic-bezier(0.3, 0.41, 0.18, 1.01) infinite; }
.cp-dog__body { display: flex; justify-content: center; align-items: flex-end; position: absolute; bottom: 0.3vmax; left: 6vmax; width: 18vmax; height: 4vmax; border-top-left-radius: 3vmax; border-top-right-radius: 6vmax; border-bottom-right-radius: 1.5vmax; border-bottom-left-radius: 6vmax; background-color: #914f1e; z-index: -2; animation: cp-dog-kf-body 10s cubic-bezier(0.3, 0.41, 0.18, 1.01) infinite; }
.cp-dog__tail { position: absolute; top: 20px; right: -1.5vmax; height: 3vmax; width: 4vmax; background-color: #914f1e; border-radius: 1.5vmax; }
.cp-dog__paws { position: absolute; bottom: 0; left: 7.5vmax; width: 10vmax; height: 3vmax; }
.cp-dog__bl-leg { left: -3vmax; z-index: -10; } .cp-dog__bl-paw::before { background-color: #fffbe6; } .cp-dog__bl-top { background-image: linear-gradient(80deg, transparent 20%, #deac80 20%); }
.cp-dog__fl-leg { z-index: 10; left: 0; } .cp-dog__fl-paw::before,.cp-dog__fr-paw::before { background-color: #fffbe6; } .cp-dog__fr-leg { right: 0; }
.cp-flow__progress-label { position: relative; z-index: 1; margin: 0; max-width: min(36em, 92vw); font-size: clamp(17px, 2.2vw + 12px, 24px); font-weight: 600; line-height: 1.55; color: rgba(15, 23, 42, 0.78); bottom: 20px; }
.cp-wf-track { position: relative; z-index: 1; width: min(88vw, 560px); height: clamp(10px, 1.2vw + 8px, 14px); border-radius: 999px; background: rgba(15, 23, 42, 0.08); overflow: hidden; transform: translateY(calc(-1 * clamp(28px, 6vh, 72px))); }
.cp-wf-track__fill { position: absolute; left: 0; top: 0; bottom: 0; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #8b5cf6, #7c3aed, #a855f7); box-shadow: 0 0 16px rgba(124, 58, 237, 0.35); }
.cp-wf-track__fill--value { transition: width 0.55s cubic-bezier(0.33, 1, 0.68, 1); }
.cp-wf-track__fill--slide { width: 44%; will-change: transform; }
.cp-flow__inner--done { text-align: center; padding: clamp(40px, 12vh, 100px) 16px; display: flex; flex-direction: column; align-items: center; gap: 16px; }
.cp-flow__done-title { margin: 0; font-size: clamp(1.4rem, 3vw, 1.9rem); font-weight: 800; color: #0f172a; }
.cp-flow__done-desc { margin: 0; font-size: 15px; color: var(--cp-muted); }
@keyframes cp-dog-kf-head { 0%,10%,20%,26%,28%,90%,100% { height: 8.25vmax; bottom: 0; transform-origin: bottom right; transform: rotateZ(0);} 5%,15%,22%,24%,30% { height: 8.1vmax;} 32%,50% { height: 8.25vmax;} 55%,60% { bottom: 0.75vmax; transform-origin: bottom right; transform: rotateZ(0);} 70%,80% { bottom: 0.75vmax; transform-origin: bottom right; transform: rotateZ(10deg);} }
@keyframes cp-dog-kf-body { 0%,10%,20%,26%,28%,32%,100% { height: 7.2vmax; } 5%,15%,22%,24%,30% { height: 7.05vmax; } }
@keyframes cp-dog-kf-ear-l { 0%,10%,20%,26%,28%,82%,100% { transform: rotateZ(-50deg);} 5%,15%,22%,24% { transform: rotateZ(-48deg);} 30%,31% { transform: rotateZ(-30deg);} 32%,80% { transform: rotateZ(-60deg);} }
@keyframes cp-dog-kf-ear-r { 0%,10%,20%,26%,28% { transform: rotateZ(20deg);} 5%,15%,22%,24% { transform: rotateZ(18deg);} 30%,31% { transform: rotateZ(10deg);} 32% { transform: rotateZ(25deg);} }
@keyframes cp-dog-kf-snout { 0%,10%,20%,26%,28%,82%,100% { height: 3.75vmax;} 5%,15%,22%,24% { height: 3.45vmax;} }
@keyframes cp-dog-kf-snout-b { 0%,10%,20%,26%,28%,98%,100% { width: 1.875vmax;} 5%,15%,22%,24% { width: 1.8vmax;} 34%,98% { width: 1.275vmax;} }
@keyframes cp-dog-kf-shadow { 0%,10%,20%,26%,28%,30%,84%,100% { width: 99%; } 5%,15%,22%,24% { width: 101%; } 34%,81% { width: 96%; } }
@keyframes cp-dog-kf-eye { 0%,30% { width: 0.675vmax; height: 0.3vmax; } 32%,59%,90%,100% { width: 0.525vmax; height: 0.525vmax; transform: translateY(0);} 60%,75% { transform: translateY(-0.3vmax);} 80%,85% { transform: translateY(0.15vmax);} }
</style>
