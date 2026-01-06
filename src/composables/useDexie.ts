import { db } from '@/db'
import { seedDatabase } from '@/db/seed'
import { ref, onMounted } from 'vue'

export const useDexie = () => {
  const isReady = ref(false)

  const initializeDatabase = async () => {
    try {
      await db.open()
      await seedDatabase()
      isReady.value = true
    } catch (error) {
      console.error('Failed to initialize database:', error)
    }
  }

  onMounted(() => {
    initializeDatabase()
  })

  return {
    db,
    isReady
  }
}
