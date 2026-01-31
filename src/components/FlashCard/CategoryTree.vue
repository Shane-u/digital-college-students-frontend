<template>
  <div class="category-tree">
    <div 
      v-for="(node, index) in tree"
      :key="index"
      class="category-node"
    >
      <div 
        class="category-item"
        :class="{ 
          'selected': isSelected(node),
          'has-children': node.children && node.children.length > 0
        }"
        @click="toggleNode(node)"
      >
        <span class="category-expand" v-if="node.children && node.children.length > 0">
          {{ expandedNodes.has(node.id) ? '−' : '+' }}
        </span>
        <span class="category-label">{{ node.label }}</span>
      </div>
      <div 
        v-if="node.children && node.children.length > 0 && expandedNodes.has(node.id)"
        class="category-children"
      >
        <CategoryTree 
          :tree="node.children"
          :selected-path="selectedPath"
          @select="handleChildSelect"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  tree: {
    type: Array,
    default: () => []
  },
  selectedPath: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['select'])

const expandedNodes = ref(new Set())

const isSelected = (node) => {
  return props.selectedPath.includes(node.id)
}

const toggleNode = (node) => {
  if (node.children && node.children.length > 0) {
    if (expandedNodes.value.has(node.id)) {
      expandedNodes.value.delete(node.id)
    } else {
      expandedNodes.value.add(node.id)
    }
  } else {
    // 叶子节点，选择它
    const path = getPathToNode(node)
    emit('select', path)
  }
}

const getPathToNode = (node) => {
  // 需要构建从根到当前节点的完整路径
  // 这里简化处理，实际应该递归查找父节点
  const path = []
  const findPath = (tree, targetId, currentPath = []) => {
    for (const item of tree) {
      const newPath = [...currentPath, item.id]
      if (item.id === targetId) {
        return newPath
      }
      if (item.children && item.children.length > 0) {
        const found = findPath(item.children, targetId, newPath)
        if (found) return found
      }
    }
    return null
  }
  const foundPath = findPath(props.tree, node.id)
  return foundPath || [node.id]
}

const handleChildSelect = (path) => {
  emit('select', path)
}
</script>

<style scoped>
.category-tree {
  padding-left: 0;
}

.category-node {
  margin-bottom: 4px;
}

.category-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  gap: 8px;
}

.category-item:hover {
  background: #f1f5f9;
}

.category-item.selected {
  background: #ede9fe;
  color: #4f46e5;
  font-weight: 700;
}

.category-expand {
  width: 20px;
  text-align: center;
  font-weight: 900;
  color: #94a3b8;
}

.category-label {
  flex: 1;
  font-size: 14px;
}

.category-children {
  padding-left: 24px;
  margin-top: 4px;
}
</style>

