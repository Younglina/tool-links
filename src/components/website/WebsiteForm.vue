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
        <select v-model="form.categoryId" class="input" required>
          <option value="">选择分类</option>
          <option
            v-for="category in categories"
            :key="category.id"
            :value="category.id"
          >
            {{ category.name }}
          </option>
        </select>
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
import { ref, reactive, onMounted, computed } from 'vue'
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

const form = reactive({
  name: '',
  url: '',
  icon: new ArrayBuffer(0),
  iconMimeType: '',
  description: '',
  categoryId: 0,
  tagIds: [] as number[],
  apiKeys: [] as string[]
})

onMounted(() => {
  loadCategories()
  loadTags()

  if (props.website) {
    form.name = props.website.name
    form.url = props.website.url
    form.icon = props.website.icon
    form.iconMimeType = props.website.iconMimeType
    form.description = props.website.description
    form.categoryId = props.website.categoryId
    form.tagIds = [...props.website.tagIds]
    form.apiKeys = [...props.website.apiKeys]
  }
})

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

  isSubmitting.value = true
  try {
    const dataToSubmit: Omit<Website, 'id' | 'createdAt' | 'updatedAt'> = {
      name: form.name,
      url: form.url,
      icon: form.icon,
      iconMimeType: form.iconMimeType,
      description: form.description,
      categoryId: form.categoryId,
      tagIds: [...form.tagIds],
      apiKeys: [...form.apiKeys]
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

<style scoped>
.website-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
}

.website-form h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 24px 0;
  letter-spacing: -0.02em;
}

.website-form label {
  display: block;
  font-size: 0.9375rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.website-form input,
.website-form textarea,
.website-form select {
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 1rem;
  background: var(--bg-tertiary);
  border: 1px solid transparent;
  transition: all 0.2s ease;
  font-family: var(--font-secondary);
}

.website-form input:focus,
.website-form textarea:focus,
.website-form select:focus {
  background: var(--bg-secondary);
  border-color: var(--accent);
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.08);
  outline: none;
}

.website-form textarea {
  resize: vertical;
  min-height: 80px;
}

.tag-checkbox {
  display: inline-block;
  margin: 4px;
}

.tag-label {
  display: inline-block;
  padding: 4px 10px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-primary);
}

.tag-label:hover {
  background: var(--bg-secondary);
  border-color: var(--accent);
}

input:checked + .tag-label {
  background: var(--accent);
  border-color: var(--accent);
  color: #ffffff;
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
  padding-top: 16px;
}

.website-form .space-y-4 > * + * {
  margin-top: 20px;
}

.website-form .space-y-2 > * + * {
  margin-top: 8px;
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
