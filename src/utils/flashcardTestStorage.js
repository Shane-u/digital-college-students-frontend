const NS = 'flashcard_test'

const safeJsonParse = (str, fallback) => {
  if (!str) return fallback
  try {
    return JSON.parse(str)
  } catch (_) {
    return fallback
  }
}

const keyOf = (flashcardId) => `${NS}:${String(flashcardId)}`
const resultKeyOf = (flashcardId) => `${NS}:result:${String(flashcardId)}`
const passKeyOf = (flashcardId) => `${NS}:pass:${String(flashcardId)}`
const testPointKeyOf = (flashcardId) => `${NS}:hasPoint:${String(flashcardId)}`
const paperKeyOf = (testId) => `${NS}:paper:${String(testId)}`
const latestTestKeyOf = (flashcardId) => `${NS}:latestTest:${String(flashcardId)}`

export function saveTestDraft(flashcardId, draft) {
  if (flashcardId == null) return
  localStorage.setItem(keyOf(flashcardId), JSON.stringify(draft ?? {}))
}

export function loadTestDraft(flashcardId) {
  if (flashcardId == null) return null
  return safeJsonParse(localStorage.getItem(keyOf(flashcardId)), null)
}

export function clearTestDraft(flashcardId) {
  if (flashcardId == null) return
  localStorage.removeItem(keyOf(flashcardId))
}

export function saveTestResult(flashcardId, result) {
  if (flashcardId == null) return
  localStorage.setItem(resultKeyOf(flashcardId), JSON.stringify(result ?? {}))
}

export function loadTestResult(flashcardId) {
  if (flashcardId == null) return null
  return safeJsonParse(localStorage.getItem(resultKeyOf(flashcardId)), null)
}

export function markFlashcardPassed(flashcardId, passed) {
  if (flashcardId == null) return
  if (passed) localStorage.setItem(passKeyOf(flashcardId), '1')
  else localStorage.removeItem(passKeyOf(flashcardId))
}

export function isFlashcardPassed(flashcardId) {
  if (flashcardId == null) return false
  return localStorage.getItem(passKeyOf(flashcardId)) === '1'
}

export function markHasTestPoint(flashcardId, hasPoint) {
  if (flashcardId == null) return
  if (hasPoint) localStorage.setItem(testPointKeyOf(flashcardId), '1')
  else localStorage.removeItem(testPointKeyOf(flashcardId))
}

export function hasTestPoint(flashcardId) {
  if (flashcardId == null) return false
  return localStorage.getItem(testPointKeyOf(flashcardId)) === '1'
}

export function saveFlashcardTestContext(flashcardId, ctx) {
  if (flashcardId == null) return
  try {
    sessionStorage.setItem(`${NS}:ctx:${String(flashcardId)}`, JSON.stringify(ctx ?? {}))
  } catch (_) {}
}

export function loadFlashcardTestContext(flashcardId) {
  if (flashcardId == null) return null
  try {
    return safeJsonParse(sessionStorage.getItem(`${NS}:ctx:${String(flashcardId)}`), null)
  } catch (_) {
    return null
  }
}

export function saveTestPaper(testId, paper) {
  if (testId == null) return
  try {
    sessionStorage.setItem(paperKeyOf(testId), JSON.stringify(paper ?? {}))
  } catch (_) {}
}

export function loadTestPaper(testId) {
  if (testId == null) return null
  try {
    return safeJsonParse(sessionStorage.getItem(paperKeyOf(testId)), null)
  } catch (_) {
    return null
  }
}

export function setLatestTestId(flashcardId, testId) {
  if (flashcardId == null) return
  if (testId == null) return
  try {
    localStorage.setItem(latestTestKeyOf(flashcardId), String(testId))
  } catch (_) {}
}

export function getLatestTestId(flashcardId) {
  if (flashcardId == null) return null
  const v = localStorage.getItem(latestTestKeyOf(flashcardId))
  return v || null
}

