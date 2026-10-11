import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'

test('record and question pages render the right controls without asking readers to answer', async () => {
  const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom' })
  const createUrl = URL.createObjectURL
  const urls: string[] = []
  URL.createObjectURL = blob => { const url = createUrl(blob); urls.push(url); return url }
  try {
    const { createMockRecords } = await server.ssrLoadModule('/src/data/mockRecords.ts')
    const records = createMockRecords()
    const Detail = (await server.ssrLoadModule('/src/views/TrainingRecordDetail.vue')).default
    const detailHtml = await renderToString(createSSRApp(Detail, { record: records[0] }))
    assert.match(detailHtml, /已确认阅读/)
    assert.match(detailHtml, /已确认完成练习/)
    assert.match(detailHtml, /我愿意给自己更多时间/)
    assert.match(detailHtml, /<audio/)
    assert.match(detailHtml, /不是学员录音/)
    assert.ok(!detailHtml.includes('开始录音'))
    const List = (await server.ssrLoadModule('/src/views/TrainingRecordList.vue')).default
    const emptyHtml = await renderToString(createSSRApp(List, { sessionRecords: [], mockRecords: records }))
    assert.match(emptyHtml, /还没有本次训练记录/)
    assert.match(emptyHtml, /模拟历史/)
    const Question = (await server.ssrLoadModule('/src/components/TrainingQuestion.vue')).default
    for (const [interaction, label] of [['read', '我已阅读'], ['practice', '我已完成练习'], ['text', '提交文字答案']]) {
      const html = await renderToString(createSSRApp(Question, {
        question: { id: interaction, title: '步骤', instruction: '说明', interaction, required: true },
        progress: { completed: false, skipped: false, confirmedAt: null },
      }))
      assert.ok(html.includes(label!))
      assert.equal(html.includes('<textarea'), interaction === 'text')
      assert.ok(!html.includes('<audio'))
    }
  } finally {
    URL.createObjectURL = createUrl
    urls.forEach(url => URL.revokeObjectURL(url))
    await server.close()
  }
})
