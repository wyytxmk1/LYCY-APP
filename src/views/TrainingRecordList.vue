<script setup lang="ts">
import type { TrainingRecord } from '../types/training'
import { formatRecordDuration, formatRecordTime } from '../utils/recordFormat'
defineProps<{ sessionRecords: TrainingRecord[]; mockRecords: TrainingRecord[] }>()
</script>
<template>
  <div>
    <header class="detail-header"><a class="back-button" href="#/my">← 我的</a><span>训练记录</span><span class="header-spacer"></span></header>
    <main id="main-content" class="records-page">
      <h1 tabindex="-1">训练记录</h1>
      <p class="recording-notice">真实记录仅在本次打开期间保留，刷新或关闭页面后会丢失，未上传。模拟历史会重新显示，不代表你的实际训练。</p>
      <section class="section-block" aria-labelledby="real-records"><div class="section-heading"><h2 id="real-records">本次打开期间</h2><span>{{ sessionRecords.length }} 条真实记录</span></div>
        <div v-if="!sessionRecords.length" class="record-empty"><p>还没有本次训练记录。</p><a class="text-button" href="#/">去首页开始训练 →</a></div>
        <a v-for="record in sessionRecords" :key="record.id" class="record-card" :href="'#/records/' + record.id">
          <span class="category">真实训练 · 临时保留</span><h3>{{ record.training.title }}</h3><time :datetime="record.completedAt">{{ formatRecordTime(record.completedAt) }}</time><p>{{ record.completedCount }} / {{ record.questionCount }} 步已完成 · 用时 {{ formatRecordDuration(record.startedAt, record.completedAt) }}</p><span class="record-link-label">查看记录 →</span>
        </a>
      </section>
      <section class="section-block" aria-labelledby="mock-records"><div class="section-heading"><h2 id="mock-records">模拟历史</h2><span>仅供演示</span></div>
        <a v-for="record in mockRecords" :key="record.id" class="record-card" :href="'#/records/' + record.id"><span class="category warm">模拟记录</span><h3>{{ record.training.title }}</h3><time :datetime="record.completedAt">{{ formatRecordTime(record.completedAt) }}</time><p>{{ record.questionCount }} 个步骤 · 示例内容与答案</p><span class="record-link-label">查看示例 →</span></a>
      </section>
    </main>
  </div>
</template>
