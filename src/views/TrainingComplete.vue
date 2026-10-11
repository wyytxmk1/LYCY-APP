<script setup lang="ts">
import type { TrainingRecord } from '../types/training'
defineProps<{ record: TrainingRecord }>()
defineEmits<{ home: [] }>()
</script>

<template>
  <main id="main-content" class="completion-page">
    <div class="completion-mark" aria-hidden="true">✓</div>
    <p class="eyebrow">给今天的自己一点鼓励</p>
    <h1 tabindex="-1">训练完成</h1>
    <p class="completion-message">今天的练习到这里，休息一下吧。</p>
    <section class="completion-summary" aria-labelledby="completed-training-heading">
      <span class="category">{{ record.training.category }}</span>
      <h2 id="completed-training-heading">{{ record.training.title }}</h2>
      <p>{{ record.completedCount }} 项已完成<span v-if="record.skippedCount">，{{ record.skippedCount }} 项选填已跳过</span></p>
      <p v-if="record.readingCount">已确认阅读 {{ record.readingCount }} 项</p>
      <p v-if="record.practiceCount">已确认完成练习 {{ record.practiceCount }} 项</p>
      <p v-if="record.audioCount">已录制 {{ record.audioCount }} 段音频</p>
      <p v-if="record.textCount">已提交 {{ record.textCount }} 道文字答案</p>
      <span class="completion-status">真实训练 · 临时记录</span>
    </section>
    <a class="primary-button records-back" :href="'#/records/' + record.id">查看本次记录</a>
    <button class="secondary-button completion-home" @click="$emit('home')">返回首页</button>
    <p class="demo-note">本次结果和录音已暂存于页面内存，可以查看和试听。<br>刷新或关闭页面后会丢失，未上传或永久保存。</p>
  </main>
</template>
