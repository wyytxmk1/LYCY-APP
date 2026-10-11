<script setup lang="ts">
import { ref } from 'vue'
import type { TrainingQuestion } from '../types/training'
defineProps<{ question: TrainingQuestion }>()
const imageFailed = ref(false)
</script>

<template>
  <div class="question-content">
    <figure v-if="question.image" class="question-image">
      <img v-if="!imageFailed" :src="question.image.src" :alt="question.image.alt" @error="imageFailed = true" />
      <p v-else role="alert">图片暂时无法显示，请返回后重试。</p>
    </figure>
    <p v-if="question.text" class="question-text">{{ question.text }}</p>
    <p class="question-instruction">{{ question.instruction }}</p>
  </div>
</template>
