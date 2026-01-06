import { ref, onMounted, watch } from 'vue'
import type { Theme } from '@/types'

export const useTheme = () => {
  const currentTheme = ref<Theme>('zen')

  const themes: Theme[] = ['zen']

  const setTheme = (theme: Theme) => {
    currentTheme.value = theme
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }

  const loadTheme = () => {
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme && themes.includes(savedTheme)) {
      setTheme(savedTheme)
    } else {
      setTheme('zen')
    }
  }

  onMounted(() => {
    loadTheme()
  })

  return {
    currentTheme,
    themes,
    setTheme
  }
}
