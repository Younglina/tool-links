<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="drawer-backdrop" @click="handleClose">
        <Transition name="slide-in-right">
          <div v-if="isOpen" class="drawer-content" @click.stop>
            <!-- Header -->
            <div class="drawer-header">
              <div class="header-icon">
                <img
                  v-if="iconUrl"
                  :src="iconUrl"
                  :alt="website.name"
                  class="site-icon"
                  @error="handleIconError"
                />
                <div v-else class="site-icon placeholder-icon">
                  <i class="mdi mdi-web"></i>
                </div>
              </div>
              <div class="header-info">
                <h2 class="site-name">{{ website.name }}</h2>
                <a
                  :href="website.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="site-link"
                >
                  {{ formatUrl(website.url) }}
                  <i class="mdi mdi-open-in-new"></i>
                </a>
              </div>
              <button @click="handleClose" class="close-btn">
                <i class="mdi mdi-close"></i>
              </button>
            </div>

            <!-- Body -->
            <div class="drawer-body">
              <!-- Description -->
              <div class="info-section" v-if="website.description">
                <div class="section-label">
                  <i class="mdi mdi-text-box-outline"></i>
                  描述
                </div>
                <p class="description-text">{{ website.description }}</p>
              </div>

              <!-- Category -->
              <div class="info-section">
                <div class="section-label">
                  <i class="mdi mdi-folder-outline"></i>
                  分类
                </div>
                <span class="category-text">{{ category?.name || '未分类' }}</span>
              </div>

              <!-- Tags -->
              <div class="info-section" v-if="website.tagIds?.length > 0">
                <div class="section-label">
                  <i class="mdi mdi-tag-multiple-outline"></i>
                  标签
                </div>
                <div class="tags-row">
                  <span
                    v-for="tagId in website.tagIds"
                    :key="tagId"
                    class="tag-badge"
                  >
                    #{{ getTagName(tagId) }}
                  </span>
                </div>
              </div>

              <!-- API Keys -->
              <div class="info-section" v-if="website.apiKeys?.length > 0">
                <div class="section-label">
                  <i class="mdi mdi-key-outline"></i>
                  API Keys
                  <span class="key-count">{{ website.apiKeys.length }}</span>
                </div>
                <div class="api-keys-list">
                  <div
                    v-for="(key, index) in website.apiKeys"
                    :key="index"
                    class="api-key-item"
                  >
                    <code class="key-text">{{ maskApiKey(key) }}</code>
                    <button
                      @click="copyApiKey(key)"
                      :class="['copy-btn', { 'copied': copiedKey === key }]"
                    >
                      <i :class="['mdi', copiedKey === key ? 'mdi-check' : 'mdi-content-copy']"></i>
                    </button>
                  </div>
                </div>
              </div>
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

const formatUrl = (url: string) => {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname + (urlObj.pathname !== '/' ? urlObj.pathname : '')
  } catch {
    return url
  }
}

const handleClose = () => {
  emit('close')
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
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}

.drawer-content {
  width: 400px;
  max-width: 100%;
  height: 100%;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
}

.neumorphism-theme .drawer-content {
  box-shadow: -16px 0 32px rgb(163,177,198,0.4);
}

/* Header */
.drawer-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  border-bottom: 1px solid var(--border);
}

.neumorphism-theme .drawer-header {
  border-bottom: none;
  box-shadow: 0 2px 8px rgb(163,177,198,0.2);
}

.header-icon {
  flex-shrink: 0;
}

.site-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  object-fit: cover;
  background: var(--bg-secondary);
}

.neumorphism-theme .site-icon {
  box-shadow: var(--shadow-extruded-small);
}

.site-icon.placeholder-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%);
  color: #ffffff;
}

.site-icon.placeholder-icon .mdi {
  font-size: 28px;
}

.header-info {
  flex: 1;
  min-width: 0;
}

.site-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 4px;
  letter-spacing: -0.01em;
  line-height: 1.3;
}

.site-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8125rem;
  color: var(--accent);
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.site-link:hover {
  text-decoration: underline;
}

.site-link .mdi {
  font-size: 0.75rem;
  flex-shrink: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border-radius: 8px;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.neumorphism-theme .close-btn {
  background: var(--bg-primary);
  box-shadow: var(--shadow-extruded-small);
}

.close-btn:hover {
  color: var(--text-primary);
  background: var(--hover-bg);
}

.neumorphism-theme .close-btn:hover {
  box-shadow: var(--shadow-extruded);
}

.close-btn .mdi {
  font-size: 1rem;
}

/* Body */
.drawer-body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* Info Section */
.info-section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border);
}

.info-section:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.neumorphism-theme .info-section {
  border-bottom-color: rgba(163,177,198,0.15);
}

.section-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.section-label .mdi {
  font-size: 1rem;
  color: var(--accent);
}

.description-text {
  font-size: 0.875rem;
  color: var(--text-primary);
  line-height: 1.6;
  margin: 0;
}

/* Category */
.category-text {
  font-size: 0.875rem;
  color: var(--text-primary);
}

/* Tags Row */
.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-badge {
  font-size: 0.8125rem;
  color: var(--accent);
  font-weight: 500;
}

/* API Keys */
.key-count {
  margin-left: 6px;
  padding: 1px 6px;
  background: var(--accent);
  color: #ffffff;
  border-radius: 10px;
  font-size: 0.6875rem;
  font-weight: 600;
}

.api-keys-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.api-key-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.neumorphism-theme .api-key-item {
  background: var(--bg-primary);
  box-shadow: var(--shadow-inset-small);
}

.key-text {
  flex: 1;
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 0.75rem;
  color: var(--text-secondary);
  word-break: break-all;
}

.copy-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  color: var(--text-secondary);
  border-radius: 6px;
  flex-shrink: 0;
  transition: all 0.15s ease;
}

.neumorphism-theme .copy-btn {
  box-shadow: var(--shadow-extruded-small);
}

.copy-btn:hover {
  color: var(--accent);
}

.copy-btn.copied {
  background: #34c759;
  color: #ffffff;
}

.copy-btn .mdi {
  font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 640px) {
  .drawer-content {
    width: 100%;
  }

  .drawer-header {
    padding: 16px;
  }

  .site-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
  }

  .site-name {
    font-size: 1rem;
  }

  .drawer-body {
    padding: 16px;
  }
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-in-right-enter-active,
.slide-in-right-leave-active {
  transition: transform 0.25s cubic-bezier(0.32, 0.72, 0, 1);
}

.slide-in-right-enter-from,
.slide-in-right-leave-to {
  transform: translateX(100%);
}
</style>
