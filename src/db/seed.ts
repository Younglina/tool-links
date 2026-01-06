import { db } from './index'
import { DEFAULT_CATEGORIES, DEFAULT_TAGS } from '@/utils/constants'

export const seedDatabase = async () => {
  const categoryCount = await db.categories.count()
  if (categoryCount === 0) {
    await db.categories.bulkAdd(DEFAULT_CATEGORIES)
    console.log('Categories seeded')
  }

  const tagCount = await db.tags.count()
  if (tagCount === 0) {
    await db.tags.bulkAdd(DEFAULT_TAGS)
    console.log('Tags seeded')
  }
}
