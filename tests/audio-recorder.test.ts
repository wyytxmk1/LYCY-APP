import { test } from 'node:test'
import assert from 'node:assert/strict'
import { effectScope } from 'vue'
import { useAudioRecorder } from '../src/composables/useAudioRecorder.ts'

// Exercise asynchronous microphone/recorder events without a real device or new dependencies.
function setup(t: { after: (fn: () => void) => void }, options: Parameters<typeof useAudioRecorder>[0] = {}) {
  const originals = new Map<string, PropertyDescriptor | undefined>()
  function replace(key: string, value: unknown) {
    originals.set(key, Object.getOwnPropertyDescriptor(globalThis, key))
    Object.defineProperty(globalThis, key, { configurable: true, value })
  }
  const events = new EventTarget()
  replace('window', Object.assign(events, { isSecureContext: true }))
  const tracks: { stopped: boolean; onended: (() => void) | null; stop: () => void }[] = []
  function makeStream() {
    const track = { stopped: false, onended: null as (() => void) | null, stop() { this.stopped = true } }
    tracks.push(track)
    return { getTracks: () => [track] }
  }
  let requests = 0
  let acquire = async () => makeStream()
  replace('navigator', { mediaDevices: { getUserMedia: () => { requests++; return acquire() } } })
  const instances: FakeRecorder[] = []
  class FakeRecorder {
    static isTypeSupported(type: string) { return type === 'audio/mp4' }
    state = 'inactive'
    mimeType = 'audio/mp4'
    ondataavailable: ((e: { data: Blob }) => void) | null = null
    onstop: (() => void) | null = null
    onerror: (() => void) | null = null
    constructor(_stream: unknown, options?: { mimeType: string }) {
      assert.equal(options?.mimeType, 'audio/mp4')
      instances.push(this)
    }
    start() { this.state = 'recording' }
    stop() { this.state = 'inactive' }
    finish(data = 'audio') {
      this.state = 'inactive'
      this.ondataavailable?.({ data: new Blob([data], { type: this.mimeType }) })
      this.onstop?.()
    }
  }
  replace('MediaRecorder', FakeRecorder)
  const revoked: string[] = []
  const blobs: Blob[] = []
  const originalCreate = URL.createObjectURL
  const originalRevoke = URL.revokeObjectURL
  URL.createObjectURL = blob => { blobs.push(blob as Blob); return `blob:test-${blobs.length}` }
  URL.revokeObjectURL = url => { revoked.push(url) }
  const scope = effectScope()
  const recording = scope.run(() => useAudioRecorder(options))!
  t.after(() => {
    scope.stop()
    URL.createObjectURL = originalCreate
    URL.revokeObjectURL = originalRevoke
    for (const [key, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor)
      else Reflect.deleteProperty(globalThis, key)
    }
  })
  return { recording, scope, events, tracks, instances, revoked, blobs, makeStream,
    requests: () => requests,
    setAcquire: (fn: typeof acquire) => { acquire = fn } }
}

test('records, releases microphone on stop, replaces audio only after successful re-recording', async t => {
  const s = setup(t)
  await s.recording.start()
  await s.recording.start()
  assert.equal(s.requests(), 1)
  assert.equal(s.recording.state.value, 'recording')
  s.recording.stop()
  assert.equal(s.recording.state.value, 'stopping')
  assert.ok(s.tracks[0].stopped)
  s.instances[0].finish()
  assert.equal(s.recording.audioUrl.value, 'blob:test-1')
  assert.equal(s.blobs[0].type, 'audio/mp4')
  await s.recording.start()
  assert.equal(s.recording.audioUrl.value, 'blob:test-1')
  s.recording.stop()
  s.instances[1].finish()
  assert.equal(s.recording.audioUrl.value, 'blob:test-2')
  assert.deepEqual(s.revoked, ['blob:test-1'])
  s.scope.stop()
  assert.deepEqual(s.revoked, ['blob:test-1', 'blob:test-2'])
})

