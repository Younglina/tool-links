<template>
  <div class="website-form">
    <h2 class="text-2xl font-bold mb-6">{{ isEditing ? '编辑网站' : '添加网站' }}</h2>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-2">网站名称 *</label>
        <input
          v-model="form.name"
          type="text"
          placeholder="例如：ChatGPT"
          class="input"
          required
        />
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">网站URL *</label>
        <input
          v-model="form.url"
          type="url"
          placeholder="https://example.com"
          class="input"
          required
        />
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">图标</label>
        <ImageUploader
          @upload="handleIconUpload"
          @remove="handleIconRemove"
        />
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">描述</label>
        <textarea
          v-model="form.description"
          placeholder="网站功能描述..."
          class="input"
          rows="3"
        ></textarea>
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">分类 *</label>
        <div class="multi-select" ref="categorySelectRef">
          <div
            class="multi-select-trigger"
            @click="toggleCategoryDropdown"
            :class="{ 'has-value': form.categoryIds.length > 0 }"
          >
            <div class="selected-items" v-if="form.categoryIds.length > 0">
              <span
                v-for="id in form.categoryIds"
                :key="id"
                class="selected-tag"
              >
                <i :class="['mdi', `mdi-${getCategoryIcon(id)}`]"></i>
                {{ getCategoryName(id) }}
                <button type="button" @click.stop="removeCategory(id)" class="remove-tag">
                  <i class="mdi mdi-close"></i>
                </button>
              </span>
            </div>
            <span v-else class="placeholder">选择分类（可多选）</span>
            <i class="mdi mdi-chevron-down dropdown-icon" :class="{ 'rotate': showCategoryDropdown }"></i>
          </div>
          <Transition name="dropdown">
            <div v-if="showCategoryDropdown" class="multi-select-dropdown">
              <div
                v-for="category in categories"
                :key="category.id"
                class="dropdown-item"
                :class="{ 'selected': form.categoryIds.includes(category.id!) }"
                @click="toggleCategory(category.id!)"
              >
                <i :class="['mdi', `mdi-${category.iconName}`, 'item-icon']"></i>
                <span class="item-name">{{ category.name }}</span>
                <i v-if="form.categoryIds.includes(category.id!)" class="mdi mdi-check check-icon"></i>
              </div>
              <div v-if="categories.length === 0" class="dropdown-empty">
                暂无分类
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">标签</label>
        <div class="flex flex-wrap gap-2">
          <label
            v-for="tag in tags"
            :key="tag.id"
            class="tag-checkbox"
          >
            <input
              type="checkbox"
              :value="tag.id"
              v-model="form.tagIds"
              class="hidden"
            />
            <span class="tag-label">
              {{ tag.name }}
            </span>
          </label>
        </div>
      </div>

      <ApiKeyInput
        ref="apiKeyInputRef"
        :modelValue="form.apiKeys"
        @update:modelValue="handleApiKeysUpdate"
      />

      <div class="flex gap-3 pt-4">
        <button type="submit" class="btn btn-primary flex-1" :disabled="isSubmitting">
          <i class="mdi" :class="isSubmitting ? 'mdi-loading mdi-spin' : 'mdi-content-save-all'"></i>
          {{ isSubmitting ? '保存中...' : (isEditing ? '保存' : '添加') }}
        </button>
        <button type="button" @click="handleCancel" class="btn btn-secondary">
          取消
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, toRaw, watch, onUnmounted } from 'vue'
import type { Website } from '@/types'
import { useCategories } from '@/composables/useCategories'
import { useTags } from '@/composables/useTags'
import ImageUploader from './ImageUploader.vue'
import ApiKeyInput from './ApiKeyInput.vue'
import { isValidUrl } from '@/utils/validators'

const props = defineProps<{
  website?: Website | null
}>()

const emit = defineEmits<{
  (e: 'submit', data: Omit<Website, 'id' | 'createdAt' | 'updatedAt'>): void
  (e: 'cancel'): void
}>()

const { categories, loadCategories } = useCategories()
const { tags, loadTags } = useTags()

const isEditing = computed(() => !!props.website)
const isSubmitting = ref(false)
const apiKeyInputRef = ref<InstanceType<typeof ApiKeyInput> | null>(null)
const showCategoryDropdown = ref(false)
const categorySelectRef = ref<HTMLElement | null>(null)

