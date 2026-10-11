import type { RecordingData, TrainingRecord } from '../types/training'

/** A quiet synthetic tone, explicitly labelled in the UI; never a student recording. */
function demoAudio(): RecordingData {
  const samples = 8000
  const buffer = new ArrayBuffer(44 + samples * 2)
  const view = new DataView(buffer)
  function ascii(offset: number, value: string) {
    for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i))
  }
  ascii(0, 'RIFF'); view.setUint32(4, 36 + samples * 2, true); ascii(8, 'WAVE')
  ascii(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true)
  view.setUint16(22, 1, true); view.setUint32(24, samples, true); view.setUint32(28, samples * 2, true)
  view.setUint16(32, 2, true); view.setUint16(34, 16, true); ascii(36, 'data'); view.setUint32(40, samples * 2, true)
  for (let i = 0; i < samples; i++) {
    const envelope = Math.sin(Math.PI * i / samples) ** 2
    view.setInt16(44 + i * 2, Math.round(2500 * envelope * Math.sin(2 * Math.PI * 330 * i / samples)), true)
  }
  const blob = new Blob([buffer], { type: 'audio/wav' })
  return { blob, mimeType: blob.type, size: blob.size, durationMs: 1000 }
}

export function createMockRecords(): TrainingRecord[] {
  const time = '2026-10-10T09:04:00+08:00'
  const progress = () => ({ completed: true, skipped: false, confirmedAt: time })
  return [
    {
      id: 'demo-mixed', sessionId: 'demo-mixed', source: 'mock', trainingId: 'demo-mixed-template', trainingVersion: 1,
      startedAt: '2026-10-10T09:00:00+08:00', completedAt: time,
      questionCount: 4, audioCount: 1, textCount: 1, readingCount: 1, practiceCount: 1, completedCount: 4, skippedCount: 0,
      training: { title: '综合练习示例', category: '模拟历史', goal: '演示四种步骤的记录展示。', summary: '仅用于展示，不代表实际训练经历。' },
      items: [
        { question: { id: 'guide', title: '阅读指导', instruction: '练习时保持舒适的节奏，不必追求速度。', interaction: 'read', required: true }, progress: progress() },
        { question: { id: 'practice', title: '放松练习', instruction: '放松肩膀和下颌，自然呼吸几次。', interaction: 'practice', required: true }, progress: progress() },
        {
          question: { id: 'image', title: '看图命名', image: { src: '/training-images/apple.svg', alt: '一个红色苹果' }, instruction: '请说出图片中物品的名称。', interaction: 'audio', required: true }, progress: progress(),
          answer: { questionId: 'image', type: 'audio', recording: demoAudio(), updatedAt: time },
        },
        {
          question: { id: 'text', title: '写下感受', text: '练习结束后，你有什么感受？', instruction: '用一句话记录你的想法。', interaction: 'text', required: true }, progress: progress(),
          answer: { questionId: 'text', type: 'text', text: '我愿意给自己更多时间，慢慢表达。', updatedAt: time },
        },
      ],
    },
    {
      id: 'demo-reading', sessionId: 'demo-reading', source: 'mock', trainingId: 'demo-reading-template', trainingVersion: 1,
      startedAt: '2026-10-09T18:30:00+08:00', completedAt: '2026-10-09T18:31:00+08:00',
      questionCount: 1, audioCount: 0, textCount: 0, readingCount: 1, practiceCount: 0, completedCount: 1, skippedCount: 0,
      training: { title: '表达前的放松阅读示例', category: '心理训练', goal: '温和地看待自己的表达。', summary: '模拟历史，只展示阅读确认，不包含答案。' },
      items: [{
        question: { id: 'read', title: '给自己一点时间', instruction: '表达时可以适当停顿，也可以慢慢说完。无需写下回答，阅读后确认即可。', interaction: 'read', required: true },
        progress: { completed: true, skipped: false, confirmedAt: '2026-10-09T18:31:00+08:00' },
      }],
    },
  ]
}
