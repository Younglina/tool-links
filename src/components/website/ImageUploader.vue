<template>
  <div class="image-uploader">
    <div
      v-if="!previewUrl"
      @click="triggerFileInput"
      class="upload-zone"
    >
      <i class="mdi mdi-cloud-upload text-4xl mb-2"></i>
      <p>点击上传图标</p>
      <p class="text-sm text-[var(--text-secondary)] mt-1">推荐尺寸：128-256px，建议小于500KB</p>
    </div>
    <div v-else class="preview-container">
      <img :src="previewUrl" alt="预览" class="preview-image" />
      <div class="preview-actions">
        <button @click="reset" class="btn btn-danger btn-sm">
          <i class="mdi mdi-delete"></i>
          删除
        </button>
        <button @click="triggerFileInput" class="btn btn-secondary btn-sm">
          <i class="mdi mdi-upload"></i>
          更换
        </button>
      </div>
    </div>
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleFileChange"
    />
    <p v-if="error" class="error-message mt-2 text-red-500">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useImageUpload } from '@/composables/useImageUpload'

const emit = defineEmits<{
  (e: 'upload', data: { buffer: ArrayBuffer; mimeType: string }): void
  (e: 'remove'): void
}>()

const {
  selectedFile,
  previewUrl,
  error,
  handleFileSelect,
  processFile,
  reset
} = useImageUpload()

const fileInput = ref<HTMLInputElement | null>(null)

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileChange = async (event: Event) => {
  handleFileSelect(event)
  if (selectedFile.value) {
    const result = await processFile()
    if (result) {
      emit('upload', result)
    }
  }
}
</script>

<style scoped>
.image-uploader {
  width: 100%;
}

.upload-zone {
  border: 2px dashed var(--border);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--bg-secondary);
}

.upload-zone:hover {
  border-color: var(--accent);
  background: var(--hover-bg);
}

.upload-zone .mdi {
  color: var(--text-secondary);
}

.preview-container {
  position: relative;
}

.preview-image {
  width: 128px;
  height: 128px;
  object-fit: contain;
  border-radius: 8px;
  border: 2px solid var(--border);
}

.preview-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.btn-sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
}

.error-message {
  font-size: 0.875rem;
}
</style>
