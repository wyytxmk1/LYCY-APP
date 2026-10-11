export type InteractionType = 'audio' | 'text' | 'read' | 'practice'

export interface TrainingQuestion {
  id: string
  title: string
  text?: string
  image?: { src: string; alt: string }
  instruction: string
  interaction: InteractionType
  required: boolean
}

export interface Training {
  id: string
  version: number
  title: string
  category: string
  duration: number
  format: string
  summary: string
  goal: string
  preparation: string
  /** Array order is the presentation order; IDs remain stable when reordering. */
  questions: TrainingQuestion[]
}

export interface RecordingData {
  blob: Blob
  mimeType: string
  size: number
  durationMs: number
}

export type QuestionAnswer = {
  questionId: string
  updatedAt: string
} & (
  | { type: 'text'; text: string }
  | { type: 'audio'; recording: RecordingData }
)

export interface StepProgress {
  completed: boolean
  skipped: boolean
  confirmedAt: string | null
}

/** An in-memory attempt, separate from the versioned content template. */
export interface TrainingSession {
  id: string
  trainingId: string
  trainingVersion: number
  startedAt: string | null
  completedAt: string | null
  currentIndex: number
  answers: Record<string, QuestionAnswer>
  progress: Record<string, StepProgress>
}

/** Lightweight statistics; the record separately retains question/answer snapshots. */
export interface CompletionSummary {
  sessionId: string
  trainingId: string
  trainingVersion: number
  startedAt: string
  completedAt: string
  questionCount: number
  audioCount: number
  textCount: number
  readingCount: number
  practiceCount: number
  completedCount: number
  skippedCount: number
}

export interface TrainingRecord extends CompletionSummary {
  /** One ID per attempt, independent of the training template ID. */
  id: string
  source: 'session' | 'mock'
  training: Pick<Training, 'title' | 'category' | 'goal' | 'summary'>
  items: { question: TrainingQuestion; progress: StepProgress; answer?: QuestionAnswer }[]
}
