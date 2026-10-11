<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = withDefaults(defineProps<{ src?: string; blob?: Blob; label?: string }>(), { label: '试听录音' })
const player = ref<HTMLAudioElement | null>(null)
const objectUrl = ref('')
const failed = ref(false)
const source = computed(() => props.src || objectUrl.value)
function pause() { player.value?.pause() }
defineExpose({ pause })
watch(() => props.blob, (blob, _, onCleanup) => {
  pause()
  objectUrl.value = blob ? URL.createObjectURL(blob) : ''
  const url = objectUrl.value
  onCleanup(() => { if (url) URL.revokeObjectURL(url) })
}, { immediate: true })
watch(source, () => { pause(); failed.value = false })
onBeforeUnmount(pause)
</script>

<template>
  <div class="recording-playback">
    <p class="audio-label">{{ label }}</p>
    <audio ref="player" :src="source" :aria-label="label" controls preload="metadata" @error="failed = true"></audio>
    <p v-if="failed" role="alert">音频暂时无法播放，请使用支持该格式的浏览器重试。</p>
  </div>
</template>
