<template>
  <div class="app" :class="`${currentTheme}-theme`">
    <Header @toggle-sidebar="toggleSidebar" />

    <div class="app-body">
      <Sidebar :is-open="isSidebarOpen" @close="isSidebarOpen = false" />
      <MainContent />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTheme } from '@/composables/useTheme'
import Header from '@/components/layouts/Header.vue'
import Sidebar from '@/components/layouts/Sidebar.vue'
import MainContent from '@/components/layouts/MainContent.vue'
import { useDexie } from '@/composables/useDexie'

useDexie()

const { currentTheme } = useTheme()
const isSidebarOpen = ref(false)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
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

.zen-theme {
  font-family: 'Zen Kaku Gothic New', sans-serif;
}
</style>
