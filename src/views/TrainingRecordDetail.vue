<script setup lang="ts">
import type { TrainingRecord } from '../types/training'
import QuestionContent from '../components/QuestionContent.vue'
import AudioPlayback from '../components/AudioPlayback.vue'
import { formatRecordDuration, formatRecordTime } from '../utils/recordFormat'
defineProps<{ record: TrainingRecord }>()
const labels = { audio: '录音作答', text: '文字作答', read: '阅读确认', practice: '练习确认' }
</script>
<template>
  <div>
    <header class="detail-header"><a class="back-button" href="#/records">← 记录</a><span>记录详情</span><span class="header-spacer"></span></header>
    <main id="main-content" class="records-page">
      <span class="category" :class="{ warm: record.source === 'mock' }">{{ record.source === 'mock' ? '模拟历史 · 仅供演示' : '真实训练 · 临时保留' }}</span>
      <h1 tabindex="-1">{{ record.training.title }}</h1>
      <p class="recording-notice">{{ record.source === 'mock' ? '这是模拟记录，内容和答案均为示例。音频是合成提示音，不是学员录音。' : '这是你刚刚实际完成的训练。文字和录音仅在当前页面内存保留，刷新或关闭页面后丢失，未上传。' }}</p>
      <dl class="record-metadata"><div><dt>开始时间</dt><dd>{{ formatRecordTime(record.startedAt) }}</dd></div><div><dt>完成时间</dt><dd>{{ formatRecordTime(record.completedAt) }}</dd></div><div><dt>本次用时</dt><dd>{{ formatRecordDuration(record.startedAt, record.completedAt) }}</dd></div><div><dt>完成情况</dt><dd>{{ record.completedCount }} 步已完成<span v-if="record.skippedCount">，{{ record.skippedCount }} 步选填已跳过</span></dd></div></dl>
      <section v-for="(item, index) in record.items" :key="item.question.id" class="record-question" :aria-labelledby="'record-question-' + index">
        <div class="section-heading"><span>{{ index + 1 }} / {{ record.items.length }} · {{ labels[item.question.interaction] }}</span><span>{{ item.progress.completed ? '已完成' : item.progress.skipped ? '已跳过' : '未完成' }}</span></div>
        <h2 :id="'record-question-' + index">{{ item.question.title }}</h2>
        <QuestionContent :question="item.question" />
        <div class="record-answer">
          <p v-if="item.question.interaction === 'read'">{{ item.progress.completed ? '已确认阅读' : '尚未确认阅读' }} · 本步无需回答</p>
          <p v-else-if="item.question.interaction === 'practice'">{{ item.progress.completed ? '已确认完成练习' : '尚未确认完成练习' }} · 本步无需回答</p>
          <template v-else-if="item.question.interaction === 'text'"><h3>文字答案</h3><p class="answer-text">{{ item.answer?.type === 'text' ? item.answer.text : item.progress.skipped ? '本步为选填，已跳过。' : '未提交文字答案。' }}</p></template>
          <template v-else-if="item.question.interaction === 'audio'">
            <AudioPlayback v-if="item.answer?.type === 'audio'" :blob="item.answer.recording.blob" :label="record.source === 'mock' ? '试听示例提示音（非学员录音）' : '试听第 ' + (index + 1) + ' 步录音'" />
            <p v-else>{{ item.progress.skipped ? '本步录音为选填，已跳过。' : '本步没有录音。' }}</p>
          </template>
          <p v-if="item.progress.confirmedAt" class="scope-note">{{ item.progress.skipped ? '跳过' : item.question.interaction === 'audio' ? '录制完成' : '确认' }}时间：{{ formatRecordTime(item.progress.confirmedAt) }}</p>
        </div>
      </section>
      <a class="secondary-button records-back" href="#/records">返回训练记录</a>
    </main>
  </div>
</template>
