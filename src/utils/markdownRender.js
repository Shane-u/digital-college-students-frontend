import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true
})

/**
 * 将 Markdown 文本转为安全 HTML，供 v-html 或直接 innerHTML 使用。
 * 与 MessageList 中渲染逻辑一致，支持流式未闭合代码块。
 */
export function renderMarkdownToHtml(text) {
  if (!text) return ''
  try {
    const cleanedText = String(text).replace(/<details>[\s\S]*?<\/details>/gi, '')
    const textToProcess = cleanedText.endsWith('\n') ? cleanedText : cleanedText + '\n'
    let finalHtml = ''
    const codeBlockMarker = '```'
    const codeBlockCount = (textToProcess.match(/```/g) || []).length

    if (codeBlockCount % 2 !== 0) {
      const lastIdx = textToProcess.lastIndexOf(codeBlockMarker)
      if (lastIdx !== -1) {
        const before = textToProcess.substring(0, lastIdx)
        const fragment = textToProcess.substring(lastIdx)
        finalHtml += md.render(before.endsWith('\n') ? before : before + '\n')
        const div = document.createElement('div')
        div.textContent = fragment
        finalHtml += `<pre class="streaming-code-fragment">${div.innerHTML}</pre>`
      } else {
        finalHtml += md.render(textToProcess)
      }
    } else {
      finalHtml += md.render(textToProcess)
    }
    return DOMPurify.sanitize(finalHtml)
  } catch (e) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }
}
