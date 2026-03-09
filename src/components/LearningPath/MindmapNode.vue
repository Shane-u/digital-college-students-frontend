<template>
  <div class="mindmap-node" :data-depth="depth">
    <div class="mindmap-node-card" :class="{ 'is-start': item.node.isStart }">
      <span class="mindmap-node-name">{{ item.node.name || item.node.label || '未命名' }}</span>
      <span v-if="item.node.testPointsProgress" class="mindmap-node-meta">{{ item.node.testPointsProgress }}</span>
    </div>
    <div v-if="item.children.length" class="mindmap-children">
      <div v-for="(child, i) in item.children" :key="child.node.nodeId || i" class="mindmap-child-wrap">
        <div class="mindmap-connector"></div>
        <MindmapNode :item="child" :depth="depth + 1" />
      </div>
    </div>
  </div>
</template>

<script setup>
import MindmapNode from './MindmapNode.vue'

defineProps({
  item: { type: Object, required: true },
  depth: { type: Number, default: 0 }
})
</script>

<style scoped>
.mindmap-node {
  position: relative;
}

.mindmap-node-card {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 10px 14px;
  background: #fff;
  border-radius: 10px;
  border: 1px solid rgba(147, 51, 234, 0.18);
  box-shadow: 0 1px 4px rgba(147, 51, 234, 0.06);
  transition: box-shadow 0.2s, border-color 0.2s;
}

.mindmap-node-card:hover {
  border-color: rgba(147, 51, 234, 0.35);
  box-shadow: 0 2px 10px rgba(147, 51, 234, 0.12);
}

.mindmap-node-card.is-start {
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(147, 51, 234, 0.04) 100%);
  border-color: rgba(124, 58, 237, 0.3);
}

.mindmap-node-name {
  font-size: 14px;
  font-weight: 500;
  color: #1f1f1f;
}

.mindmap-node-meta {
  font-size: 12px;
  color: #6b7280;
}

.mindmap-children {
  margin-top: 8px;
  margin-left: 20px;
  padding-left: 16px;
  border-left: 2px solid rgba(147, 51, 234, 0.2);
}

.mindmap-child-wrap {
  position: relative;
  margin-bottom: 6px;
}

.mindmap-child-wrap:last-child {
  margin-bottom: 0;
}

.mindmap-connector {
  position: absolute;
  left: -18px;
  top: 18px;
  width: 14px;
  height: 2px;
  background: linear-gradient(90deg, rgba(147, 51, 234, 0.35), rgba(147, 51, 234, 0.15));
}
</style>
