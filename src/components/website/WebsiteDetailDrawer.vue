<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="drawer-backdrop" @click="handleClose">
        <Transition name="slide-in-right">
          <div v-if="isOpen" class="drawer-content" @click.stop>
        <div class="drawer-header">
          <div class="drawer-icon-wrapper">
            <img
              v-if="iconUrl"
              :src="iconUrl"
              :alt="website.name"
              class="drawer-icon"
              @error="handleIconError"
            />
            <div v-else class="drawer-icon placeholder-icon">
              <i class="mdi mdi-application-outline"></i>
            </div>
          </div>
          <div class="flex-1">
            <h2 class="text-xl font-bold">{{ website.name }}</h2>
            <a
              :href="website.url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-[var(--accent)] hover:underline"
            >
              {{ website.url }}
            </a>
          </div>
          <button @click="handleClose" class="close-btn">
            <i class="mdi mdi-close text-xl"></i>
          </button>
        </div>

        <div class="drawer-body">
          <div class="info-section">
            <h3 class="section-title">描述</h3>
            <p class="text-[var(--text-secondary)]">{{ website.description }}</p>
          </div>

          <div class="info-section">
            <h3 class="section-title">分类</h3>
            <span class="category-badge">
              <i :class="['mdi', `mdi-${category?.iconName}`]"></i>
              {{ category?.name }}
            </span>
          </div>

          <div class="info-section">
            <h3 class="section-title">标签</h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tagId in website.tagIds"
                :key="tagId"
                class="tag-badge"
              >
                {{ getTagName(tagId) }}
              </span>
            </div>
          </div>

          <div class="info-section">
            <h3 class="section-title">API Keys</h3>
            <div v-if="website.apiKeys.length > 0" class="api-keys-list">
              <div
                v-for="(key, index) in website.apiKeys"
                :key="index"
                class="api-key-row"
              >
                <span class="key-text">{{ maskApiKey(key) }}</span>
                <button
                  @click="copyApiKey(key)"
                  :class="[
                    'btn btn-sm',
                    copiedKey === key ? 'text-green-500' : 'btn-secondary'
                  ]"
                >
                  <i :class="['mdi', copiedKey === key ? 'mdi-check' : 'mdi-content-copy']"></i>
                  {{ copiedKey === key ? '已复制' : '复制' }}
                </button>
              </div>
            </div>
            <div v-else class="text-[var(--text-secondary)]">暂无API Keys</div>
          </div>

          <div class="info-section">
            <h3 class="section-title">时间</h3>
            <p class="text-[var(--text-secondary)] text-sm">
              创建于：{{ formatDate(website.createdAt) }}
            </p>
            <p class="text-[var(--text-secondary)] text-sm">
              更新于：{{ formatDate(website.updatedAt) }}
            </p>
          </div>
        </div>

        <div class="drawer-footer">
          <button @click="handleEdit" class="btn btn-primary">
            <i class="mdi mdi-pencil"></i>
            编辑
          </button>
          <button @click="handleDelete" class="btn btn-danger">
            <i class="mdi mdi-delete"></i>
            删除
          </button>
        </div>
        </div>
      </Transition>
    </div>
  </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onUnmounted, watch } from 'vue'
import type { Website } from '@/types'
import { useCategories } from '@/composables/useCategories'
import { useTags } from '@/composables/useTags'
import { maskApiKey, copyToClipboard, formatDate } from '@/utils/validators'
import { ref } from 'vue'

const props = defineProps<{
  isOpen: boolean
  website: Website
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'edit'): void
  (e: 'delete'): void
}>()

const { categories, loadCategories } = useCategories()
const { tags, loadTags } = useTags()

const copiedKey = ref<string | null>(null)

watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    await Promise.all([
      loadCategories(),
      loadTags()
    ])
  }
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
  return categories.value.find(c => c.id === props.website.categoryId)
})

const getTagName = (tagId: number) => {
  const tag = tags.value.find(t => t.id === tagId)
  return tag?.name || ''
}

const handleClose = () => {
  emit('close')
}

const handleEdit = () => {
  emit('edit')
}

const handleDelete = () => {
  if (confirm('确定要删除这个网站吗？')) {
    emit('delete')
  }
}

const copyApiKey = async (key: string) => {
  await copyToClipboard(key)
  copiedKey.value = key
  setTimeout(() => {
    copiedKey.value = null
  }, 2000)
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
.drawer-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}

.drawer-content {
  width: 480px;
  max-width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: saturate(180%) blur(20px);
  border-left: 1px solid var(--border);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.08);
}

.drawer-header {
  padding: 24px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: flex-start;
  gap: 20px;
  position: sticky;
  top: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: saturate(180%) blur(20px);
  z-index: 10;
}

.drawer-icon-wrapper {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
}

.drawer-icon {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 18px;
  border: 1px solid var(--border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.drawer-icon.placeholder-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-primary) 100%);
  color: var(--text-secondary);
}

.drawer-icon.placeholder-icon .mdi {
  font-size: 40px;
  opacity: 0.4;
}

.drawer-header .flex-1 {
  flex: 1;
  min-width: 0;
}

.drawer-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 6px 0;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.drawer-header a {
  font-size: 0.875rem;
  color: var(--accent);
  word-break: break-all;
}

.close-btn {
  padding: 8px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border-radius: 10px;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.close-btn:hover {
  color: var(--text-primary);
  background: var(--hover-bg);
}

.drawer-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.info-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.category-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: 12px;
  font-size: 0.9375rem;
  color: var(--text-primary);
  font-weight: 500;
}

.tag-badge {
  display: inline-block;
  padding: 6px 14px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: 16px;
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
  transition: all 0.2s ease;
}

.tag-badge:hover {
  background: var(--accent);
  border-color: var(--accent);
  color: #ffffff;
}

.api-keys-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.api-key-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: 12px;
  gap: 12px;
}

.key-text {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Mono', Monaco, 'Courier New', monospace;
  color: var(--text-secondary);
  font-size: 0.875rem;
  flex: 1;
  word-break: break-all;
}

.api-key-row .btn {
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 0.875rem;
}

.api-key-row .btn-secondary {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
}

.drawer-footer {
  padding: 24px;
  border-top: 1px solid var(--border);
  display: flex;
  gap: 12px;
  position: sticky;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: saturate(180%) blur(20px);
  align-items: center;
  justify-content: flex-end;
}

@media (max-width: 640px) {
  .drawer-content {
    width: 100%;
  }

  .drawer-header {
    padding: 20px;
    gap: 16px;
  }

  .drawer-icon-wrapper {
    width: 64px;
    height: 64px;
  }

  .drawer-icon {
    border-radius: 14px;
  }

  .drawer-icon.placeholder-icon .mdi {
    font-size: 32px;
  }

  .drawer-header h2 {
    font-size: 1.25rem;
  }

  .drawer-body {
    padding: 20px;
  }

  .drawer-footer {
    padding: 20px;
    flex-direction: column;
  }

  .drawer-footer .btn {
    width: 100%;
    justify-content: center;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-in-right-enter-active,
.slide-in-right-leave-active {
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-in-right-enter-from,
.slide-in-right-leave-to {
  transform: translateX(100%);
}
</style>
