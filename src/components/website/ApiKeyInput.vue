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
            @click="removeKey(index)"
            class="btn btn-sm btn-danger"
          >
            <i class="mdi mdi-delete"></i>
          </button>
        </div>
      </div>
      <div v-if="apiKeys.length === 0" class="text-[var(--text-secondary)] text-sm">
        暂无API Keys
      </div>
    </div>
    <div class="mt-2 flex gap-2">
      <input
        v-model="newKey"
        type="password"
        placeholder="输入新的API Key"
        class="input flex-1"
        id="api-key-input"
        @keyup.enter="addKey"
      />
      <button
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
import { ref, watch } from 'vue'
import { useApiKey } from '@/composables/useApiKey'

const props = defineProps<{
  modelValue: string[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

const { copiedKey, isCopying, maskKey, copyKey } = useApiKey()

const apiKeys = ref<string[]>([...props.modelValue])
const newKey = ref('')

watch(() => props.modelValue, (newValue) => {
  apiKeys.value = [...newValue]
})

const addKey = () => {
  const trimmed = newKey.value.trim()
  if (trimmed) {
    apiKeys.value.push(trimmed)
    newKey.value = ''
    emitUpdate()
  }
}

const removeKey = (index: number) => {
  apiKeys.value.splice(index, 1)
  emitUpdate()
}

const emitUpdate = () => {
  emit('update:modelValue', [...apiKeys.value])
}
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
