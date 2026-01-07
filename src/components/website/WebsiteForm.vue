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
import { ref, reactive, onMounted, computed, toRaw, watch } from 'vue'
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
})

// 监听 website prop 变化，初始化表单数据
watch(() => props.website, (website) => {
  if (website) {
    form.name = website.name
    form.url = website.url
    form.icon = website.icon
    form.iconMimeType = website.iconMimeType
    form.description = website.description
    form.categoryId = website.categoryId
    form.tagIds = [...(website.tagIds || [])]
    form.apiKeys = [...(website.apiKeys || [])]
  } else {
    // 重置表单
    form.name = ''
    form.url = ''
    form.icon = new ArrayBuffer(0)
    form.iconMimeType = ''
    form.description = ''
    form.categoryId = 0
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
      categoryId: rawForm.categoryId,
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
