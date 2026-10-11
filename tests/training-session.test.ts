import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { effectScope } from 'vue'
import { useTrainingSession } from '../src/composables/useTrainingSession.ts'
import { trainings } from '../src/data/mock.ts'
import type { Training, RecordingData } from '../src/types/training.ts'

function audio(content: string): RecordingData {
  const blob = new Blob([content], { type: 'audio/webm' })
  return { blob, mimeType: blob.type, size: blob.size, durationMs: 1500 }
}

function setup(training: Training, t: { after: (fn: () => void) => void }) {
  const scope = effectScope()
  const result = scope.run(() => useTrainingSession(training))!
  t.after(() => scope.stop())
  result.start()
  return { ...result, scope }
}

test('psychological reading requires no answers and tracks explicit reading completion', t => {
  const training = trainings.find(item => item.id === 'expression')!
  assert.ok(training.questions.every(q => q.interaction === 'read'))
  const s = setup(training, t)
  assert.equal(s.finish(), null)
  assert.equal(s.confirm(), true)
  assert.equal(s.next(), true)
  assert.equal(s.session.progress.feelings?.completed, true)
  assert.deepEqual(s.session.answers, {})
  assert.equal(s.confirm(), true)
  assert.equal(s.next(), true)
  assert.equal(s.confirm(), true)
  const result = s.finish()!
  assert.equal(result.readingCount, 3)
  assert.equal(result.audioCount, 0)
  assert.equal(result.textCount, 0)
  assert.equal(s.finish(), null, 'duplicate completion is ignored')
})

test('soft palate mixes reading, practice and optional audio with explicit skip', t => {
  const training = trainings.find(item => item.id === 'soft-palate')!
  const s = setup(training, t)
  for (let i = 0; i < 3; i++) { assert.equal(s.confirm(), true); assert.equal(s.next(), true) }
  assert.equal(s.currentQuestion.value.interaction, 'audio')
  assert.equal(s.currentQuestion.value.required, false)
  assert.equal(s.confirm(), false)
  assert.equal(s.skip(), true)
  const result = s.finish()!
  assert.equal(result.questionCount, 4)
  assert.equal(result.readingCount, 1)
  assert.equal(result.practiceCount, 2)
  assert.equal(result.skippedCount, 1)
  assert.equal(result.audioCount, 0)
})

test('required audio blocks next and completion, while previous preserves per-question recordings', async t => {
  const training = trainings.find(item => item.id === 'picture-naming')!
  const s = setup(training, t)
  assert.equal(s.next(), false)
  assert.match(s.validationMessage.value, /完成本步录音/)
  s.setRecording('apple', audio('apple-one'))
  assert.equal(s.currentProgress.value.completed, true)
  assert.equal(s.next(), true)
  s.setRecording('cup', audio('cup-one'))
  s.previous()
  const original = s.currentAnswer.value
  assert.equal(original?.type, 'audio')
  if (original?.type === 'audio') assert.equal(await original.recording.blob.text(), 'apple-one')
  s.setRecording('apple', audio('apple-two'))
  s.setRecording('apple', audio('')) // Failed/empty recording never replaces a valid answer.
  assert.equal(s.currentProgress.value.completed, true)
  assert.equal(s.next(), true)
  const cup = s.currentAnswer.value
  if (cup?.type === 'audio') assert.equal(await cup.recording.blob.text(), 'cup-one')
  else assert.fail('second question must retain its own recording')
  for (let index = 1; index < 4; index++) {
    s.setRecording(training.questions[index]!.id, audio(`recording-${index}`))
    assert.equal(s.currentProgress.value.completed, true)
    assert.equal(s.next(), true)
  }
  assert.equal(s.finish(), null)
  s.setRecording('ball', audio('last'))
  assert.equal(s.finish()?.audioCount, 5)
  s.scope.stop()
  assert.deepEqual(s.session.answers, {})
})

test('text input validates trimmed content and is restored after navigation', t => {
  const base = trainings[0]!
  const training: Training = { ...base, id: 'text-fixture', questions: [
    { id: 'written', title: '文字题', instruction: '写一句话', interaction: 'text', required: true },
    { id: 'read', title: '阅读题', instruction: '阅读即可', interaction: 'read', required: false },
  ] }
  const s = setup(training, t)
  s.setText('written', '   ')
  assert.equal(s.next(), false)
  s.setText('written', '我可以慢慢说。')
  assert.equal(s.confirm(), true)
  assert.equal(s.next(), true)
  s.previous()
  assert.equal(s.currentAnswer.value?.type, 'text')
  if (s.currentAnswer.value?.type === 'text') assert.equal(s.currentAnswer.value.text, '我可以慢慢说。')
  s.setRecording('written', audio('wrong-type'))
  assert.equal(s.currentAnswer.value?.type, 'text', 'a recording cannot overwrite a text answer')
  s.next()
  s.confirm()
  assert.equal(s.finish()?.textCount, 1)
})

test('a new attempt starts empty and completion does not retain blobs', t => {
  const training = trainings.find(item => item.id === 'soft-palate')!
  const first = setup(training, t)
  for (let i = 0; i < 3; i++) { first.confirm(); first.next() }
  first.setRecording('recording', audio('hello'))
  const result = first.finish()!
  assert.equal(result.audioCount, 1)
  assert.equal('answers' in result, false)
  assert.equal(result.trainingVersion, training.version)
  const second = setup(training, t)
  assert.notEqual(second.session.id, first.session.id)
  assert.deepEqual(second.session.answers, {})
  assert.equal(second.session.currentIndex, 0)
})

test('both new trainings have five valid audio questions with unique IDs and local images', () => {
  assert.equal(new Set(trainings.map(item => item.id)).size, trainings.length)
  for (const training of trainings) {
    assert.equal(new Set(training.questions.map(q => q.id)).size, training.questions.length)
  }
  for (const id of ['picture-naming', 'text-reading']) {
    const training = trainings.find(item => item.id === id)!
    assert.equal(training.questions.length, 5)
    for (const q of training.questions) {
      assert.equal(q.interaction, 'audio')
      assert.equal(q.required, true)
      if (id === 'picture-naming') {
        assert.ok(q.image?.alt)
        assert.ok(existsSync(new URL('../public' + q.image!.src, import.meta.url)))
      } else assert.ok(q.text?.trim())
    }
  }
})

