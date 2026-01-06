import { ref } from 'vue'

export const fileToArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

export const arrayBufferToUrl = (buffer: ArrayBuffer, mimeType: string): string => {
  const blob = new Blob([buffer], { type: mimeType })
  return URL.createObjectURL(blob)
}

export const useImageUpload = () => {
  const selectedFile = ref<File | null>(null)
  const previewUrl = ref<string | null>(null)
  const isUploading = ref(false)
  const error = ref<string | null>(null)

  const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) {
      selectedFile.value = file
      createPreview(file)
    }
  }

  const createPreview = (file: File) => {
    const url = URL.createObjectURL(file)
    previewUrl.value = url
  }

  const processFile = async (): Promise<{ buffer: ArrayBuffer; mimeType: string } | null> => {
    if (!selectedFile.value) return null

    isUploading.value = true
    error.value = null

    try {
      const buffer = await fileToArrayBuffer(selectedFile.value)
      return {
        buffer,
        mimeType: selectedFile.value.type
      }
    } catch (err) {
      error.value = '图片处理失败'
      console.error('Failed to process image:', err)
      return null
    } finally {
      isUploading.value = false
    }
  }

  const reset = () => {
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
    }
    selectedFile.value = null
    previewUrl.value = null
    error.value = null
  }

  return {
    selectedFile,
    previewUrl,
    isUploading,
    error,
    handleFileSelect,
    processFile,
    reset
  }
}
