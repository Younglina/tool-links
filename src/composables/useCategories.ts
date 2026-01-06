import { ref } from 'vue'
import { db } from '@/db'
import type { Category } from '@/types'

const globalCategories = ref<Category[]>([])
let categoriesLoaded = false

export const useCategories = () => {
  const categories = globalCategories
  const isLoading = ref(false)

  const loadCategories = async () => {
    if (categoriesLoaded) {
      return
    }

    isLoading.value = true
    try {
      categories.value = await db.categories.toArray()
      categoriesLoaded = true
    } catch (error) {
      console.error('Failed to load categories:', error)
    } finally {
      isLoading.value = false
    }
  }

  const addCategory = async (category: Omit<Category, 'id'>) => {
    try {
      await db.categories.add(category)
      await loadCategories()
    } catch (error) {
      console.error('Failed to add category:', error)
      throw error
    }
  }

  const updateCategory = async (id: number, updates: Partial<Category>) => {
    try {
      await db.categories.update(id, updates)
      await loadCategories()
    } catch (error) {
      console.error('Failed to update category:', error)
      throw error
    }
  }

  const deleteCategory = async (id: number) => {
    try {
      await db.categories.delete(id)
      await loadCategories()
    } catch (error) {
      console.error('Failed to delete category:', error)
      throw error
    }
  }

  const getCategoryById = async (id: number) => {
    return await db.categories.get(id)
  }

  return {
    categories,
    isLoading,
    loadCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById
  }
}
