<template>
  <div class="app" :class="`${currentTheme}-theme`">
    <Header @toggle-sidebar="toggleSidebar" @action="handleAction" />

    <div class="app-body">
      <Sidebar :is-open="isSidebarOpen" @close="isSidebarOpen = false" />
      <MainContent ref="mainContentRef" />
    </div>

    <!-- 同步设置模态框 -->
    <SyncSettings :open="showSyncModal" @close="showSyncModal = false" @synced="handleSynced" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTheme } from '@/composables/useTheme'
import Header from '@/components/layouts/Header.vue'
import Sidebar from '@/components/layouts/Sidebar.vue'
import MainContent from '@/components/layouts/MainContent.vue'
import SyncSettings from '@/components/SyncSettings.vue'
import { useDexie } from '@/composables/useDexie'

useDexie()

const { currentTheme } = useTheme()
const isSidebarOpen = ref(false)
const showSyncModal = ref(false)
const mainContentRef = ref<InstanceType<typeof MainContent> | null>(null)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const handleAction = (type: 'website' | 'category' | 'tag' | 'sync') => {
  if (type === 'sync') {
    showSyncModal.value = true
  } else {
    mainContentRef.value?.openModal(type)
  }
}

const handleSynced = () => {
  // 同步完成后重新加载数据
  mainContentRef.value?.refreshData()
}
</script>

<style>
@import '@/styles/main.css';

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-body {
  display: flex;
  flex: 1;
  position: relative;
}

.neumorphism-theme {
  font-family: 'DM Sans', sans-serif;
  background-color: var(--bg-primary);
}

.neumorphism-theme h1,
.neumorphism-theme h2,
.neumorphism-theme h3,
.neumorphism-theme h4,
.neumorphism-theme h5,
.neumorphism-theme h6 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700;
  letter-spacing: -0.02em;
}
</style>