const form = reactive({
  name: '',
  url: '',
  icon: new ArrayBuffer(0),
  iconMimeType: '',
  description: '',
  categoryIds: [] as number[],
  tagIds: [] as number[],
  apiKeys: [] as string[]
})

onMounted(() => {
  loadCategories()
  loadTags()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const handleClickOutside = (e: MouseEvent) => {
  if (categorySelectRef.value && !categorySelectRef.value.contains(e.target as Node)) {
    showCategoryDropdown.value = false
  }
}

const toggleCategoryDropdown = () => {
  showCategoryDropdown.value = !showCategoryDropdown.value
}

const toggleCategory = (id: number) => {
  const index = form.categoryIds.indexOf(id)
  if (index === -1) {
    form.categoryIds.push(id)
  } else {
    form.categoryIds.splice(index, 1)
  }
}

const removeCategory = (id: number) => {
  const index = form.categoryIds.indexOf(id)
  if (index !== -1) {
    form.categoryIds.splice(index, 1)
  }
}

const getCategoryName = (id: number) => {
  return categories.value.find(c => c.id === id)?.name || ''
}

const getCategoryIcon = (id: number) => {
  return categories.value.find(c => c.id === id)?.iconName || 'folder'
}

// 监听 website prop 变化，初始化表单数据
watch(() => props.website, (website) => {
  if (website) {
    form.name = website.name
    form.url = website.url
    form.icon = website.icon
    form.iconMimeType = website.iconMimeType
    form.description = website.description
    form.categoryIds = [...(website.categoryIds || [])]
    form.tagIds = [...(website.tagIds || [])]
    form.apiKeys = [...(website.apiKeys || [])]
  } else {
    // 重置表单
    form.name = ''
    form.url = ''
    form.icon = new ArrayBuffer(0)
    form.iconMimeType = ''
    form.description = ''
    form.categoryIds = []
    form.tagIds = []
    form.apiKeys = []
  }
}, { immediate: true })

const handleIconUpload = (data: { buffer: ArrayBuffer; mimeType: string }) => {
  form.icon = data.buffer
  form.iconMimeType = data.mimeType
}

const handleIconRemove = () => {
  form.icon = new ArrayBuffer(0)
  form.iconMimeType = ''
}

const handleSubmit = async () => {
  if (!isValidUrl(form.url)) {
    alert('请输入有效的URL')
    return
  }

  if (form.categoryIds.length === 0) {
    alert('请至少选择一个分类')
    return
  }

  isSubmitting.value = true
  try {
    // 获取所有 API Keys，包括输入框中未点击添加的
    const allApiKeys = apiKeyInputRef.value?.getAllKeys() || [...form.apiKeys]

    const rawForm = toRaw(form)
    const dataToSubmit: Omit<Website, 'id' | 'createdAt' | 'updatedAt'> = {
      name: rawForm.name,
      url: rawForm.url,
      icon: rawForm.icon,
      iconMimeType: rawForm.iconMimeType,
      description: rawForm.description,
      categoryIds: [...rawForm.categoryIds],
      tagIds: [...rawForm.tagIds],
      apiKeys: allApiKeys
    }
    emit('submit', dataToSubmit)
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
}

const handleApiKeysUpdate = (value: string[]) => {
  form.apiKeys = [...value]
}
</script>

<style >
.website-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 28px;
}

.website-form h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 28px 0;
  letter-spacing: -0.02em;
}

.website-form label {
  display: block;
  font-size: 0.9375rem;
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.website-form input,
.website-form textarea,
.website-form select {
  padding: 14px 16px;
  border-radius: 12px;
  font-size: 1rem;
  background: var(--bg-primary);
  border: none;
  transition: all 0.3s ease-out;
  font-family: var(--font-secondary);
  color: var(--text-primary);
}

/* Neumorphism form inputs */
.neumorphism-theme .website-form input,
.neumorphism-theme .website-form textarea,
.neumorphism-theme .website-form select {
  box-shadow: var(--shadow-inset);
}

.neumorphism-theme .website-form input:focus,
.neumorphism-theme .website-form textarea:focus,
.neumorphism-theme .website-form select:focus {
  box-shadow: var(--shadow-inset-deep);
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}


.website-form input::placeholder,
.website-form textarea::placeholder {
  color: #A0AEC0;
}

.website-form textarea {
  resize: vertical;
  min-height: 100px;
}

.tag-checkbox {
  display: inline-block;
  margin: 4px;
}

.tag-label {
  display: inline-block;
  padding: 8px 14px;
  background: var(--bg-primary);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease-out;
  user-select: none;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-primary);
}

/* Neumorphism tag label */
.neumorphism-theme .tag-label {
  box-shadow: var(--shadow-extruded-small);
  border: none;
}

.neumorphism-theme .tag-label:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-extruded);
}

