<template>
  <div
    class="voice-wave-wrap"
    :class="{ muted: isMuted, speaking: isSpeaking && !isMuted }"
    :style="{
      '--energy': energy.toFixed(3),
      '--glow-alpha': glowAlpha.toFixed(3)
    }"
  >
    <div class="wave-shimmer"></div>
    <svg class="voice-wave-svg" viewBox="0 0 96 32" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="waveGlowA" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#7dd3fc" />
          <stop offset="50%" stop-color="#6366f1" />
          <stop offset="100%" stop-color="#a855f7" />
        </linearGradient>
        <linearGradient id="waveGlowB" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#93c5fd" />
          <stop offset="55%" stop-color="#818cf8" />
          <stop offset="100%" stop-color="#c084fc" />
        </linearGradient>
      </defs>
      <path class="wave-shadow" :d="pathA" />
      <path class="wave-shadow secondary" :d="pathB" />
      <path class="wave-line" :d="pathA" stroke="url(#waveGlowA)" />
      <path class="wave-line secondary" :d="pathB" stroke="url(#waveGlowB)" />
    </svg>
    <span class="wave-core"></span>
  </div>
</template>

<script>
import { computed, onMounted, onUnmounted, ref } from 'vue';

export default {
  name: 'VoiceWaveVisualizer',
  props: {
    volume: {
      type: Number,
      default: 0
    },
    isSpeaking: {
      type: Boolean,
      default: false
    },
    isMuted: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const phase = ref(0);
    let raf = null;
    const width = 96;
    const centerY = 16;
    const step = 3;

    const safeVolume = computed(() => Math.max(0, Math.min(1, props.volume || 0)));
    const energy = computed(() => {
      if (props.isMuted) return 0.08;
      if (!props.isSpeaking) return 0.12 + safeVolume.value * 0.2;
      return 0.28 + safeVolume.value * 0.72;
    });
    const glowAlpha = computed(() => {
      if (props.isMuted) return 0.14;
      return 0.24 + energy.value * 0.52;
    });
    const baseAmp = computed(() => {
      if (props.isMuted) return 0.8;
      if (!props.isSpeaking) return 1.2;
      return 2.4 + safeVolume.value * 8.8;
    });

    const buildPath = (offset = 0) => {
      const amp = baseAmp.value;
      const pts = [];
      for (let x = 0; x <= width; x += step) {
        const p = phase.value + offset + x * 0.22;
        const envelope = 0.58 + 0.42 * Math.sin(x * 0.08 + phase.value * 0.4);
        const y = centerY + Math.sin(p) * amp * envelope;
        pts.push(`${x},${Math.max(3, Math.min(29, y)).toFixed(2)}`);
      }
      return `M${pts.join(' L')}`;
    };

    const pathA = computed(() => buildPath(0));
    const pathB = computed(() => buildPath(1.7));

    const animate = () => {
      const speed = props.isMuted ? 0.05 : props.isSpeaking ? 0.22 + safeVolume.value * 0.18 : 0.11;
      phase.value += speed;
      raf = requestAnimationFrame(animate);
    };

    onMounted(() => {
      raf = requestAnimationFrame(animate);
    });

    onUnmounted(() => {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
    });

    return {
      pathA,
      pathB,
      energy,
      glowAlpha
    };
  }
};
</script>

<style scoped>
.voice-wave-wrap {
  width: 84px;
  height: 30px;
  border-radius: 16px;
  padding: 0 6px;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(120% 140% at 50% 50%, rgba(99, 102, 241, calc(var(--glow-alpha) * 0.32)) 0%, rgba(99, 102, 241, 0) 72%),
    linear-gradient(135deg, rgba(79, 70, 229, 0.16), rgba(147, 51, 234, 0.24));
  box-shadow:
    inset 0 0 14px rgba(99, 102, 241, calc(var(--glow-alpha) * 0.95)),
    0 6px 16px rgba(79, 70, 229, calc(var(--glow-alpha) * 0.8));
  backdrop-filter: blur(5px);
  transition: box-shadow 0.18s ease, opacity 0.18s ease, filter 0.18s ease, transform 0.18s ease;
}

.voice-wave-wrap.speaking {
  box-shadow:
    inset 0 0 16px rgba(99, 102, 241, calc(var(--glow-alpha) * 1.1)),
    0 8px 18px rgba(99, 102, 241, calc(var(--glow-alpha) * 0.95));
  transform: translateZ(0) scale(1.02);
}

.voice-wave-wrap.muted {
  opacity: 0.55;
  filter: saturate(0.65);
}

.voice-wave-svg {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  display: block;
}

.wave-shimmer {
  position: absolute;
  top: 4px;
  left: -20%;
  width: 24%;
  height: 22px;
  z-index: 1;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.42), rgba(255, 255, 255, 0));
  filter: blur(0.4px);
  animation: shimmerMove 2.2s linear infinite;
  opacity: calc(0.24 + var(--energy) * 0.46);
}

.wave-line {
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  filter: drop-shadow(0 0 3px rgba(129, 140, 248, 0.5));
}

.wave-line.secondary {
  stroke-width: 1.45;
  opacity: 0.58;
}

.wave-shadow {
  fill: none;
  stroke: rgba(99, 102, 241, 0.28);
  stroke-width: 4.8;
  stroke-linecap: round;
  filter: blur(1.2px);
}

.wave-shadow.secondary {
  stroke: rgba(168, 85, 247, 0.18);
  stroke-width: 3.8;
}

.wave-core {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 3;
  width: calc(3px + var(--energy) * 7px);
  height: calc(3px + var(--energy) * 7px);
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #fff 0%, #93c5fd 45%, #818cf8 100%);
  box-shadow:
    0 0 calc(3px + var(--energy) * 7px) rgba(147, 197, 253, calc(0.25 + var(--energy) * 0.45)),
    0 0 calc(8px + var(--energy) * 14px) rgba(129, 140, 248, calc(0.15 + var(--energy) * 0.38));
}

@keyframes shimmerMove {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(520%);
  }
}
</style>
