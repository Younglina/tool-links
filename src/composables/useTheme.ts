import { ref, onMounted, watch } from 'vue'

export const useTheme = () => {
  const currentTheme = ref('neumorphism')

  const setTheme = (theme: string) => {
    currentTheme.value = theme
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }

  const loadTheme = () => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'neumorphism') {
      setTheme(savedTheme)
    } else {
      setTheme('neumorphism')
    }
  }

  onMounted(() => {
    loadTheme()
  })

  return {
    currentTheme,
    setTheme
  }
}
