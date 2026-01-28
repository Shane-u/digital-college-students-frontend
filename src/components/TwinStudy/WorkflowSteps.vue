<template>
  <div v-if="workflow && workflow.nodes" class="workflow-steps">
    <div class="workflow-container">
      <div 
        v-for="(node, index) in workflow.nodes"
        :key="node.id"
        class="workflow-item"
      >
        <div class="workflow-node-wrapper">
          <div 
            :class="['workflow-node', {
              'active': node.id === currentNodeId,
              'done': isNodeDone(node.id, index)
            }]"
          >
            <img 
              v-if="getIconUrl(node)"
              :src="getIconUrl(node)"
              :alt="node.data?.config?.title"
              :class="['workflow-icon', {
                'inverted': node.id === currentNodeId || isNodeDone(node.id, index)
              }]"
            />
            <div v-else class="workflow-dot"></div>
          </div>
          <span 
            :class="['workflow-label', {
              'active': node.id === currentNodeId
            }]"
          >
            {{ node.data?.config?.title }}
          </span>
          <div 
            v-if="index < workflow.nodes.length - 1"
            :class="['workflow-connector', {
              'done': isNodeDone(node.id, index)
            }]"
          ></div>
          <div class="workflow-tooltip">
            {{ node.data?.config?.desc || node.data?.config?.title }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const BASE_IMG_URL = 'https://bailian.cdut.edu.cn'

const props = defineProps({
  workflow: {
    type: Object,
    required: true
  },
  currentNodeId: {
    type: String,
    default: ''
  }
})

const getIconUrl = (node) => {
  const icon = node.data?.config?.icon
  if (!icon) return null
  if (icon.startsWith('/')) {
    return `${BASE_IMG_URL}${icon}`
  }
  return icon
}

const isNodeDone = (nodeId, index) => {
  if (!props.currentNodeId) return false
  const currentIndex = props.workflow.nodes.findIndex(n => n.id === props.currentNodeId)
  return currentIndex > index
}
</script>

<style scoped>
.workflow-steps {
  width: 100%;
  margin: 16px 0;
  padding: 16px;
  background: #f8fafd;
  border-radius: 16px;
  border: 1px solid #edf2f7;
  overflow-x: auto;
}

.workflow-container {
  display: flex;
  align-items: center;
  gap: 0;
  min-width: max-content;
}

.workflow-item {
  display: flex;
  align-items: center;
}

.workflow-node-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  max-width: 120px;
}

.workflow-node {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  border: 2px solid;
  z-index: 10;
}

.workflow-node.active {
  background: #2563eb;
  border-color: #2563eb;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
  transform: scale(1.1);
}

.workflow-node.done {
  background: #10b981;
  border-color: #10b981;
}

.workflow-node:not(.active):not(.done) {
  background: white;
  border-color: #e5e7eb;
  opacity: 0.6;
}

.workflow-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.workflow-icon.inverted {
  filter: brightness(0) invert(1);
}

.workflow-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #9ca3af;
}

.workflow-node.active .workflow-dot,
.workflow-node.done .workflow-dot {
  background: white;
}

.workflow-label {
  margin-top: 8px;
  font-size: 11px;
  font-weight: 500;
  text-align: center;
  color: #6b7280;
  width: 100%;
  padding: 0 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.workflow-label.active {
  color: #2563eb;
}

.workflow-connector {
  height: 2px;
  width: 32px;
  margin-top: -20px;
  transition: background-color 0.5s;
  background: #e5e7eb;
}

.workflow-connector.done {
  background: #10b981;
}

.workflow-tooltip {
  position: absolute;
  top: -48px;
  left: 50%;
  transform: translateX(-50%);
  background: #1f1f1f;
  color: white;
  font-size: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
  white-space: nowrap;
  z-index: 20;
}

.workflow-node-wrapper:hover .workflow-tooltip {
  opacity: 1;
}
</style>
