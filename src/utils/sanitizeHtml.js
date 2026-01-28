/**
 * Lightweight HTML sanitizer (no external deps).
 * Goal: prevent obvious XSS vectors for any v-html usage.
 * Note: This is not as exhaustive as DOMPurify, but it's a meaningful baseline.
 */
export function sanitizeHtml(inputHtml) {
  if (!inputHtml || typeof inputHtml !== 'string') return ''

  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(inputHtml, 'text/html')

    // Remove dangerous elements
    const blockedTags = [
      'script',
      'style',
      'iframe',
      'object',
      'embed',
      'link',
      'meta',
      'base'
    ]
    blockedTags.forEach((tag) => {
      doc.querySelectorAll(tag).forEach((el) => el.remove())
    })

    // Remove dangerous attributes + javascript: URLs
    const treeWalker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT)
    let node = treeWalker.currentNode

    while (node) {
      const el = node
      // Clone attr list first because we mutate during iteration
      const attrs = Array.from(el.attributes || [])
      for (const attr of attrs) {
        const name = (attr.name || '').toLowerCase()
        const value = (attr.value || '').trim()

        // onClick / onerror / etc
        if (name.startsWith('on')) {
          el.removeAttribute(attr.name)
          continue
        }

        // href/src="javascript:..."
        if ((name === 'href' || name === 'src' || name === 'xlink:href') && /^javascript:/i.test(value)) {
          el.removeAttribute(attr.name)
          continue
        }

        // style can contain url(javascript:...) in old browsers; we drop it to be safe
        if (name === 'style') {
          el.removeAttribute(attr.name)
          continue
        }
      }

      node = treeWalker.nextNode()
    }

    return doc.body?.innerHTML || ''
  } catch (e) {
    // If DOMParser is not available (very old env), fall back to escaping.
    const div = document.createElement('div')
    div.textContent = inputHtml
    return div.innerHTML
  }
}

