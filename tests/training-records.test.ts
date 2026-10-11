import { test } from 'node:test'
import assert from 'node:assert/strict'
import { effectScope } from 'vue'
import { useTrainingSession } from '../src/composables/useTrainingSession.ts'
import { createTrainingRecord, useTrainingRecords } from '../src/composables/useTrainingRecords.ts'
import { createMockRecords } from '../src/data/mockRecords.ts'
import { formatRecordDuration, formatRecordTime } from '../src/utils/recordFormat.ts'
import type { Training, RecordingData } from '../src/types/training.ts'

function fixture(): Training {
  return {
    id: 'mixed', version: 2, title: '混合训练', category: '测试', duration: 3, format: '4 步', summary: '摘要', goal: '目标', preparation: '准备',
    questions: [
      { id: 'r', title: '阅读', instruction: '请阅读', interaction: 'read', required: true },
      { id: 'p', title: '练习', instruction: '请练习', interaction: 'practice', required: true },
      { id: 't', title: '文字', instruction: '请填写', interaction: 'text', required: true },
      { id: 'a', title: '录音', instruction: '请录音', interaction: 'audio', required: true, image: { src: '/old.svg', alt: '旧图片' } },
    ],
  }
}
function audio(value = 'recorded speech'): RecordingData {
  const blob = new Blob([value], { type: 'audio/webm' })
  return { blob, size: blob.size, mimeType: blob.type, durationMs: 1234 }
}
function setup(t: { after: (fn: () => void) => void }, training = fixture()) {
  const scope = effectScope()
  const s = scope.run(() => useTrainingSession(training))!
  t.after(() => scope.stop())
  s.start()
  return { ...s, scope, training }
}
function finishMixed(s: ReturnType<typeof setup>) {
  s.confirm(); s.next(); s.confirm(); s.next()
  s.setText('t', '真实文字答案'); s.confirm(); s.next()
  s.setRecording('a', audio())
  return createTrainingRecord(s.training, s.finish()!, s.session.answers, s.session.progress)
}

test('audio completes automatically while text, reading and practice still require confirmation', t => {
  const s = setup(t)
  assert.equal(s.next(), false)
  assert.match(s.validationMessage.value, /我已阅读/)
  s.confirm(); s.next()
  assert.equal(s.next(), false)
  assert.match(s.validationMessage.value, /我已完成练习/)
  s.confirm(); s.next()
  assert.deepEqual(s.session.answers, {})
  assert.ok(s.session.progress.r.completed)
  assert.ok(s.session.progress.p.completed)
  s.setText('t', '第一次答案')
  assert.equal(s.next(), false)
  assert.equal(s.confirm(), true)
  s.setText('t', '修改后的答案')
  assert.equal(s.session.progress.t.completed, false)
  assert.equal(s.next(), false)
  s.confirm(); s.next()
  assert.equal(s.finish(), null)
  s.setRecording('a', audio('one'))
  assert.equal(s.session.progress.a.completed, true)
  s.setRecording('a', audio('two'))
  assert.equal(s.session.progress.a.completed, true)
  assert.equal(s.finish()?.completedCount, 4)
})

test('record snapshots survive session disposal and later template or answer edits', async t => {
  const s = setup(t)
  const record = finishMixed(s)
  assert.equal(record.source, 'session')
  assert.equal(record.items.length, 4)
  assert.equal('answer' in record.items[0]!, false)
  assert.equal('answer' in record.items[1]!, false)
  assert.ok(record.items.every(item => item.progress.completed))
  s.training.title = '被修改的模板'
  s.training.questions[3]!.image!.src = '/new.svg'
  const original = s.session.answers.t
  if (original?.type === 'text') original.text = '已修改'
  s.session.progress.r.completed = false
  s.scope.stop()
  assert.deepEqual(s.session.answers, {})
  assert.equal(record.training.title, '混合训练')
  assert.equal(record.items[3]!.question.image!.src, '/old.svg')
  assert.ok(record.items[0]!.progress.completed)
  const text = record.items[2]!.answer
  assert.equal(text?.type === 'text' && text.text, '真实文字答案')
  const recording = record.items[3]!.answer
  assert.equal(recording?.type === 'audio' && await recording.recording.blob.text(), 'recorded speech')
})

test('each attempt keeps an independent record; duplicate event is ignored; refresh state has mocks only', t => {
  const first = finishMixed(setup(t))
  const second = finishMixed(setup(t))
  assert.notEqual(first.id, second.id)
  const store = useTrainingRecords(createMockRecords())
  store.addRecord(first); store.addRecord(first); store.addRecord(second)
  assert.equal(store.sessionRecords.value.length, 2)
  assert.equal(store.getRecord(first.id)?.id, first.id)
  assert.equal(store.historicalRecords.length, 2)
  assert.ok(store.historicalRecords.every(record => record.source === 'mock'))
  const refreshed = useTrainingRecords(createMockRecords())
  assert.equal(refreshed.getRecord(first.id), undefined)
  assert.equal(refreshed.sessionRecords.value.length, 0)
  assert.equal(refreshed.getRecord('demo-mixed')?.source, 'mock')
})

test('optional skipped steps record status without manufacturing an answer', t => {
  const training = fixture()
  training.questions = [{ id: 'optional', title: '可选录音', instruction: '可跳过', interaction: 'audio', required: false }]
  const s = setup(t, training)
  assert.equal(s.finish(), null)
  s.setRecording('optional', audio())
  assert.equal(s.skip(), true)
  const record = createTrainingRecord(training, s.finish()!, s.session.answers, s.session.progress)
  assert.equal(record.items[0]!.progress.completed, false)
  assert.equal(record.items[0]!.progress.skipped, true)
  assert.equal('answer' in record.items[0]!, false)
  assert.equal(record.skippedCount, 1)
})

test('mock audio is a playable WAV container, not an empty placeholder; dates are explicit China time', async () => {
  const mocks = createMockRecords()
  const answer = mocks[0]!.items.find(item => item.answer?.type === 'audio')!.answer!
  assert.equal(answer.type, 'audio')
  if (answer.type === 'audio') {
    const buffer = await answer.recording.blob.arrayBuffer()
    assert.equal(new TextDecoder().decode(buffer.slice(0, 4)), 'RIFF')
    assert.equal(new TextDecoder().decode(buffer.slice(8, 12)), 'WAVE')
    assert.equal(new DataView(buffer).getUint32(40, true), buffer.byteLength - 44)
  }
  assert.match(formatRecordTime('2026-10-10T01:04:00Z'), /09:04:00/)
  assert.equal(formatRecordDuration('2026-10-10T01:00:00Z', '2026-10-10T01:01:03Z'), '1 分 3 秒')
})
