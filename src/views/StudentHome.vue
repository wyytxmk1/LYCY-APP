<script setup lang="ts">
import StudentNav from '../components/StudentNav.vue'
import { recentCourse, student, teacherMessage, trainings } from '../data/mock'
const totalMinutes = trainings.reduce((sum, training) => sum + training.duration, 0)
defineProps<{ completedIds: string[] }>()
defineEmits<{ openTraining: [id: string] }>()
const date = new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }).format(new Date())
</script>

<template>
  <div class="home-page">
    <header class="home-header">
      <a class="brand" href="#/" aria-label="轻言首页"><span class="brand-mark" aria-hidden="true">言</span>轻言<span class="brand-sub">每天一点，从容表达</span></a>
      <span class="avatar" aria-label="模拟学员小林">林</span>
    </header>
    <main id="main-content">
      <section class="welcome">
        <p class="eyebrow">{{ date }}</p>
        <h1 tabindex="-1">{{ student.name }}，今天也慢慢来</h1>
        <p>给自己一点时间，让表达更自在。</p>
      </section>
      <section class="daily-overview" aria-label="今日训练概览">
        <div><span class="eyebrow">今日的小目标</span><h2>一次练习，一点进步</h2><p>今天安排了 {{ trainings.length }} 项训练，约 {{ totalMinutes }} 分钟</p></div>
        <div class="overview-decoration" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></div>
        <div class="overview-bottom"><span>{{ completedIds.length === trainings.length ? '今天的训练已完成，辛苦了' : '按自己的节奏完成就好' }}</span><span>{{ completedIds.length }} / {{ trainings.length }} 项</span></div>
      </section>
      <section class="section-block" aria-labelledby="today-heading">
        <div class="section-heading"><h2 id="today-heading">今日训练</h2><span>{{ student.teacher }}为你安排</span></div>
        <article v-for="(training, index) in trainings" :key="training.id" class="training-card">
          <div class="training-card-top"><span class="category" :class="{ warm: index === 1 }">{{ training.category }}</span><span class="muted">{{ completedIds.includes(training.id) ? '已完成' : '待开始' }}</span></div>
          <h3>{{ training.title }}</h3><p>{{ training.summary }}</p>
          <div class="training-card-bottom"><span class="metadata">约 {{ training.duration }} 分钟<span class="separator">·</span>{{ training.format }}</span><button class="start-button" @click="$emit('openTraining', training.id)">{{ completedIds.includes(training.id) ? '再练一次' : '开始' }}<span aria-hidden="true">↗</span><span class="sr-only">{{ training.title }}</span></button></div>
        </article>
      </section>
      <section class="section-block" aria-labelledby="teacher-heading">
        <div class="section-heading"><h2 id="teacher-heading">教师留言</h2><span>今天</span></div>
        <div class="message-card"><span class="teacher-avatar" aria-hidden="true">陈</span><div><h3>{{ student.teacher }}</h3><p>{{ teacherMessage }}</p></div></div>
      </section>
      <section class="section-block" aria-labelledby="course-heading">
        <div class="section-heading"><h2 id="course-heading">继续学习</h2><span>课程摘要</span></div>
        <div class="course-card"><div class="course-art" aria-hidden="true">呼<br>吸</div><div class="course-copy"><h3>{{ recentCourse.title }}</h3><p>{{ recentCourse.chapter }}</p><div class="course-progress"><progress :value="recentCourse.progress" max="100" aria-label="课程学习进度"></progress><span>{{ recentCourse.progress }}%</span></div></div></div>
        <p class="scope-note">课程播放将在后续版本开放</p>
      </section>
      <p class="demo-note">模拟学员 · 示例训练数据<br>完成状态仅在本次打开期间保留，刷新后重置</p>
    </main>
    <StudentNav active="home" />
  </div>
</template>

