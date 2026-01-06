<template>
  <main class="main-content">
    <div class="content-wrapper">
      <div class="content-header">
        <h1 class="text-2xl font-bold">{{ title }}</h1>
        <button
          @click="showAddForm = true"
          class="btn btn-primary"
        >
          <i class="mdi mdi-plus"></i>
          添加网站
        </button>
      </div>

      <div v-if="isLoading" class="loading-container">
        <i class="mdi mdi-loading mdi-spin text-4xl"></i>
        <p class="mt-2">加载中...</p>
      </div>

      <div v-else-if="filteredWebsites.length === 0" class="empty-state">
        <i class="mdi mdi-folder-multiple text-6xl text-[var(--text-secondary)]"></i>
        <p class="text-[var(--text-secondary)] mt-4">还没有对应网站，点击上方按钮添加第一个网站吧</p>
        <button
          v-if="hasFilters"
          @click="resetFilters"
          class="btn btn-secondary mt-4"
        >
          <i class="mdi mdi-filter-remove-outline"></i>
          清除筛选
        </button>
      </div>

      <div v-else class="websites-grid">
        <WebsiteCard
          v-for="(website, index) in filteredWebsites"
          :key="website.id"
          :website="website"
          :class="`stagger-${(index % 6) + 1}`"
          @click="showDetail(website)"
        />
      </div>
    </div>

    <WebsiteDetailDrawer
      v-if="selectedWebsite"
      :is-open="showDetailDrawer"
      :website="selectedWebsite"
      @close="closeDetailDrawer"
      @edit="handleEditWebsite"
      @delete="handleDeleteWebsite"
    />

    <div v-if="showAddForm || showEditForm" class="modal-backdrop">
      <div class="modal-content">
        <button @click="closeForm" class="close-modal-btn">
          <i class="mdi mdi-close text-xl"></i>
        </button>
        <WebsiteForm
          v-if="showAddForm"
          @submit="handleAddWebsite"
          @cancel="closeForm"
        />
        <WebsiteForm
          v-else
          :website="editingWebsite"
          @submit="handleUpdateWebsite"
          @cancel="closeForm"
        />
      </div>
    </div>

    <CategoryDialog
      :is-open="showCategoryDialog"
      @close="showCategoryDialog = false"
      @submit="handleCategorySubmit"
    />

    <TagDialog
      :is-open="showTagDialog"
      @close="showTagDialog = false"
      @submit="handleTagSubmit"
    />
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useWebsites } from '@/composables/useWebsites'
import { useCategories } from '@/composables/useCategories'
import { useTags } from '@/composables/useTags'
import { useAppStore } from '@/stores/app'
import WebsiteCard from '@/components/website/WebsiteCard.vue'
import WebsiteDetailDrawer from '@/components/website/WebsiteDetailDrawer.vue'
import WebsiteForm from '@/components/website/WebsiteForm.vue'
import CategoryDialog from '@/components/common/CategoryDialog.vue'
import TagDialog from '@/components/common/TagDialog.vue'
import type { Website } from '@/types'

const { websites, isLoading, loadWebsites, addWebsite, updateWebsite, deleteWebsite } = useWebsites()
const { categories, loadCategories, addCategory, updateCategory } = useCategories()
const { loadTags } = useTags()
const appStore = useAppStore()

const selectedWebsite = ref<Website | null>(null)
const editingWebsite = ref<Website | null>(null)
const showDetailDrawer = ref(false)
const showAddForm = ref(false)
const showEditForm = ref(false)
const showCategoryDialog = ref(false)
const showTagDialog = ref(false)

onMounted(async () => {
  await Promise.all([
    loadWebsites(),
    loadCategories(),
    loadTags()
  ])
})

const title = computed(() => {
  if (appStore.filter.searchQuery) {
    return `搜索: "${appStore.filter.searchQuery}"`
  }
  if (appStore.filter.categoryId) {
    const category = categories.value.find(c => c.id === appStore.filter.categoryId)
    return category?.name || '全部网站'
  }
  return '全部网站'
})

