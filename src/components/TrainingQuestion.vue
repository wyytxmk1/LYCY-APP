<script setup lang="ts">
import { computed, ref } from 'vue'
import AudioRecorder from './AudioRecorder.vue'
import QuestionContent from './QuestionContent.vue'
import type { QuestionAnswer, RecordingData, StepProgress, TrainingQuestion } from '../types/training'

const props = defineProps<{ question: TrainingQuestion; answer?: QuestionAnswer; progress?: StepProgress }>()
const emit = defineEmits<{ text: [value: string]; recorded: [recording: RecordingData]; confirm: []; skip: [] }>()
const recorder = ref<InstanceType<typeof AudioRecorder> | null>(null)
const busy = computed(() => recorder.value?.busy ?? false)
const confirmLabel = computed(() => ({
  audio: '', text: '提交文字答案', read: '我已阅读', practice: '我已完成练习',
})[props.question.interaction])
defineExpose({ busy })
</script>

<template>
  <div>
    <QuestionContent :question="question" />
    <template v-if="question.interaction === 'audio'">
      <p class="scope-note">{{ question.required ? '本步需要录音，停止后即可继续' : '本步录音可选，可以明确跳过' }}</p>
      <AudioRecorder ref="recorder" :initial-recording="answer?.type === 'audio' ? answer.recording : undefined" @recorded="emit('recorded', $event)" />
    </template>
    <div v-else-if="question.interaction === 'text'" class="text-answer">
      <label :for="'answer-' + question.id">你的回答{{ question.required ? '（必填）' : '（选填）' }}</label>
      <textarea :id="'answer-' + question.id" :value="answer?.type === 'text' ? answer.text : ''" :required="question.required" rows="5" placeholder="按自己的想法慢慢写…" @input="emit('text', ($event.target as HTMLTextAreaElement).value)"></textarea>
      <p class="scope-note">点击提交后确认本步；修改文字后需重新提交。</p>
    </div>
    <p v-else class="scope-note">本步无需回答，按说明{{ question.interaction === 'read' ? '阅读后确认' : '练习后确认' }}即可。</p>
    <div class="step-confirmation">
      <button v-if="question.interaction !== 'audio'" class="primary-button" :disabled="busy || progress?.completed" @click="emit('confirm')">{{ progress?.completed ? '本步已完成' : confirmLabel }}</button>
      <button v-if="!question.required && ['audio', 'text'].includes(question.interaction) && !progress?.skipped" class="text-button" :disabled="busy" @click="emit('skip')">跳过本步{{ question.interaction === 'audio' ? '录音' : '文字作答' }}</button>
      <p v-if="progress?.completed" class="scope-note" role="status">{{ question.interaction === 'audio' ? '录音已完成，可试听、重新录制或继续下一步。' : '已确认，可继续下一步。' }}</p>
      <p v-else-if="progress?.skipped" class="scope-note" role="status">{{ question.interaction === 'audio' ? '本步已跳过，可继续；也可以重新录音。' : '本步已跳过，可继续；也可以重新作答并确认。' }}</p>
    </div>
  </div>
</template>
