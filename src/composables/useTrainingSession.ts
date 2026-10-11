import { computed, onScopeDispose, reactive, ref } from 'vue'
import type { CompletionSummary, RecordingData, Training, TrainingSession } from '../types/training'

export function useTrainingSession(training: Training) {
  const session = reactive<TrainingSession>({
    id: globalThis.crypto?.randomUUID?.() ?? `session-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    trainingId: training.id, trainingVersion: training.version,
    startedAt: null, completedAt: null, currentIndex: 0, answers: {},
    progress: Object.fromEntries(training.questions.map(q => [q.id, { completed: false, skipped: false, confirmedAt: null }])),
  })
  const validationMessage = ref('')
  const currentQuestion = computed(() => training.questions[session.currentIndex])
  const currentAnswer = computed(() => currentQuestion.value ? session.answers[currentQuestion.value.id] : undefined)
  const currentProgress = computed(() => currentQuestion.value ? session.progress[currentQuestion.value.id] : undefined)

  function start() { session.startedAt ??= new Date().toISOString() }
  function invalidate(questionId: string) {
    session.progress[questionId] = { completed: false, skipped: false, confirmedAt: null }
    validationMessage.value = ''
  }
  function setText(questionId: string, text: string) {
    if (session.completedAt || !training.questions.some(q => q.id === questionId && q.interaction === 'text')) return
    session.answers[questionId] = { questionId, type: 'text', text, updatedAt: new Date().toISOString() }
    invalidate(questionId)
  }
  function setRecording(questionId: string, recording: RecordingData) {
    if (session.completedAt || !recording.blob.size || !training.questions.some(q => q.id === questionId && q.interaction === 'audio')) return
    session.answers[questionId] = { questionId, type: 'audio', recording, updatedAt: new Date().toISOString() }
    session.progress[questionId] = { completed: true, skipped: false, confirmedAt: new Date().toISOString() }
    validationMessage.value = ''
  }
  function confirm() {
    const question = currentQuestion.value
    if (!question || session.completedAt || !session.startedAt || question.interaction === 'audio') return false
    const answer = currentAnswer.value
    if (question.interaction === 'text' && (answer?.type !== 'text' || !answer.text.trim())) {
      validationMessage.value = '请先输入文字，再提交答案。'
      return false
    }
    // Reading and practice only change progress; they never create an answer.
    session.progress[question.id] = { completed: true, skipped: false, confirmedAt: new Date().toISOString() }
    validationMessage.value = ''
    return true
  }
  function skip() {
    const question = currentQuestion.value
    if (!question || session.completedAt || question.required || !['audio', 'text'].includes(question.interaction)) return false
    delete session.answers[question.id]
    session.progress[question.id] = { completed: false, skipped: true, confirmedAt: new Date().toISOString() }
    validationMessage.value = ''
    return true
  }
  function validate(index: number) {
    const question = training.questions[index]
    if (!question) return false
    const progress = session.progress[question.id]
    if (progress?.completed || (progress?.skipped && !question.required)) return true
    const action = { audio: '完成本步录音', text: '提交文字答案', read: '点击「我已阅读」', practice: '点击「我已完成练习」' }[question.interaction]
    validationMessage.value = `请先${action}，再继续。`
    return false
  }
  function previous() {
    if (session.completedAt) return
    if (session.currentIndex > 0) session.currentIndex--
    validationMessage.value = ''
  }
  function next() {
    if (session.completedAt || session.currentIndex >= training.questions.length - 1 || !validate(session.currentIndex)) return false
    session.currentIndex++
    validationMessage.value = ''
    return true
  }
  function finish(): CompletionSummary | null {
    if (!session.startedAt || session.completedAt || session.currentIndex !== training.questions.length - 1) return null
    for (let index = 0; index < training.questions.length; index++) {
      if (!validate(index)) { session.currentIndex = index; return null }
    }
    session.completedAt = new Date().toISOString()
    const completed = training.questions.filter(q => session.progress[q.id]?.completed)
    return {
      sessionId: session.id, trainingId: session.trainingId, trainingVersion: session.trainingVersion,
      startedAt: session.startedAt, completedAt: session.completedAt, questionCount: training.questions.length,
      audioCount: completed.filter(q => q.interaction === 'audio').length,
      textCount: completed.filter(q => q.interaction === 'text').length,
      readingCount: completed.filter(q => q.interaction === 'read').length,
      practiceCount: completed.filter(q => q.interaction === 'practice').length,
      completedCount: completed.length,
      skippedCount: training.questions.filter(q => session.progress[q.id]?.skipped).length,
    }
  }
  onScopeDispose(() => { session.answers = {}; session.progress = {} })
  return { session, currentQuestion, currentAnswer, currentProgress, validationMessage, start, setText, setRecording, confirm, skip, previous, next, finish }
}