test('permission rejection is actionable and preserves previous audio', async t => {
  const s = setup(t)
  await s.recording.start()
  s.recording.stop()
  s.instances[0].finish()
  s.setAcquire(async () => { throw new DOMException('denied', 'NotAllowedError') })
  await s.recording.start()
  assert.match(s.recording.error.value, /网站权限/)
  assert.equal(s.recording.state.value, 'idle')
  assert.equal(s.recording.audioUrl.value, 'blob:test-1')
})

test('leaving while permission is pending closes a late arriving stream', async t => {
  const s = setup(t)
  let resolve!: (stream: ReturnType<typeof s.makeStream>) => void
  s.setAcquire(() => new Promise(done => { resolve = done }))
  const pending = s.recording.start()
  assert.equal(s.recording.state.value, 'requesting')
  s.scope.stop()
  resolve(s.makeStream())
  await pending
  assert.ok(s.tracks[0].stopped)
  assert.equal(s.instances.length, 0)
})

test('canceled authorization cannot overwrite a newer recording', async t => {
  const s = setup(t)
  let resolve!: (stream: ReturnType<typeof s.makeStream>) => void
  s.setAcquire(() => new Promise(done => { resolve = done }))
  const pending = s.recording.start()
  s.recording.cancel()
  s.setAcquire(async () => s.makeStream())
  await s.recording.start()
  resolve(s.makeStream())
  await pending
  assert.ok(!s.tracks[0].stopped)
  assert.ok(s.tracks[1].stopped)
  assert.equal(s.recording.state.value, 'recording')
})

test('empty audio and recorder errors allow retry and release tracks', async t => {
  const s = setup(t)
  await s.recording.start()
  s.recording.stop()
  s.instances[0].finish('')
  assert.match(s.recording.error.value, /没有录到/)
  assert.equal(s.recording.audioUrl.value, '')
  await s.recording.start()
  s.instances[1].onerror?.()
  assert.match(s.recording.error.value, /录音中断/)
  assert.equal(s.recording.state.value, 'idle')
  assert.ok(s.tracks.every(track => track.stopped))
})

test('microphone disconnection stops recording and pagehide clears audio without preventing recovery', async t => {
  const s = setup(t)
  await s.recording.start()
  s.tracks[0].onended?.()
  assert.equal(s.recording.state.value, 'stopping')
  s.instances[0].finish()
  assert.match(s.recording.error.value, /连接已中断/)
  s.events.dispatchEvent(new Event('pagehide'))
  assert.equal(s.recording.audioUrl.value, '')
  assert.deepEqual(s.revoked, ['blob:test-1'])
  await s.recording.start()
  assert.equal(s.recording.state.value, 'recording')
  s.scope.stop()
  assert.ok(s.tracks.every(track => track.stopped))
  assert.equal(s.instances[1].onstop, null)
})

test('restores a saved recording without requesting microphone and emits only successful replacements', async t => {
  const originalBlob = new Blob(['original'], { type: 'audio/webm' })
  const updates: { blob: Blob; durationMs: number; mimeType: string; size: number }[] = []
  const s = setup(t, {
    initialRecording: { blob: originalBlob, size: originalBlob.size, mimeType: originalBlob.type, durationMs: 1000 },
    onRecorded: recording => updates.push(recording),
  })
  assert.equal(s.recording.audioUrl.value, 'blob:test-1')
  assert.equal(s.requests(), 0)
  await s.recording.start()
  s.recording.stop()
  s.instances[0].finish('')
  assert.equal(updates.length, 0)
  assert.equal(s.recording.audioUrl.value, 'blob:test-1')
  await s.recording.start()
  s.recording.stop()
  s.instances[1].finish('new')
  assert.equal(updates.length, 1)
  assert.equal(await updates[0].blob.text(), 'new')
  assert.equal(updates[0].mimeType, 'audio/mp4')
  assert.equal(updates[0].size, 3)
  assert.ok(updates[0].durationMs >= 0)
  s.scope.stop()
  assert.deepEqual(s.revoked, ['blob:test-1', 'blob:test-2'])
  assert.equal(await originalBlob.text(), 'original', 'URL cleanup must not destroy a session-owned Blob')
})
