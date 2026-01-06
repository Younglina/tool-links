<template>
  <div v-if="isOpen" class="dialog-backdrop" @click="handleClose">
    <div class="dialog-content" @click.stop>
      <div class="dialog-header">
        <h2 class="text-xl font-bold">{{ isEditing ? '编辑标签' : '添加标签' }}</h2>
        <button @click="handleClose" class="close-btn">
          <i class="mdi mdi-close text-xl"></i>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="dialog-body space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">标签名称 *</label>
          <input
            v-model="form.name"
            type="text"
            placeholder="例如：免费"
            class="input"
            required
          />
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
import type { Tag } from '@/types'

const props = defineProps<{
  isOpen: boolean
  tag?: Tag | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', data: Omit<Tag, 'id'>): void
}>()

const isEditing = computed(() => !!props.tag)

const form = reactive({
  name: '',
  count: 0
})

const handleSubmit = () => {
  if (!form.name.trim()) {
    alert('请输入标签名称')
    return
  }

  const dataToSubmit: Omit<Tag, 'id'> = {
    name: form.name,
    count: form.count
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
  form.count = 0
}

watch(() => props.tag, (newTag) => {
  if (newTag) {
    form.name = newTag.name
    form.count = newTag.count
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
  max-width: 400px;
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
}

.dialog-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--border);
}

.space-y-4 > * + * {
  margin-top: 1rem;
}
</style>
