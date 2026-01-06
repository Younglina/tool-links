<template>
  <div
    @click="handleClick"
    class="website-card"
  >
    <div class="card-header">
      <div class="card-icon-wrapper">
        <img
          v-if="iconUrl"
          :src="iconUrl"
          :alt="website.name"
          class="website-icon"
          @error="handleIconError"
        />
        <div v-else class="website-icon placeholder-icon">
          <i class="mdi mdi-application-outline"></i>
        </div>
      </div>
      <div class="card-info">
        <h3 class="website-name">{{ website.name }}</h3>
        <div class="card-tags">
          <span
            v-for="tagId in website.tagIds.slice(0, 3)"
            :key="tagId"
            class="tag"
          >
            {{ getTagName(tagId) }}
          </span>
          <span v-if="website.tagIds.length > 3" class="tag-more">
            +{{ website.tagIds.length - 3 }}
          </span>
        </div>
      </div>
    </div>
    <p class="description line-clamp-2">
      {{ website.description }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, onMounted } from 'vue'
import type { Website } from '@/types'
import { useCategories } from '@/composables/useCategories'
import { useTags } from '@/composables/useTags'

const props = defineProps<{
  website: Website
}>()

const emit = defineEmits<{
  (e: 'click'): void
}>()

const { categories } = useCategories()
const { tags, loadTags } = useTags()

onMounted(() => {
  loadTags()
})

const iconUrl = computed(() => {
  if (!props.website.icon || props.website.icon.byteLength === 0) {
    return ''
  }
  try {
    const blob = new Blob([props.website.icon], { type: props.website.iconMimeType || 'image/png' })
    return URL.createObjectURL(blob)
  } catch (error) {
    console.error('Failed to create icon URL:', error)
    return ''
  }
})

const getCategoryName = (categoryId: number) => {
  const category = categories.value.find(c => c.id === categoryId)
  return category?.name || ''
}

const getTagName = (tagId: number) => {
  const tag = tags.value.find(t => t.id === tagId)
  return tag?.name || ''
}

const getDomain = (url: string) => {
  try {
    const domain = new URL(url).hostname
    return domain.replace('www.', '')
  } catch {
    return url
  }
}

const handleClick = () => {
  emit('click')
}

const handleIconError = () => {
  console.warn(`Failed to load icon for ${props.website.name}`)
}

onUnmounted(() => {
  if (iconUrl.value) {
    URL.revokeObjectURL(iconUrl.value)
  }
})
</script>

<style scoped>
.website-card {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: var(--shadow);
}

.website-card:hover {
  transform: translateY(-3px) scale(1.01);
  box-shadow: var(--shadow-hover);
  border-color: rgba(0, 122, 255, 0.2);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-icon-wrapper {
  width: 56px;
  height: 56px;
  flex-shrink: 0;
}

.website-icon {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-primary) 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.website-icon.placeholder-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-primary) 100%);
  color: var(--text-secondary);
}

.website-icon.placeholder-icon .mdi {
  font-size: 28px;
  opacity: 0.4;
}

.card-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.website-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.3;
  letter-spacing: -0.01em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tag {
  display: inline-block;
  padding: 3px 8px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border-radius: 10px;
  font-size: 0.6875rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.tag:hover {
  background: var(--accent);
  color: #ffffff;
}

.tag-more {
  display: inline-block;
  padding: 3px 8px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border-radius: 10px;
  font-size: 0.6875rem;
  font-weight: 500;
}

.description {
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--text-secondary);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 640px) {
  .website-card {
    padding: 12px;
    border-radius: 12px;
    gap: 10px;
  }

  .card-icon-wrapper {
    width: 48px;
    height: 48px;
  }

  .website-icon {
    border-radius: 10px;
  }

  .website-icon.placeholder-icon .mdi {
    font-size: 24px;
  }

  .website-name {
    font-size: 0.9375rem;
  }

  .description {
    font-size: 0.8125rem;
  }
}
</style>
