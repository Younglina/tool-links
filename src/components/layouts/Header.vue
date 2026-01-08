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
            <i class="mdi mdi-robot-love-outline text-xl"></i>
          </div>
          <span class="logo-text">工具集</span>
        </div>
      </div>

      <div class="header-center">
        <SearchBar />
      </div>

      <div class="header-right">
        <div class="action-dropdown" ref="dropdownRef">
          <button @click="toggleDropdown" class="action-btn">
            <i class="mdi mdi-plus"></i>
            <span class="btn-text">添加</span>
            <i class="mdi mdi-chevron-down chevron" :class="{ 'rotate': showDropdown }"></i>
          </button>
          <Transition name="dropdown">
            <div v-if="showDropdown" class="dropdown-menu">
              <button @click="handleAction('website')" class="dropdown-item">
                <i class="mdi mdi-web"></i>
                <span>添加网站</span>
              </button>
              <button @click="handleAction('category')" class="dropdown-item">
                <i class="mdi mdi-folder-outline"></i>
                <span>分类管理</span>
              </button>
              <button @click="handleAction('tag')" class="dropdown-item">
                <i class="mdi mdi-tag-outline"></i>
                <span>标签管理</span>
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import SearchBar from '@/components/filter/SearchBar.vue'

const emit = defineEmits<{
  (e: 'toggle-sidebar'): void
  (e: 'action', type: 'website' | 'category' | 'tag'): void
}>()

const showDropdown = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const toggleSidebar = () => {
  emit('toggle-sidebar')
}

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const handleAction = (type: 'website' | 'category' | 'tag') => {
  showDropdown.value = false
  emit('action', type)
}

const handleClickOutside = (e: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
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
  margin-left: auto;
}

.header-right {
  flex-shrink: 0;
}

/* Action Dropdown */
.action-dropdown {
  position: relative;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--accent);
  color: #ffffff;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9375rem;
  transition: all 0.3s ease-out;
}

.neumorphism-theme .action-btn {
  box-shadow: 5px 5px 10px rgb(163,177,198,0.6), -5px -5px 10px rgba(255,255,255,0.5);
}

.action-btn:hover {
  background: var(--accent-light);
}

.neumorphism-theme .action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 8px 8px 16px rgb(163,177,198,0.7), -8px -8px 16px rgba(255,255,255,0.6);
}

.action-btn .mdi {
  font-size: 1.125rem;
}

.action-btn .chevron {
  font-size: 1rem;
  transition: transform 0.2s ease;
}

.action-btn .chevron.rotate {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 160px;
  background: var(--bg-primary);
  border-radius: 12px;
  overflow: hidden;
  z-index: 200;
}

.neumorphism-theme .dropdown-menu {
  box-shadow: var(--shadow-extruded);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 16px;
  color: var(--text-primary);
  font-size: 0.9375rem;
  font-weight: 500;
  transition: all 0.2s ease;
  text-align: left;
}

.dropdown-item:hover {
  background: var(--bg-secondary);
  color: var(--accent);
}

.dropdown-item .mdi {
  font-size: 1.125rem;
  color: var(--text-secondary);
}

.dropdown-item:hover .mdi {
  color: var(--accent);
}

/* Dropdown transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
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

  .header-right {
    margin-left: auto;
  }

  .header-center {
    width: 100%;
    max-width: none;
    margin-top: 0;
  }

  .btn-text {
    display: none;
  }

  .action-btn {
    padding: 10px 12px;
  }

  .action-btn .chevron {
    display: none;
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

  .dropdown-menu {
    right: 0;
    left: auto;
  }
}
</style>
