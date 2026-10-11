import { computed, onScopeDispose, ref } from 'vue'
import type { RecordingData } from '../types/training'

type RecordingState = 'idle' | 'requesting' | 'recording' | 'stopping'

function microphoneError(error: unknown): string {
  const name = error instanceof Error ? error.name : ''
  if (name === 'NotAllowedError' || name === 'SecurityError') {
    return '未获得麦克风权限。请在浏览器地址栏的网站权限中允许麦克风，然后再次点击录音。'
  }
  if (name === 'NotFoundError') return '没有找到麦克风，请连接麦克风后重试。'
  if (name === 'NotReadableError') return '麦克风暂时无法使用，请关闭其他占用麦克风的应用后重试。'
  return '录音未能开始，请检查麦克风是否可用后重试。'
}

export function useAudioRecorder(options: { initialRecording?: RecordingData; onRecorded?: (recording: RecordingData) => void } = {}) {
  const state = ref<RecordingState>('idle')
  const audioUrl = ref(options.initialRecording ? URL.createObjectURL(options.initialRecording.blob) : '')
  const error = ref('')
  const seconds = ref(0)
  const supported = window.isSecureContext && !!navigator.mediaDevices?.getUserMedia
    && typeof MediaRecorder !== 'undefined'
  const unavailableMessage = !window.isSecureContext
    ? '录音需要安全连接，请使用 HTTPS 或在本机通过 localhost 打开。'
    : '当前浏览器不支持录音，请使用较新版本的 Chrome、Edge 或 Safari。'
  const busy = computed(() => state.value !== 'idle')
  const elapsed = computed(() => `${Math.floor(seconds.value / 60).toString().padStart(2, '0')}:${(seconds.value % 60).toString().padStart(2, '0')}`)
  let stream: MediaStream | null = null
  let recorder: MediaRecorder | null = null
  let timer: ReturnType<typeof setInterval> | undefined
  let generation = 0
  let disposed = false

  function releaseMicrophone() {
    if (timer !== undefined) clearInterval(timer)
    timer = undefined
    stream?.getTracks().forEach(track => {
      track.onended = null
      track.stop()
    })
    stream = null
  }

  function resetRecorder() {
    const previous = recorder
    recorder = null
    if (previous) {
      previous.ondataavailable = null
      previous.onstop = null
      previous.onerror = null
      if (previous.state !== 'inactive') previous.stop()
    }
    releaseMicrophone()
  }

  function stop() {
    if (state.value !== 'recording' || !recorder) return
    state.value = 'stopping'
    if (recorder.state !== 'inactive') recorder.stop()
    releaseMicrophone()
  }

  async function start() {
    if (disposed || busy.value || !supported) return
    const attempt = ++generation
    state.value = 'requesting'
    error.value = ''
    const chunks: Blob[] = []
    let startedAt = 0
    let durationMs = 0
    try {
      const acquired = await navigator.mediaDevices.getUserMedia({ audio: true })
      // Permission can resolve after the user has already left this step.
      if (disposed || attempt !== generation) {
        acquired.getTracks().forEach(track => track.stop())
        return
      }
      stream = acquired
      const mimeType = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus']
        .find(type => MediaRecorder.isTypeSupported(type))
      const current = new MediaRecorder(acquired, mimeType ? { mimeType } : undefined)
      recorder = current
      current.ondataavailable = event => {
        if (event.data.size > 0) chunks.push(event.data)
      }
      current.onstop = () => {
        if (disposed || attempt !== generation) return
        const blob = new Blob(chunks, { type: current.mimeType || chunks[0]?.type || '' })
        durationMs ||= Math.max(0, Date.now() - startedAt)
        resetRecorder()
        state.value = 'idle'
        if (!blob.size) {
          error.value = '没有录到可播放的音频，请重新录制。'
          return
        }
        if (audioUrl.value) URL.revokeObjectURL(audioUrl.value)
        audioUrl.value = URL.createObjectURL(blob)
        options.onRecorded?.({ blob, mimeType: blob.type, size: blob.size, durationMs })
      }
      current.onerror = () => {
        if (disposed || attempt !== generation) return
        ++generation
        resetRecorder()
        state.value = 'idle'
        error.value = '录音中断，请检查麦克风后重新录制。'
      }
      acquired.getTracks().forEach(track => {
        track.onended = () => {
          error.value = '麦克风连接已中断，请试听已有录音，或重新录制。'
          stop()
        }
      })
      current.start()
      seconds.value = 0
      startedAt = Date.now()
      state.value = 'recording'
      timer = setInterval(() => { seconds.value = Math.floor((Date.now() - startedAt) / 1000) }, 250)
    } catch (cause) {
      if (disposed || attempt !== generation) return
      resetRecorder()
      state.value = 'idle'
      error.value = microphoneError(cause)
    }
  }

  function cancel() {
    ++generation
    resetRecorder()
    state.value = 'idle'
  }

  function clearRecording() {
    cancel()
    if (audioUrl.value) URL.revokeObjectURL(audioUrl.value)
    audioUrl.value = ''
  }

  window.addEventListener('pagehide', clearRecording)
  onScopeDispose(() => {
    disposed = true
    window.removeEventListener('pagehide', clearRecording)
    clearRecording()
  })
  return { state, audioUrl, error, supported, unavailableMessage, busy, elapsed, start, stop, cancel }
}
