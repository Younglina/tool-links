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
        v-for="category in categoriesWithCount"
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
        <span class="category-count">{{ category.count }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useCategories } from '@/composables/useCategories'
import { useWebsites } from '@/composables/useWebsites'

const appStore = useAppStore()
const { categories, loadCategories } = useCategories()
const { websites, loadWebsites } = useWebsites()

onMounted(async () => {
  await Promise.all([loadCategories(), loadWebsites()])
})

const selectedCategoryId = computed(() => appStore.filter.categoryId)

const totalCount = computed(() => websites.value.length)

const categoriesWithCount = computed(() => {
  return categories.value.map(category => ({
    ...category,
    count: websites.value.filter(w => (w.categoryIds || []).includes(category.id!)).length
  }))
})

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
  padding: 0 8px 16px 8px;
}

.category-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease-out;
  color: var(--text-primary);
  font-size: 0.9375rem;
  font-weight: 500;
  background: var(--bg-primary);
}

/* Neumorphism category item */
.neumorphism-theme .category-item {
  box-shadow: var(--shadow-extruded-small);
}

.neumorphism-theme .category-item:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-extruded);
}

.neumorphism-theme .category-item.active {
  box-shadow: var(--shadow-inset);
  color: var(--accent);
}

.category-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: var(--bg-primary);
  color: var(--text-secondary);
  flex-shrink: 0;
  transition: all 0.3s ease-out;
}

/* Neumorphism category icon */
.neumorphism-theme .category-icon {
  box-shadow: var(--shadow-inset-small);
}

.neumorphism-theme .category-item.active .category-icon {
  background: var(--accent);
  color: #ffffff;
  box-shadow: 3px 3px 6px rgba(108, 99, 255, 0.4), -3px -3px 6px rgba(139, 132, 255, 0.3);
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
  font-weight: 500;
  padding: 3px 10px;
  border-radius: 12px;
  min-width: 28px;
  text-align: center;
  transition: all 0.3s ease-out;
  background: var(--bg-primary);
}

/* Neumorphism category count */
.neumorphism-theme .category-count {
  box-shadow: var(--shadow-inset-small);
}

.neumorphism-theme .category-item.active .category-count {
  background: var(--accent);
  color: #ffffff;
  box-shadow: inset 2px 2px 4px rgba(0,0,0,0.15), inset -2px -2px 4px rgba(255,255,255,0.1);
}

</style>
