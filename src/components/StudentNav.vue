<script setup lang="ts">
defineProps<{ active: 'home' | 'my' }>()
</script>
<template>
  <nav class="bottom-nav" aria-label="学生端导航">
    <a href="#/" :aria-current="active === 'home' ? 'page' : undefined"><span aria-hidden="true">⌂</span>首页</a>
    <button disabled><span aria-hidden="true">☷</span>训练<small>待开放</small></button>
    <button disabled><span aria-hidden="true">▤</span>课程<small>待开放</small></button>
    <a href="#/my" :aria-current="active === 'my' ? 'page' : undefined"><span aria-hidden="true">♙</span>我的</a>
  </nav>
</template>
