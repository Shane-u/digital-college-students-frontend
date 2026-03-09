<template>
  <div class="mindmap-wrap">
    <div v-if="tree.length === 0" class="mindmap-empty">暂无节点</div>
    <div v-else class="mindmap-tree">
      <MindmapNode
        v-for="(item, idx) in tree"
        :key="item.node.nodeId || idx"
        :item="item"
        :depth="0"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { buildPathTree } from '../../utils/learningPathJson'
import MindmapNode from './MindmapNode.vue'

const props = defineProps({
  pathJson: {
    type: Object,
    default: () => ({ nodes: [] })
  }
})

const tree = computed(() => buildPathTree(props.pathJson?.nodes || []))
</script>

<style scoped>
.mindmap-wrap {
  min-height: 120px;
  padding: 12px 0;
}

.mindmap-empty {
  color: #9ca3af;
  font-size: 14px;
  text-align: center;
  padding: 24px;
}

.mindmap-tree {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
