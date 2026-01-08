<template>
  <div class="api-key-input">
    <label class="block text-sm font-medium mb-2">API Keys</label>
    <div class="space-y-2">
      <div
        v-for="(key, index) in apiKeys"
        :key="index"
        class="api-key-item flex items-center gap-2"
      >
        <span class="flex-1 font-mono text-sm">{{ maskKey(key) }}</span>
        <div class="flex gap-2">
          <button
            type="button"
            @click="copyKey(key)"
            :class="[
              'btn btn-sm',
              copiedKey === key ? 'text-green-500' : 'btn-secondary'
            ]"
            :disabled="isCopying"
          >
            <i :class="['mdi', copiedKey === key ? 'mdi-check' : 'mdi-content-copy']"></i>
          </button>
          <button
            type="button"
            @click="removeKey(index)"
            class="btn btn-sm btn-danger"
          >
            <i class="mdi mdi-delete"></i>
          </button>
        </div>
      </div>
    </div>
    <div class="mt-2 flex gap-2">
      <input
        v-model="newKey"
        type="password"
        placeholder="输入新的API Key"
        class="input flex-1"
        id="api-key-input"
        @keydown.enter.prevent="addKey"
      />
      <button
        type="button"
        @click="addKey"
        class="btn btn-primary"
      >
        <i class="mdi mdi-plus"></i>
        添加
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, toRaw } from 'vue'
import { useApiKey } from '@/composables/useApiKey'

const props = defineProps<{
  modelValue: string[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

const { copiedKey, isCopying, maskKey, copyKey } = useApiKey()

const apiKeys = ref<string[]>([])
const newKey = ref('')

// 初始化和同步
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    apiKeys.value = [...newValue]
  }
}, { immediate: true, deep: true })

const addKey = () => {
  const trimmed = newKey.value.trim()
  if (trimmed) {
    const newKeys = [...apiKeys.value, trimmed]
    apiKeys.value = newKeys
    newKey.value = ''
    emit('update:modelValue', newKeys)
  }
}

const removeKey = (index: number) => {
  const newKeys = apiKeys.value.filter((_, i) => i !== index)
  apiKeys.value = newKeys
  emit('update:modelValue', newKeys)
}

const getAllKeys = (): string[] => {
  const trimmed = newKey.value.trim()
  if (trimmed) {
    return [...apiKeys.value, trimmed]
  }
  return [...apiKeys.value]
}

defineExpose({
  getAllKeys
})
</script>

<style scoped>
.api-key-item {
  padding: 0.5rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 4px;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
}
</style>