const filteredWebsites = computed(() => {
  let result = [...websites.value]

  if (appStore.filter.searchQuery) {
    const query = appStore.filter.searchQuery.toLowerCase()
    result = result.filter(w =>
      w.name.toLowerCase().includes(query) ||
      w.description.toLowerCase().includes(query) ||
      w.url.toLowerCase().includes(query)
    )
  }

  if (appStore.filter.categoryId) {
    result = result.filter(w => w.categoryId === appStore.filter.categoryId)
  }

  if (appStore.filter.tagIds.length > 0) {
    result = result.filter(w =>
      appStore.filter.tagIds.some(tagId => w.tagIds.includes(tagId))
    )
  }

  return result
})

const hasFilters = computed(() => {
  return !!appStore.filter.searchQuery
})

const resetFilters = () => {
  appStore.resetFilter()
}

const showDetail = (website: Website) => {
  selectedWebsite.value = website
  showDetailDrawer.value = true
}

const closeDetailDrawer = () => {
  showDetailDrawer.value = false
}

const handleAddWebsite = async (data: Omit<Website, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    await addWebsite(data)
    closeForm()
  } catch (error) {
    console.error('Failed to add website:', error)
    alert('添加网站失败')
  }
}

const handleEditWebsite = () => {
  editingWebsite.value = selectedWebsite.value
  closeDetailDrawer()
  showEditForm.value = true
}

const handleUpdateWebsite = async (data: Omit<Website, 'id' | 'createdAt' | 'updatedAt'>) => {
  if (editingWebsite.value?.id) {
    try {
      await updateWebsite(editingWebsite.value.id, data)
      closeForm()
    } catch (error) {
      console.error('Failed to update website:', error)
      alert('更新网站失败')
    }
  }
}

const handleDeleteWebsite = async () => {
  if (selectedWebsite.value?.id) {
    try {
      await deleteWebsite(selectedWebsite.value.id)
      closeDetailDrawer()
    } catch (error) {
      console.error('Failed to delete website:', error)
      alert('删除网站失败')
    }
  }
}

const closeForm = () => {
  showAddForm.value = false
  showEditForm.value = false
  editingWebsite.value = null
}

const handleCategorySubmit = async (data) => {
  try {
    await addCategory(data)
  } catch (error) {
    console.error('Failed to add category:', error)
    alert('添加分类失败')
  }
}

const handleTagSubmit = async (data) => {
  console.log('Tag submit:', data)
}
</script>

<style scoped>
.main-content {
  flex: 1;
  padding: 24px 32px;
  min-height: calc(100vh - 56px);
  background: var(--bg-primary);
}

.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  gap: 1rem;
}

.content-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.loading-container .mdi {
  color: var(--accent);
  opacity: 0.6;
  font-size: 48px;
}

.loading-container p {
  color: var(--text-secondary);
  margin-top: 16px;
  font-size: 0.9375rem;
  font-weight: 500;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  padding: 60px 20px;
}

.empty-state .mdi {
  font-size: 64px;
  color: var(--border);
  opacity: 0.5;
  margin-bottom: 16px;
}

.empty-state p {
  color: var(--text-secondary);
  margin-top: 0;
  font-size: 1rem;
  max-width: 360px;
  line-height: 1.5;
}

.websites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 4px;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  overflow-y: auto;
}

.modal-content {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 20px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
}

.close-modal-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 8px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  z-index: 10;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.close-modal-btn:hover {
  color: var(--text-primary);
  background: var(--hover-bg);
}

.close-modal-btn .mdi {
  font-size: 1.125rem;
}

@media (max-width: 1024px) {
  .main-content {
    padding: 20px 24px;
  }

  .content-header {
    margin-bottom: 24px;
  }

  .content-header h1 {
    font-size: 1.75rem;
  }

  .websites-grid {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 640px) {
  .main-content {
    padding: 16px 16px;
  }

  .content-header {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 20px;
  }

  .content-header h1 {
    font-size: 1.5rem;
  }

  .websites-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .empty-state {
    min-height: 300px;
    padding: 40px 20px;
  }

  .empty-state .mdi {
    font-size: 56px;
  }
}
</style>
