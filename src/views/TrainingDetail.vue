<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import type { TrainingRecord, Training } from '../types/training'
import TrainingQuestion from '../components/TrainingQuestion.vue'
import { useTrainingSession } from '../composables/useTrainingSession'
import { createTrainingRecord } from '../composables/useTrainingRecords'

const props = defineProps<{ training: Training }>()
const emit = defineEmits<{ back: []; complete: [record: TrainingRecord] }>()
const { session, currentQuestion, currentAnswer, currentProgress, validationMessage, start, setText, setRecording, confirm, skip, previous, next, finish } = useTrainingSession(props.training)
const questionView = ref<InstanceType<typeof TrainingQuestion> | null>(null)
const busy = computed(() => questionView.value?.busy ?? false)
const showingQuestions = ref(false)
const finishing = ref(false)
const guideHeading = ref<HTMLElement | null>(null)
const isLast = computed(() => session.currentIndex === props.training.questions.length - 1)

async function focusQuestion() {
  await nextTick()
  guideHeading.value?.focus()
  guideHeading.value?.scrollIntoView({ block: 'center', behavior: 'auto' })
}
function begin() {
  start()
  showingQuestions.value = true
  void focusQuestion()
}
function goPrevious() {
  if (busy.value || finishing.value) return
  previous()
  void focusQuestion()
}
function advance() {
  if (busy.value || finishing.value) return
  if (isLast.value) {
    const summary = finish()
    if (summary) {
      const record = createTrainingRecord(props.training, summary, session.answers, session.progress)
      finishing.value = true
      emit('complete', record)
    }
    else void focusQuestion()
  } else if (next()) void focusQuestion()
}
</script>

<template>
  <div class="detail-page">
    <header class="detail-header"><button class="back-button" @click="$emit('back')"><span aria-hidden="true">←</span> 首页</button><span>训练详情</span><span class="header-spacer" aria-hidden="true"></span></header>
    <main id="main-content">
      <section class="detail-intro"><span class="category">{{ training.category }}</span><h1 tabindex="-1">{{ training.title }}</h1><p>{{ training.summary }}</p><div class="detail-meta"><span>约 {{ training.duration }} 分钟</span><span>{{ training.format }}</span><span>按自己的节奏</span></div></section>
      <template v-if="!showingQuestions">
        <section class="goal-card" aria-labelledby="goal-heading"><span class="eyebrow">这次练习，我们一起</span><h2 id="goal-heading">训练目标</h2><p>{{ training.goal }}</p></section>
        <section class="section-block" aria-labelledby="steps-heading"><div class="section-heading"><h2 id="steps-heading">训练内容</h2><span>共 {{ training.questions.length }} 项</span></div><ol class="step-list"><li v-for="(question, index) in training.questions" :key="question.id"><span class="step-number" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span><div><h3>{{ question.title }}</h3><p>{{ question.instruction }}</p></div></li></ol></section>
        <aside class="preparation"><h2>开始前的小提醒</h2><p>{{ training.preparation }}</p></aside>
      </template>
      <section v-else-if="currentQuestion" class="guide-card" aria-labelledby="guide-heading">
        <div class="section-heading"><span>{{ ['read', 'practice'].includes(currentQuestion.interaction) ? '阅读与练习' : '逐题练习' }}</span><span>{{ session.currentIndex + 1 }} / {{ training.questions.length }}</span></div>
        <progress :value="session.currentIndex + 1" :max="training.questions.length" aria-label="训练进度"></progress>
        <h2 id="guide-heading" ref="guideHeading" tabindex="-1">{{ currentQuestion.title }}</h2>
        <TrainingQuestion :key="currentQuestion.id + (currentProgress?.skipped ? '-skipped' : '')" ref="questionView" :question="currentQuestion" :answer="currentAnswer" :progress="currentProgress" @confirm="confirm" @skip="skip" @text="setText(currentQuestion.id, $event)" @recorded="setRecording(currentQuestion.id, $event)" />
        <p v-if="validationMessage" class="recording-notice" role="alert">{{ validationMessage }}</p>
        <div class="guide-actions">
          <button class="secondary-button" :disabled="session.currentIndex === 0 || busy || finishing" @click="goPrevious">上一题</button>
          <button class="primary-button" :disabled="busy || finishing" @click="advance">{{ finishing ? '正在完成…' : isLast ? '完成训练' : '下一步' }}</button>
        </div>
        <p v-if="busy" class="scope-note" role="status">请先停止录音并等待处理完成，或取消授权等待，再切题。</p>
        <button class="text-button" :disabled="busy || finishing" @click="showingQuestions = false">返回训练说明</button>
      </section>
      <p class="demo-note">完成后可在训练记录中查看文字和录音，仅暂存于本次打开期间。<br>刷新或关闭页面会丢失；未完成就退出的答案会清除，不会上传。</p>
    </main>
    <footer v-if="!showingQuestions" class="detail-footer"><span>轻松开始，不必追求完美</span><button class="primary-button" @click="begin">{{ session.startedAt ? '继续训练' : '开始训练' }} <span aria-hidden="true">→</span></button></footer>
  </div>
</template>

