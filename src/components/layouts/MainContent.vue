<template>
  <main class="main-content">
    <div class="content-wrapper">
      <div class="content-header">
        <h1 class="text-2xl font-bold">{{ title }}</h1>
      </div>

      <div v-if="isLoading" class="loading-container">
        <i class="mdi mdi-loading mdi-spin text-4xl"></i>
        <p class="mt-2">加载中...</p>
      </div>

      <div v-else-if="filteredWebsites.length === 0" class="empty-state">
        <i class="mdi mdi-folder-multiple text-6xl text-[var(--text-secondary)]"></i>
        <p class="text-[var(--text-secondary)] mt-4">还没有对应网站，点击右上角按钮添加第一个网站吧</p>
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
          @edit="handleCardEdit(website)"
          @delete="handleCardDelete(website)"
        />
      </div>
    </div>

    <WebsiteDetailDrawer
      v-if="selectedWebsite"
      :is-open="showDetailDrawer"
      :website="selectedWebsite"
      @close="closeDetailDrawer"
    />

    <!-- Website Form Modal -->
    <div v-if="showAddForm || showEditForm" class="modal-backdrop">
      <div class="modal-content">
        <button @click="closeForm" class="close-modal-btn">
          <i class="mdi mdi-close text-xl"></i>
        </button>
        <div class="modal-scroll-area">
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
    </div>

    <!-- Category Manage Modal -->
    <CategoryManageModal
      :is-open="showCategoryModal"
      @close="showCategoryModal = false"
    />

    <!-- Tag Manage Modal -->
    <TagManageModal
      :is-open="showTagModal"
      @close="showTagModal = false"
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
import CategoryManageModal from '@/components/common/CategoryManageModal.vue'
import TagManageModal from '@/components/common/TagManageModal.vue'
import type { Website } from '@/types'

const { websites, isLoading, loadWebsites, addWebsite, updateWebsite, deleteWebsite } = useWebsites()
const { categories, loadCategories } = useCategories()
const { loadTags } = useTags()
const appStore = useAppStore()

const selectedWebsite = ref<Website | null>(null)
const editingWebsite = ref<Website | null>(null)
const showDetailDrawer = ref(false)
const showAddForm = ref(false)
const showEditForm = ref(false)
const showCategoryModal = ref(false)
const showTagModal = ref(false)

onMounted(async () => {
  await Promise.all([
    loadWebsites(),
    loadCategories(),
    loadTags()
  ])
})

// Expose openModal method for parent component
const openModal = (type: 'website' | 'category' | 'tag') => {
  switch (type) {
    case 'website':
      showAddForm.value = true
      break
    case 'category':
      showCategoryModal.value = true
      break
    case 'tag':
      showTagModal.value = true
      break
  }
}

defineExpose({ openModal })

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
    result = result.filter(w => (w.categoryIds || []).includes(appStore.filter.categoryId!))
  }

  if (appStore.filter.tagIds.length > 0) {
    result = result.filter(w =>
      appStore.filter.tagIds.some(tagId => (w.tagIds || []).includes(tagId))
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

const handleCardEdit = (website: Website) => {
  editingWebsite.value = website
  showEditForm.value = true
}

const handleCardDelete = async (website: Website) => {
  try {
    await deleteWebsite(website.id!)
  } catch (error) {
    console.error('Failed to delete website:', error)
    alert('删除网站失败')
  }
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
</script>

<style scoped>
.main-content {
  flex: 1;
  padding: 28px 36px;
  min-height: calc(100vh - 64px);
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
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  line-height: 1.2;
}

/* Neumorphism btn-primary */
.neumorphism-theme .btn-primary {
  background: var(--accent);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  font-weight: 600;
  box-shadow: 5px 5px 10px rgb(163,177,198,0.6), -5px -5px 10px rgba(255,255,255,0.5);
  transition: all 0.3s ease-out;
}

.neumorphism-theme .btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 8px 8px 16px rgb(163,177,198,0.7), -8px -8px 16px rgba(255,255,255,0.6);
  background: var(--accent-light);
}

.neumorphism-theme .btn-primary:active {
  transform: translateY(0.5px);
  box-shadow: inset 3px 3px 6px rgba(0,0,0,0.2), inset -3px -3px 6px rgba(255,255,255,0.1);
}

/* Neumorphism btn-secondary */
.neumorphism-theme .btn-secondary {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  font-weight: 600;
  box-shadow: var(--shadow-extruded-small);
  transition: all 0.3s ease-out;
}

.neumorphism-theme .btn-secondary:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-extruded);
}

.neumorphism-theme .btn-secondary:active {
  transform: translateY(0.5px);
  box-shadow: var(--shadow-inset-small);
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
  background: var(--bg-primary);
  border-radius: 32px;
}

/* Neumorphism empty state */
.neumorphism-theme .empty-state {
  box-shadow: var(--shadow-inset);
}

.empty-state .mdi {
  font-size: 64px;
  color: var(--text-secondary);
  opacity: 0.4;
  margin-bottom: 16px;
}

.empty-state p {
  color: var(--text-secondary);
  margin-top: 0;
  font-size: 1rem;
  max-width: 360px;
  line-height: 1.6;
}

.websites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
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
  background: var(--bg-primary);
  border-radius: 24px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}

.modal-scroll-area {
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

/* Neumorphism modal */
.neumorphism-theme .modal-content {
  border: none;
}

.close-modal-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 10px;
  background: var(--bg-primary);
  color: var(--text-secondary);
  z-index: 10;
  border-radius: 12px;
  transition: all 0.3s ease-out;
}

/* Neumorphism close button */
.neumorphism-theme .close-modal-btn {
  box-shadow: var(--shadow-extruded-small);
}

.neumorphism-theme .close-modal-btn:hover {
  color: var(--text-primary);
  transform: translateY(-1px);
  box-shadow: var(--shadow-extruded);
}

.neumorphism-theme .close-modal-btn:active {
  transform: translateY(0.5px);
  box-shadow: var(--shadow-inset-small);
}

.close-modal-btn .mdi {
  font-size: 1.125rem;
}

@media (max-width: 1024px) {
  .main-content {
    padding: 24px 28px;
  }

  .content-header {
    margin-bottom: 24px;
  }

  .content-header h1 {
    font-size: 1.5rem;
  }

  .websites-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 640px) {
  .main-content {
    padding: 20px 16px;
  }

  .content-header {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 20px;
  }

  .content-header h1 {
    font-size: 1.375rem;
  }

  .websites-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .empty-state {
    min-height: 300px;
    padding: 40px 20px;
    border-radius: 24px;
  }

  .empty-state .mdi {
    font-size: 56px;
  }
}
</style>
