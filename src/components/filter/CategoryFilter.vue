<template>
  <div class="category-filter">
    <h3 class="filter-title">分类</h3>
    <ul class="category-list">
      <li
        @click="selectCategory(null)"
        :class="[
          'category-item',
          selectedCategoryId === null ? 'active' : ''
        ]"
      >
        <div class="category-icon">
          <i class="mdi mdi-apps"></i>
        </div>
        <span class="category-name">全部</span>
        <span class="category-count">{{ totalCount }}</span>
      </li>
      <li
        v-for="category in builtinCategories"
        :key="category.id"
        @click="selectCategory(category.id)"
        :class="[
          'category-item',
          selectedCategoryId === category.id ? 'active' : ''
        ]"
      >
        <div class="category-icon">
          <i :class="['mdi', `mdi-${category.iconName}`]"></i>
        </div>
        <span class="category-name">{{ category.name }}</span>
        <span class="category-count">0</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { DEFAULT_CATEGORIES } from '@/utils/constants'

const appStore = useAppStore()

const builtinCategories = ref(
  DEFAULT_CATEGORIES.map((cat, index) => ({
    ...cat,
    id: index + 1
  }))
)

const selectedCategoryId = computed(() => appStore.filter.categoryId)

const totalCount = ref(0)

const selectCategory = (id: number | null) => {
  appStore.setCategoryId(id)
}
</script>

<style scoped>
.category-filter {
  padding: 0 4px;
}

.filter-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0 8px 12px 8px;
}

.category-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  margin: 0 -4px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-primary);
  font-size: 0.9375rem;
  font-weight: 500;
}

.category-item:hover {
  background: var(--hover-bg);
}

.category-item.active {
  background: var(--bg-tertiary);
  color: var(--accent);
  font-weight: 600;
}

.category-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.category-item:hover .category-icon {
  background: var(--bg-secondary);
}

.category-item.active .category-icon {
  background: var(--accent);
  color: #ffffff;
}

.category-icon .mdi {
  font-size: 1.125rem;
}

.category-name {
  flex: 1;
  letter-spacing: -0.01em;
}

.category-count {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  font-weight: 400;
  background: var(--bg-tertiary);
  padding: 2px 8px;
  border-radius: 12px;
  min-width: 24px;
  text-align: center;
  transition: all 0.2s ease;
}

.category-item.active .category-count {
  background: var(--accent);
  color: #ffffff;
  font-weight: 600;
}
</style>
