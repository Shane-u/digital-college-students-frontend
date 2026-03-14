<template>
  <div class="coding">
    <div class="lang-row">
      <div class="pill">{{ languageLabel }}</div>
    </div>
    <div ref="editorContainer" class="monaco-wrapper"></div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  language: { type: String, default: 'javascript' },
  placeholder: { type: String, default: '在这里编写你的代码…' }
})
const emit = defineEmits(['update:modelValue'])

const languageLabel = computed(() => {
  const map = { javascript: 'JavaScript', typescript: 'TypeScript', java: 'Java', python: 'Python', c: 'C', cpp: 'C++' }
  return map[props.language] || String(props.language || 'Code')
})

const editorContainer = ref(null)
let editor = null
let monaco = null

const monacoLanguageMap = {
  javascript: 'javascript',
  typescript: 'typescript',
  java: 'java',
  python: 'python',
  c: 'c',
  cpp: 'cpp'
}

onMounted(async () => {
  if (!editorContainer.value) return
  monaco = await import('monaco-editor')
  const lang = monacoLanguageMap[props.language] || 'javascript'
  editor = monaco.editor.create(editorContainer.value, {
    value: props.modelValue || '',
    language: lang,
    theme: 'vs',
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 13,
    lineHeight: 22,
    padding: { top: 14 },
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    // 提示框使用固定定位，避免被父级 overflow 裁剪
    fixedOverflowWidgets: true,
    // 代码提示（IntelliSense）
    quickSuggestions: { other: true, comments: false, strings: true },
    suggestOnTriggerCharacters: true,
    acceptSuggestionOnCommitCharacter: true,
    wordBasedSuggestions: 'matchingDocuments',
    parameterHints: { enabled: true },
    suggest: { showKeywords: true, showSnippets: true },
    tabSize: 2,
    insertSpaces: true
  })
  editor.onDidChangeModelContent(() => {
    emit('update:modelValue', editor.getValue())
  })
  // 外部 modelValue 变化时同步到编辑器（如加载草稿）
  watch(() => props.modelValue, (val) => {
    if (editor && editor.getValue() !== (val || '')) {
      editor.setValue(val || '')
    }
  })
})

onBeforeUnmount(() => {
  if (editor) {
    editor.dispose()
    editor = null
  }
})
</script>

<style scoped>
.lang-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.pill {
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 900;
  color: #4f46e5;
  background: rgba(238, 242, 255, 0.9);
  border: 1px solid rgba(129, 140, 248, 0.35);
}

.monaco-wrapper {
  width: 100%;
  min-height: 220px;
  border-radius: 16px;
  overflow: visible;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  transition: box-shadow 0.18s ease, border-color 0.18s ease;
}

.monaco-wrapper:focus-within {
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.25);
  border-color: rgba(129, 140, 248, 0.5);
}
</style>
