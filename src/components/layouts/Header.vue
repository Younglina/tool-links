<template>
  <header class="header">
    <div class="header-content">
      <div class="header-left">
        <button
          @click="toggleSidebar"
          class="menu-btn lg:hidden"
        >
          <i class="mdi mdi-menu text-xl"></i>
        </button>
        <div class="logo">
          <i class="mdi mdi-sparkles text-2xl"></i>
          <span class="logo-text">AI工具集</span>
        </div>
      </div>

      <div class="header-center">
        <SearchBar />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import SearchBar from '@/components/filter/SearchBar.vue'

const emit = defineEmits<{
  (e: 'toggle-sidebar'): void
}>()

const toggleSidebar = () => {
  emit('toggle-sidebar')
}
</script>

<style scoped>
.header {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: saturate(180%) blur(20px);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.header-content {
  padding: 0 2rem;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
  min-width: 200px;
}

.menu-btn {
  padding: 8px;
  background: var(--hover-bg);
  color: var(--text-secondary);
  border-radius: 10px;
  transition: all 0.2s ease;
}

.menu-btn:hover {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo .mdi {
  color: var(--accent);
}

.logo-text {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.header-center {
  flex: 1;
  max-width: 560px;
}

@media (max-width: 1024px) {
  .header-content {
    height: 52px;
    padding: 0 1.5rem;
    flex-wrap: wrap;
  }

  .header-left {
    min-width: auto;
  }

  .header-center {
    order: 3;
    width: 100%;
    max-width: none;
    margin-top: 0;
  }
}

@media (max-width: 640px) {
  .header-content {
    padding: 0 1rem;
    height: 48px;
  }

  .logo-text {
    font-size: 1rem;
  }

  .logo .mdi {
    font-size: 1.5rem;
  }
}
</style>