.neumorphism-theme input:checked + .tag-label {
  background: var(--accent);
  color: #ffffff;
  box-shadow: inset 3px 3px 6px rgba(0,0,0,0.2), inset -3px -3px 6px rgba(255,255,255,0.1);
}


.website-form .flex {
  display: flex;
  gap: 12px;
}

.website-form .flex-1 {
  flex: 1;
}

.website-form .flex-wrap {
  flex-wrap: wrap;
}

.website-form .gap-2 {
  gap: 8px;
}

.website-form .gap-3 {
  gap: 12px;
}

.website-form .pt-4 {
  padding-top: 20px;
}

.website-form .space-y-4 > * + * {
  margin-top: 24px;
}

.website-form .space-y-2 > * + * {
  margin-top: 8px;
}

/* Neumorphism buttons in form */
.neumorphism-theme .website-form .btn-primary {
  background: var(--accent);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  padding: 14px 24px;
  font-weight: 600;
  box-shadow: 5px 5px 10px rgb(163,177,198,0.6), -5px -5px 10px rgba(255,255,255,0.5);
  transition: all 0.3s ease-out;
}

.neumorphism-theme .website-form .btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 8px 8px 16px rgb(163,177,198,0.7), -8px -8px 16px rgba(255,255,255,0.6);
  background: var(--accent-light);
}

.neumorphism-theme .website-form .btn-secondary {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: none;
  border-radius: 12px;
  padding: 14px 24px;
  font-weight: 600;
  box-shadow: var(--shadow-extruded-small);
  transition: all 0.3s ease-out;
}

.neumorphism-theme .website-form .btn-secondary:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-extruded);
}

/* Multi-select dropdown styles */
.multi-select {
  position: relative;
}

.multi-select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  min-height: 52px;
  border-radius: 12px;
  background: var(--bg-primary);
  cursor: pointer;
  transition: all 0.3s ease-out;
}

.neumorphism-theme .multi-select-trigger {
  box-shadow: var(--shadow-inset);
}

.neumorphism-theme .multi-select-trigger:hover {
  box-shadow: var(--shadow-inset-deep);
}

.selected-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
}

.selected-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: var(--accent);
  color: #ffffff;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
}

.selected-tag .mdi {
  font-size: 0.875rem;
}

.remove-tag {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.2s ease;
}

.remove-tag:hover {
  background: rgba(255, 255, 255, 0.3);
}

.remove-tag .mdi {
  font-size: 0.75rem;
}

.placeholder {
  color: #A0AEC0;
  font-size: 1rem;
}

.dropdown-icon {
  font-size: 1.25rem;
  color: var(--text-secondary);
  transition: transform 0.2s ease;
  margin-left: 8px;
}

.dropdown-icon.rotate {
  transform: rotate(180deg);
}

.multi-select-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: var(--bg-primary);
  border-radius: 12px;
  max-height: 240px;
  overflow-y: auto;
  z-index: 100;
}

.neumorphism-theme .multi-select-dropdown {
  box-shadow: var(--shadow-extruded);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropdown-item:first-child {
  border-radius: 12px 12px 0 0;
}

.dropdown-item:last-child {
  border-radius: 0 0 12px 12px;
}

.dropdown-item:only-child {
  border-radius: 12px;
}

.dropdown-item:hover {
  background: var(--bg-secondary);
}

.dropdown-item.selected {
  background: rgba(108, 99, 255, 0.1);
}

.dropdown-item .item-icon {
  font-size: 1.125rem;
  color: var(--text-secondary);
}

.dropdown-item.selected .item-icon {
  color: var(--accent);
}

.dropdown-item .item-name {
  flex: 1;
  font-size: 0.9375rem;
  color: var(--text-primary);
}

.dropdown-item.selected .item-name {
  color: var(--accent);
  font-weight: 500;
}

.dropdown-item .check-icon {
  font-size: 1rem;
  color: var(--accent);
}

.dropdown-empty {
  padding: 16px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

/* Dropdown transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 640px) {
  .website-form {
    padding: 20px;
  }

  .website-form h2 {
    font-size: 1.5rem;
    margin-bottom: 20px;
  }
}
</style>
