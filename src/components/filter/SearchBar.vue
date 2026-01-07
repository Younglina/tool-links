<template>
  <div class="search-bar">
    <i class="mdi mdi-magnify search-icon"></i>
    <input
      v-model="searchQuery"
      type="text"
      placeholder="搜索工具..."
      class="search-input"
      @input="handleSearch"
    />
    <button
      v-if="searchQuery"
      @click="clearSearch"
      class="clear-btn"
    >
      <i class="mdi mdi-close-circle"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
const searchQuery = ref('')

const handleSearch = () => {
  appStore.setSearchQuery(searchQuery.value)
}

const clearSearch = () => {
  searchQuery.value = ''
  appStore.setSearchQuery('')
}
</script>

<style scoped>
.search-bar {
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 18px;
  color: var(--text-secondary);
  font-size: 1.125rem;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 14px 48px 14px 48px;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 400;
  background: var(--bg-primary);
  border: none;
  transition: all 0.3s ease-out;
  color: var(--text-primary);
}

/* Neumorphism search input */
.neumorphism-theme .search-input {
  box-shadow: var(--shadow-inset);
}

.neumorphism-theme .search-input:focus {
  box-shadow: var(--shadow-inset-deep);
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.search-input::placeholder {
  color: #A0AEC0;
}

.clear-btn {
  position: absolute;
  right: 14px;
  padding: 6px;
  background: transparent;
  color: var(--text-secondary);
  border-radius: 50%;
  transition: all 0.3s ease-out;
}

.clear-btn:hover {
  color: var(--text-primary);
}

/* Neumorphism clear button */
.neumorphism-theme .clear-btn:hover {
  background: var(--bg-primary);
  box-shadow: var(--shadow-extruded-small);
}

.clear-btn .mdi {
  font-size: 1.125rem;
}

@media (max-width: 640px) {
  .search-input {
    padding: 12px 40px 12px 44px;
    border-radius: 14px;
    font-size: 0.875rem;
  }

  .search-icon {
    left: 14px;
    font-size: 1rem;
  }

  .clear-btn {
    right: 10px;
    padding: 4px;
  }

  .clear-btn .mdi {
    font-size: 1rem;
  }
}
</style>
