<script setup lang="ts">
import { ref } from 'vue'
import { useAudioRecorder } from '../composables/useAudioRecorder'
import type { RecordingData } from '../types/training'
import AudioPlayback from './AudioPlayback.vue'

const props = defineProps<{ initialRecording?: RecordingData }>()
const emit = defineEmits<{ recorded: [recording: RecordingData] }>()
const { state, audioUrl, error, supported, unavailableMessage, busy, elapsed, start, stop, cancel } = useAudioRecorder({
  initialRecording: props.initialRecording,
  onRecorded: recording => emit('recorded', recording),
})
const player = ref<InstanceType<typeof AudioPlayback> | null>(null)
defineExpose({ busy })
function startRecording() {
  player.value?.pause()
  void start()
}
</script>

<template>
  <section class="audio-recorder" aria-label="发音录音">
    <p class="recording-privacy">按题目指令录音，停止后可以试听。完成后可在记录中查看；刷新、关闭页面或未完成就退出会清除，不会上传。</p>
    <p v-if="!supported" class="recording-notice" role="status">{{ unavailableMessage }}</p>
    <template v-else>
      <div class="recording-status" role="status" aria-live="polite">
        <span v-if="state === 'requesting'">等待麦克风授权…</span>
        <span v-else-if="state === 'recording'"><span class="recording-dot" aria-hidden="true"></span>正在录音，按自己的节奏说</span>
        <span v-else-if="state === 'stopping'">正在生成试听音频…</span>
        <span v-else>{{ audioUrl ? '录音已就绪，可以试听或重新录制' : '准备好后，点击开始录音' }}</span>
      </div>
      <p v-if="state === 'recording'" class="recording-time" aria-label="已录制时间">{{ elapsed }}</p>
      <div class="recording-actions">
        <button v-if="state === 'recording'" class="primary-button" @click="stop">停止录音</button>
        <button v-else class="primary-button" :disabled="busy" @click="startRecording">{{ state === 'requesting' ? '等待授权…' : state === 'stopping' ? '正在处理…' : audioUrl ? '重新录制' : '开始录音' }}</button>
        <button v-if="state === 'requesting'" class="secondary-button" @click="cancel">取消</button>
      </div>
      <div v-if="audioUrl && !busy" class="recording-playback">
        <AudioPlayback :key="audioUrl" ref="player" :src="audioUrl" label="试听本次录音" />
        <p>重新录制成功后会替换这段录音。</p>
      </div>
    </template>
    <p v-if="error" class="recording-notice" role="alert">{{ error }}</p>
  </section>
</template>
