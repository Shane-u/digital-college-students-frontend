import request from './request'

// FlashCard API (baseURL is /api in request.js)
export const flashCardApi = {
  list() {
    return request.get('/flash-card/list')
  },
  reviewList() {
    return request.get('/flash-card/review-list')
  },
  review(id, difficultyLevel) {
    return request.post('/flash-card/review', { id, difficultyLevel })
  },
  generate(originalContent) {
    return request.post('/flash-card/generate', { originalContent })
  },
  status(flashCardId) {
    return request.get('/flash-card/status', { params: { flashCardId } })
  },
  update(payload) {
    // { id, title, content, htmlContent }
    return request.post('/flash-card/update', payload)
  },
  aiAssist(id, prompt) {
    return request.post('/flash-card/ai-assist', { id, prompt })
  },
  delete(id) {
    return request.post('/flash-card/delete', { id })
  }
}

