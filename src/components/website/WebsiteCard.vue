<template>
  <div
    @click="handleClick"
    class="website-card"
  >
    <!-- Hover Actions -->
    <div class="card-actions">
      <a
        :href="website.url"
        target="_blank"
        rel="noopener noreferrer"
        @click.stop
        class="action-btn action-link"
        title="访问网站"
      >
        <i class="mdi mdi-open-in-new"></i>
      </a>
      <button @click.stop="handleEdit" class="action-btn" title="编辑">
        <i class="mdi mdi-pencil-outline"></i>
      </button>
      <button @click.stop="handleDelete" class="action-btn action-delete" title="删除">
        <i class="mdi mdi-delete-outline"></i>
      </button>
    </div>

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
        <!-- Categories as tag style -->
        <div class="category-tags" v-if="categoryNames.length > 0">
          <span
            v-for="name in categoryNames"
            :key="name"
            class="category-tag"
          >
            {{ name }}
          </span>
        </div>
      </div>
    </div>

    <p class="description line-clamp-2">
      {{ website.description }}
    </p>

    <!-- Tags as #tagname -->
    <div class="card-tags" v-if="(website.tagIds || []).length > 0">
      <span
        v-for="tagId in (website.tagIds || []).slice(0, 4)"
        :key="tagId"
        class="hash-tag"
      >
        #{{ getTagName(tagId) }}
      </span>
      <span v-if="(website.tagIds?.length || 0) > 4" class="hash-tag more">
        +{{ website.tagIds.length - 4 }}
      </span>
    </div>
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
  (e: 'edit'): void
  (e: 'delete'): void
}>()

const { categories, loadCategories } = useCategories()
const { tags, loadTags } = useTags()

onMounted(() => {
  loadCategories()
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

const category = computed(() => {
  return categories.value.find(c => (props.website.categoryIds || []).includes(c.id!))
})

const categoryNames = computed(() => {
  return (props.website.categoryIds || [])
    .map(id => categories.value.find(c => c.id === id)?.name)
    .filter(Boolean) as string[]
})

const getTagName = (tagId: number) => {
  const tag = tags.value.find(t => t.id === tagId)
  return tag?.name || ''
}

const handleClick = () => {
  emit('click')
}

const handleEdit = () => {
  emit('edit')
}

const handleDelete = () => {
  if (confirm('确定要删除这个网站吗？')) {
    emit('delete')
  }
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
  transition: all 0.3s ease-out;
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
}

/* Card Actions */
.card-actions {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 6px;
  opacity: 0;
  transform: translateY(-4px);
  transition: all 0.2s ease;
  z-index: 10;
}

.website-card:hover .card-actions {
  opacity: 1;
  transform: translateY(0);
}

.action-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  color: var(--text-secondary);
  border-radius: 8px;
  transition: all 0.15s ease;
}

.neumorphism-theme .action-btn {
  box-shadow: var(--shadow-extruded-small);
}

.action-btn:hover {
  color: var(--accent);
  background: var(--bg-secondary);
}

.action-btn.action-delete:hover {
  color: #ff3b30;
}

.action-btn.action-link:hover {
  color: var(--accent);
  background: var(--accent);
  color: #ffffff;
}

.neumorphism-theme .action-btn.action-link:hover {
  box-shadow: 2px 2px 4px rgba(108, 99, 255, 0.3), -1px -1px 3px rgba(139, 132, 255, 0.2);
}

.action-btn .mdi {
  font-size: 1rem;
}

/* Neumorphism card */
.neumorphism-theme .website-card {
  box-shadow: var(--shadow-extruded);
  border: none;
}

.neumorphism-theme .website-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-extruded-hover);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 14px;
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
  border-radius: 14px;
  background: var(--bg-primary);
}

/* Neumorphism icon */
.neumorphism-theme .website-icon {
  box-shadow: var(--shadow-inset);
  border: none;
}

.website-icon.placeholder-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

/* Neumorphism placeholder icon */
.neumorphism-theme .website-icon.placeholder-icon {
  box-shadow: var(--shadow-inset-deep);
}

.website-icon.placeholder-icon .mdi {
  font-size: 28px;
  opacity: 0.5;
}

.card-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.website-name {
  font-size: 1.0625rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.3;
  letter-spacing: -0.01em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Category Tags */
.category-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.category-tag {
  display: inline-block;
  width: fit-content;
  padding: 4px 10px;
  background: var(--bg-primary);
  color: var(--text-secondary);
  border-radius: 10px;
  font-size: 0.6875rem;
  font-weight: 500;
  transition: all 0.3s ease-out;
}

.neumorphism-theme .category-tag {
  box-shadow: var(--shadow-inset-small);
}

/* Hash Tags */
.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: auto;
}

.hash-tag {
  font-size: 0.75rem;
  color: var(--accent);
  font-weight: 500;
  transition: color 0.2s ease;
}

.hash-tag:hover {
  color: var(--accent-light);
}

.hash-tag.more {
  color: var(--text-secondary);
}

.description {
  font-size: 0.875rem;
  line-height: 1.6;
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
    padding: 16px;
    border-radius: 16px;
    gap: 10px;
  }

  .card-icon-wrapper {
    width: 48px;
    height: 48px;
  }

  .website-icon {
    border-radius: 12px;
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

  .hash-tag {
    font-size: 0.6875rem;
  }
}
</style>
