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
  left: 16px;
  color: var(--text-secondary);
  font-size: 1.125rem;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 12px 48px 12px 44px;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 400;
  background: var(--bg-tertiary);
  border: 1px solid transparent;
  transition: all 0.2s ease;
  color: var(--text-primary);
}

.search-input:focus {
  background: var(--bg-secondary);
  border-color: var(--accent);
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.08);
  outline: none;
}

.search-input::placeholder {
  color: var(--text-secondary);
  opacity: 0.6;
}

.clear-btn {
  position: absolute;
  right: 12px;
  padding: 4px;
  background: transparent;
  color: var(--text-secondary);
  border-radius: 50%;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}

.clear-btn .mdi {
  font-size: 1.125rem;
}

@media (max-width: 640px) {
  .search-input {
    padding: 10px 40px 10px 40px;
    border-radius: 10px;
    font-size: 0.875rem;
  }

  .search-icon {
    left: 12px;
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
