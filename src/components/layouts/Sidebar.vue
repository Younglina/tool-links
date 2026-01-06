<template>
  <aside :class="['sidebar', { 'open': isOpen }]">
    <div class="sidebar-content">
      <CategoryFilter />
    </div>
  </aside>
</template>

<script setup lang="ts">
import CategoryFilter from '@/components/filter/CategoryFilter.vue'

defineProps<{
  isOpen: boolean
}>()

defineEmits<{
  (e: 'close'): void
}>()
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: saturate(180%) blur(20px);
  border-right: 1px solid var(--border);
  overflow-y: auto;
  transform: translateX(-100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 50;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.sidebar-content {
  padding: 24px 16px;
}

.sidebar.open {
  transform: translateX(0);
}

.sidebar::-webkit-scrollbar {
  width: 4px;
}

.sidebar::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 2px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}

@media (min-width: 1024px) {
  .sidebar {
    position: sticky;
    top: 0;
    height: calc(100vh - 56px);
    transform: translateX(0);
    background: transparent;
    border-right: none;
    box-shadow: none;
  }
}

@media (max-width: 1023px) {
  .sidebar::after {
    content: '';
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(4px);
    z-index: -1;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }

  .sidebar.open::after {
    opacity: 1;
    pointer-events: auto;
  }
}
</style>
