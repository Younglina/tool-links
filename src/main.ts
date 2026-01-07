import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './styles/main.css'
import { seedDatabase } from './db/seed'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// 初始化数据库种子数据
seedDatabase().then(() => {
  app.mount('#app')
}).catch((error) => {
  console.error('Failed to seed database:', error)
  app.mount('#app')
})

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration)
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError)
      })
  })
}