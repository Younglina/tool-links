<template>
  <div v-if="isOpen" class="dialog-backdrop" @click="handleClose">
    <div class="dialog-content" @click.stop>
      <div class="dialog-header">
        <h2 class="text-xl font-bold">{{ isEditing ? '编辑分类' : '添加分类' }}</h2>
        <button @click="handleClose" class="close-btn">
          <i class="mdi mdi-close text-xl"></i>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="dialog-body space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">分类名称 *</label>
          <input
            v-model="form.name"
            type="text"
            placeholder="例如：大模型"
            class="input"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">图标 *</label>
          <div class="icon-grid">
            <div
              v-for="icon in availableIcons"
              :key="icon"
              @click="selectIcon(icon)"
              :class="[
                'icon-item',
                form.iconName === icon ? 'selected' : ''
              ]"
            >
              <i :class="['mdi', `mdi-${icon}`, 'text-2xl']"></i>
            </div>
          </div>
        </div>

        <div class="dialog-footer flex gap-3 pt-4">
          <button type="submit" class="btn btn-primary flex-1">
            <i class="mdi mdi-content-save-all"></i>
            {{ isEditing ? '保存' : '添加' }}
          </button>
          <button type="button" @click="handleClose" class="btn btn-secondary">
            取消
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import type { Category } from '@/types'

const props = defineProps<{
  isOpen: boolean
  category?: Category | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', data: Omit<Category, 'id'>): void
}>()

const isEditing = computed(() => !!props.category)

const form = reactive({
  name: '',
  iconName: ''
})

const availableIcons = [
  'smart_toy', 'image', 'code-brackets', 'volume-high', 'movie-open',
  'chart-line', 'format-text', 'palette', 'brain', 'robot',
  'chart-bar', 'database', 'cloud', 'lightbulb', 'auto-fix'
]

const selectIcon = (icon: string) => {
  form.iconName = icon
}

const handleSubmit = () => {
  if (!form.name.trim()) {
    alert('请输入分类名称')
    return
  }
  if (!form.iconName) {
    alert('请选择图标')
    return
  }

  const dataToSubmit: Omit<Category, 'id'> = {
    name: form.name,
    iconName: form.iconName
  }
  emit('submit', dataToSubmit)
  resetForm()
  handleClose()
}

const handleClose = () => {
  emit('close')
  resetForm()
}

const resetForm = () => {
  form.name = ''
  form.iconName = ''
}

watch(() => props.category, (newCategory) => {
  if (newCategory) {
    form.name = newCategory.name
    form.iconName = newCategory.iconName
  } else {
    resetForm()
  }
}, { immediate: true })
</script>

<style scoped>
.dialog-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.dialog-content {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dialog-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.close-btn {
  padding: 0.5rem;
  background: transparent;
  color: var(--text-secondary);
}

.close-btn:hover {
  color: var(--text-primary);
}

.dialog-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
  padding: 0.5rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 4px;
}

.icon-item {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--bg-primary);
  color: var(--text-secondary);
}

.icon-item:hover {
  background: var(--hover-bg);
  border-color: var(--accent);
}

.icon-item.selected {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--text-primary);
}

.dialog-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--border);
}

.space-y-4 > * + * {
  margin-top: 1rem;
}

.space-y-2 > * + * {
  margin-top: 0.5rem;
}
</style>
