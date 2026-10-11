<script setup lang="ts">
import { student } from '../data/mock'
import StudentNav from '../components/StudentNav.vue'
defineProps<{ recordCount: number }>()
</script>
<template>
  <div class="home-page">
    <header class="detail-header"><a class="back-button" href="#/">← 首页</a><span>我的</span><span class="header-spacer"></span></header>
    <main id="main-content">
      <section class="welcome"><h1 tabindex="-1">我的</h1><p>回顾练习，留意每一次表达。</p></section>
      <section class="message-card"><span class="avatar">林</span><div><h2>{{ student.name }}</h2><p>模拟学员 · 我的教师：{{ student.teacher }}</p></div></section>
      <a class="profile-record-link" href="#/records"><div><h2>训练记录</h2><p>本次打开期间完成 {{ recordCount }} 次训练</p></div><span aria-hidden="true">→</span></a>
      <p class="demo-note">真实记录仅暂存在内存，刷新或关闭页面后丢失。<br>记录列表中的模拟历史仅用于演示。</p>
    </main>
    <StudentNav active="my" />
  </div>
</template>
