import { maskApiKey, copyToClipboard } from '@/utils/validators'
import { ref } from 'vue'

export const useApiKey = () => {
  const copiedKey = ref<string | null>(null)
  const isCopying = ref(false)

  const maskKey = (key: string): string => {
    return maskApiKey(key)
  }

  const copyKey = async (key: string): Promise<void> => {
    isCopying.value = true
    try {
      await copyToClipboard(key)
      copiedKey.value = key
      setTimeout(() => {
        copiedKey.value = null
      }, 2000)
    } catch (error) {
      console.error('Failed to copy API key:', error)
    } finally {
      isCopying.value = false
    }
  }

  return {
    copiedKey,
    isCopying,
    maskKey,
    copyKey
  }
}
