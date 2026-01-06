import { ref } from 'vue'
import { db } from '@/db'
import type { Tag } from '@/types'

const globalTags = ref<Tag[]>([])
let tagsLoaded = false

export const useTags = () => {
  const tags = globalTags
  const isLoading = ref(false)

  const loadTags = async () => {
    if (tagsLoaded) {
      return
    }

    isLoading.value = true
    try {
      tags.value = await db.tags.toArray()
      tagsLoaded = true
    } catch (error) {
      console.error('Failed to load tags:', error)
    } finally {
      isLoading.value = false
    }
  }

  const addTag = async (tag: Omit<Tag, 'id'>) => {
    try {
      await db.tags.add(tag)
      await loadTags()
    } catch (error) {
      console.error('Failed to add tag:', error)
      throw error
    }
  }

  const updateTag = async (id: number, updates: Partial<Tag>) => {
    try {
      await db.tags.update(id, updates)
      await loadTags()
    } catch (error) {
      console.error('Failed to update tag:', error)
      throw error
    }
  }

  const deleteTag = async (id: number) => {
    try {
      await db.tags.delete(id)
      await loadTags()
    } catch (error) {
      console.error('Failed to delete tag:', error)
      throw error
    }
  }

  const incrementTagCount = async (tagId: number) => {
    try {
      const tag = await db.tags.get(tagId)
      if (tag) {
        await db.tags.update(tagId, { count: (tag.count || 0) + 1 })
      }
    } catch (error) {
      console.error('Failed to increment tag count:', error)
    }
  }

  const decrementTagCount = async (tagId: number) => {
    try {
      const tag = await db.tags.get(tagId)
      if (tag && tag.count > 0) {
        await db.tags.update(tagId, { count: tag.count - 1 })
      }
    } catch (error) {
      console.error('Failed to decrement tag count:', error)
    }
  }

  const getTagById = async (id: number) => {
    return await db.tags.get(id)
  }

  return {
    tags,
    isLoading,
    loadTags,
    addTag,
    updateTag,
    deleteTag,
    incrementTagCount,
    decrementTagCount,
    getTagById
  }
}
