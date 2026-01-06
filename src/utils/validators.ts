export const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}

export const validateApiKey = (key: string): boolean => {
  return key.trim().length > 0
}

export const maskApiKey = (key: string): string => {
  if (key.length <= 8) return '****'
  return `${key.slice(0, 3)}****${key.slice(-4)}`
}

export const copyToClipboard = async (text: string): Promise<void> => {
  await navigator.clipboard.writeText(text)
}

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}
