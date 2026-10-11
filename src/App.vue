<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import StudentHome from './views/StudentHome.vue'
import TrainingDetail from './views/TrainingDetail.vue'
import TrainingComplete from './views/TrainingComplete.vue'
import StudentProfile from './views/StudentProfile.vue'
import TrainingRecordList from './views/TrainingRecordList.vue'
import TrainingRecordDetail from './views/TrainingRecordDetail.vue'
import { trainings } from './data/mock'
import { createMockRecords } from './data/mockRecords'
import { useTrainingRecords } from './composables/useTrainingRecords'
import type { TrainingRecord } from './types/training'

const route = ref(window.location.hash || '#/')
const { sessionRecords, historicalRecords, addRecord, getRecord } = useTrainingRecords(createMockRecords())
const completedIds = computed(() => [...new Set(sessionRecords.value.map(record => record.trainingId))])
const selectedTraining = computed(() => trainings.find(item => route.value === '#/training/' + item.id))
const isCompletionRoute = computed(() => route.value.startsWith('#/complete/'))
const completedRecord = computed(() => {
  const record = isCompletionRoute.value ? getRecord(route.value.slice('#/complete/'.length)) : undefined
  return record?.source === 'session' ? record : undefined
})
const isRecordDetail = computed(() => route.value.startsWith('#/records/'))
const selectedRecord = computed(() => isRecordDetail.value ? getRecord(route.value.slice('#/records/'.length)) : undefined)
const isHome = computed(() => route.value === '#/' || route.value === '#')
function syncRoute() { route.value = window.location.hash || '#/' }
function openTraining(id: string) { window.location.hash = '/training/' + id }
function goHome() { window.location.hash = '/' }
function completeTraining(record: TrainingRecord) {
  if (record.trainingId !== selectedTraining.value?.id || record.source !== 'session') return
  addRecord(record)
  window.location.hash = '/complete/' + record.id
}
window.addEventListener('hashchange', syncRoute)
onBeforeUnmount(() => window.removeEventListener('hashchange', syncRoute))
watch(route, async () => {
  const title = completedRecord.value ? '训练完成' : selectedRecord.value ? selectedRecord.value.training.title + ' · 记录'
    : selectedTraining.value?.title ?? (route.value === '#/my' ? '我的' : route.value === '#/records' ? '训练记录' : '今日训练')
  document.title = title + ' · 轻言'
  await nextTick()
  window.scrollTo(0, 0)
  document.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true })
}, { immediate: true })
</script>

<template>
  <div class="app-shell">
    <TrainingDetail v-if="selectedTraining" :key="selectedTraining.id" :training="selectedTraining" @back="goHome" @complete="completeTraining" />
    <TrainingComplete v-else-if="completedRecord" :record="completedRecord" @home="goHome" />
    <StudentHome v-else-if="isHome" :completed-ids="completedIds" @open-training="openTraining" />
    <StudentProfile v-else-if="route === '#/my'" :record-count="sessionRecords.length" />
    <TrainingRecordList v-else-if="route === '#/records'" :session-records="sessionRecords" :mock-records="historicalRecords" />
    <TrainingRecordDetail v-else-if="selectedRecord" :key="selectedRecord.id" :record="selectedRecord" />
    <main v-else-if="isCompletionRoute || isRecordDetail" class="not-found"><h1 tabindex="-1">暂时找不到这条记录</h1><p>真实记录仅保留在本次打开期间，刷新或关闭页面后会丢失。也可能是链接不完整。</p><a class="primary-button records-back" href="#/records">查看训练记录列表</a><button class="text-button" @click="goHome">返回首页</button></main>
    <main v-else class="not-found"><h1 tabindex="-1">暂时找不到这个页面</h1><p>链接可能不完整，请返回首页。</p><button class="primary-button" @click="goHome">返回首页</button></main>
  </div>
</template>
