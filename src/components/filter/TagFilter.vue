<template>
  <div class="tag-filter">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold">标签</h3>
      <button @click="showAddDialog = true" class="text-[var(--accent)] text-sm hover:underline">
        + 新建
      </button>
    </div>
    <div class="flex flex-wrap gap-2">
      <label
        v-for="tag in tags"
        :key="tag.id"
        class="tag-checkbox"
      >
        <input
          type="checkbox"
          :value="tag.id"
          v-model="selectedTags"
          class="hidden"
        />
        <span
          :class="[
            'tag-label px-3 py-1 rounded-full text-sm cursor-pointer transition',
            selectedTags.includes(tag.id!) ? 'active' : ''
          ]"
        >
          {{ tag.name }}
          <span class="text-[var(--text-secondary)] text-xs ml-1">({{ tag.count }})</span>
        </span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTags } from '@/composables/useTags'
import { useAppStore } from '@/stores/app'
import type { Tag } from '@/types'

const { tags, loadTags } = useTags()
const appStore = useAppStore()

const showAddDialog = ref(false)

const selectedTags = computed({
  get: () => appStore.filter.tagIds,
  set: (value: number[]) => {
    appStore.setTagIds(value)
  }
})

loadTags()
</script>

<style scoped>
.tag-checkbox {
  display: block;
}

.tag-label {
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.tag-label:hover {
  border-color: var(--accent);
}

.tag-label.active {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--text-primary);
}
</style>
