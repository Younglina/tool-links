<template>
  <div class="manage-panel">
    <!-- Categories Section -->
    <div class="manage-section">
      <div class="section-header">
        <h4 class="section-title">分类管理</h4>
        <button @click="openAddCategory" class="add-btn" title="添加分类">
          <i class="mdi mdi-plus"></i>
        </button>
      </div>
      <div class="manage-list">
        <div
          v-for="category in categories"
          :key="category.id"
          class="manage-item"
        >
          <div class="item-info">
            <i :class="['mdi', `mdi-${category.iconName}`, 'item-icon']"></i>
            <span class="item-name">{{ category.name }}</span>
          </div>
          <div class="item-actions">
            <button @click="openEditCategory(category)" class="item-btn" title="编辑">
              <i class="mdi mdi-pencil-outline"></i>
            </button>
            <button @click="handleDeleteCategory(category)" class="item-btn delete" title="删除">
              <i class="mdi mdi-delete-outline"></i>
            </button>
          </div>
        </div>
        <div v-if="categories.length === 0" class="empty-tip">
          暂无分类
        </div>
      </div>
    </div>

    <!-- Tags Section -->
    <div class="manage-section">
      <div class="section-header">
        <h4 class="section-title">标签管理</h4>
        <button @click="openAddTag" class="add-btn" title="添加标签">
          <i class="mdi mdi-plus"></i>
        </button>
      </div>
      <div class="manage-list">
        <div
          v-for="tag in tags"
          :key="tag.id"
          class="manage-item"
        >
          <div class="item-info">
            <span class="tag-badge">#{{ tag.name }}</span>
          </div>
          <div class="item-actions">
            <button @click="openEditTag(tag)" class="item-btn" title="编辑">
              <i class="mdi mdi-pencil-outline"></i>
            </button>
            <button @click="handleDeleteTag(tag)" class="item-btn delete" title="删除">
              <i class="mdi mdi-delete-outline"></i>
            </button>
          </div>
        </div>
        <div v-if="tags.length === 0" class="empty-tip">
          暂无标签
        </div>
      </div>
    </div>

    <!-- Category Dialog -->
    <CategoryDialog
      :is-open="showCategoryDialog"
      :category="editingCategory"
      @close="closeCategoryDialog"
      @submit="handleCategorySubmit"
    />

    <!-- Tag Dialog -->
    <TagDialog
      :is-open="showTagDialog"
      :tag="editingTag"
      @close="closeTagDialog"
      @submit="handleTagSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCategories } from '@/composables/useCategories'
import { useTags } from '@/composables/useTags'
import CategoryDialog from './CategoryDialog.vue'
import TagDialog from './TagDialog.vue'
import type { Category, Tag } from '@/types'

const { categories, loadCategories, addCategory, updateCategory, deleteCategory } = useCategories()
const { tags, loadTags, addTag, updateTag, deleteTag } = useTags()

const showCategoryDialog = ref(false)
const showTagDialog = ref(false)
const editingCategory = ref<Category | null>(null)
const editingTag = ref<Tag | null>(null)

onMounted(async () => {
  await Promise.all([loadCategories(), loadTags()])
})

// Category handlers
const openAddCategory = () => {
  editingCategory.value = null
  showCategoryDialog.value = true
}

const openEditCategory = (category: Category) => {
  editingCategory.value = category
  showCategoryDialog.value = true
}

const closeCategoryDialog = () => {
  showCategoryDialog.value = false
  editingCategory.value = null
}

const handleCategorySubmit = async (data: Omit<Category, 'id'>) => {
  try {
    if (editingCategory.value?.id) {
      await updateCategory(editingCategory.value.id, data)
    } else {
      await addCategory(data)
    }
    closeCategoryDialog()
  } catch (error) {
    console.error('Failed to save category:', error)
    alert('保存分类失败')
  }
}

const handleDeleteCategory = async (category: Category) => {
  if (!confirm(`确定要删除分类"${category.name}"吗？`)) return
  try {
    await deleteCategory(category.id!)
  } catch (error) {
    console.error('Failed to delete category:', error)
    alert('删除分类失败')
  }
}

// Tag handlers
const openAddTag = () => {
  editingTag.value = null
  showTagDialog.value = true
}

const openEditTag = (tag: Tag) => {
  editingTag.value = tag
  showTagDialog.value = true
}

const closeTagDialog = () => {
  showTagDialog.value = false
  editingTag.value = null
}

const handleTagSubmit = async (data: Omit<Tag, 'id'>) => {
  try {
    if (editingTag.value?.id) {
      await updateTag(editingTag.value.id, data)
    } else {
      await addTag(data)
    }
    closeTagDialog()
  } catch (error) {
    console.error('Failed to save tag:', error)
    alert('保存标签失败')
  }
}

const handleDeleteTag = async (tag: Tag) => {
  if (!confirm(`确定要删除标签"${tag.name}"吗？`)) return
  try {
    await deleteTag(tag.id!)
  } catch (error) {
    console.error('Failed to delete tag:', error)
    alert('删除标签失败')
  }
}
</script>

<style scoped>
.manage-panel {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(163,177,198,0.2);
}

.manage-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 0 8px;
}

.section-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 0;
}

.add-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  color: var(--accent);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.neumorphism-theme .add-btn {
  box-shadow: var(--shadow-extruded-small);
}

.add-btn:hover {
  transform: translateY(-1px);
}

.neumorphism-theme .add-btn:hover {
  box-shadow: var(--shadow-extruded);
}

.manage-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.manage-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--bg-primary);
  border-radius: 10px;
  transition: all 0.2s ease;
}

.neumorphism-theme .manage-item {
  box-shadow: var(--shadow-inset-small);
}

.item-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.item-icon {
  font-size: 1rem;
  color: var(--text-secondary);
}

.item-name {
  font-size: 0.875rem;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tag-badge {
  font-size: 0.8125rem;
  color: var(--accent);
  font-weight: 500;
}

.item-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.manage-item:hover .item-actions {
  opacity: 1;
}

.item-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: var(--text-secondary);
  border-radius: 6px;
  transition: all 0.15s ease;
}

.item-btn:hover {
  color: var(--accent);
  background: var(--bg-secondary);
}

.item-btn.delete:hover {
  color: #ff3b30;
}

.item-btn .mdi {
  font-size: 0.875rem;
}

.empty-tip {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  text-align: center;
  padding: 16px 0;
}
</style>
