import { computed, shallowRef } from 'vue'
import type { CompletionSummary, QuestionAnswer, StepProgress, Training, TrainingRecord } from '../types/training'

/** Copy template and answer metadata. Blobs are immutable and may be safely shared. */
export function createTrainingRecord(
  training: Training,
  summary: CompletionSummary,
  answers: Record<string, QuestionAnswer>,
  progress: Record<string, StepProgress>,
): TrainingRecord {
  if (summary.trainingId !== training.id || summary.trainingVersion !== training.version) {
    throw new Error('Training result does not match its template')
  }
  return {
    ...summary, id: summary.sessionId, source: 'session',
    training: { title: training.title, category: training.category, goal: training.goal, summary: training.summary },
    items: training.questions.map(question => {
      const original = question.interaction === 'read' || question.interaction === 'practice' ? undefined : answers[question.id]
      const answer = original?.type === 'audio'
        ? { ...original, recording: { ...original.recording } }
        : original ? { ...original } : undefined
      return {
        question: { ...question, image: question.image ? { ...question.image } : undefined },
        progress: { ...progress[question.id]! },
        ...(answer ? { answer } : {}),
      }
    }),
  }
}

/** Root-owned state: no persistence, network calls or long-lived object URLs. */
export function useTrainingRecords(mockRecords: TrainingRecord[] = []) {
  const sessionRecords = shallowRef<TrainingRecord[]>([])
  const historicalRecords = [...mockRecords].sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt))
  const records = computed(() => [...sessionRecords.value, ...historicalRecords])
  function addRecord(record: TrainingRecord) {
    if (record.source !== 'session' || records.value.some(item => item.id === record.id)) return
    sessionRecords.value = [...sessionRecords.value, record].sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt))
  }
  function getRecord(id: string) { return records.value.find(record => record.id === id) }
  return { sessionRecords, historicalRecords, records, addRecord, getRecord }
}
