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
          <div class="logo-icon">
            <i class="mdi mdi-sparkles text-xl"></i>
          </div>
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
  background: var(--bg-primary);
  position: sticky;
  top: 0;
  z-index: 100;
}

/* Neumorphism header styles */
.neumorphism-theme .header {
  box-shadow: 0 4px 10px rgb(163,177,198,0.4), 0 -2px 6px rgba(255,255,255,0.6);
}

.header-content {
  padding: 0 2rem;
  height: 64px;
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
  padding: 10px;
  background: var(--bg-primary);
  color: var(--text-secondary);
  border-radius: 12px;
  transition: all 0.3s ease-out;
}

/* Neumorphism menu button */
.neumorphism-theme .menu-btn {
  box-shadow: var(--shadow-extruded-small);
}

.neumorphism-theme .menu-btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-extruded);
}

.neumorphism-theme .menu-btn:active {
  transform: translateY(0.5px);
  box-shadow: var(--shadow-inset-small);
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  color: var(--accent);
  background: var(--bg-primary);
}

/* Neumorphism logo icon well */
.neumorphism-theme .logo-icon {
  box-shadow: var(--shadow-inset);
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.header-center {
  flex: 1;
  max-width: 560px;
}

@media (max-width: 1024px) {
  .header-content {
    height: 60px;
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
    height: 56px;
  }

  .logo-text {
    font-size: 1.125rem;
  }

  .logo-icon {
    width: 36px;
    height: 36px;
  }

  .logo-icon .mdi {
    font-size: 1.25rem;
  }
}
</style>
