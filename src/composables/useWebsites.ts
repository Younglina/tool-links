import { ref, computed } from 'vue'
import { db } from '@/db'
import type { Website } from '@/types'
import { arrayBufferToUrl, fileToArrayBuffer } from './useImageUpload'

// 全局共享状态
const websites = ref<Website[]>([])
const selectedWebsite = ref<Website | null>(null)
const isLoading = ref(false)

export const useWebsites = () => {
  const loadWebsites = async () => {
    isLoading.value = true
    try {
      websites.value = await db.websites.toArray()
    } catch (error) {
      console.error('Failed to load websites:', error)
    } finally {
      isLoading.value = false
    }
  }

  const addWebsite = async (websiteData: Omit<Website, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const now = new Date()
      const website: Website = {
        ...websiteData,
        createdAt: now,
        updatedAt: now
      }
      await db.websites.add(website)
      await loadWebsites()
    } catch (error) {
      console.error('Failed to add website:', error)
      throw error
    }
  }

  const updateWebsite = async (id: number, updates: Partial<Website>) => {
    try {
      const dataToUpdate = {
        ...updates,
        categoryIds: updates.categoryIds ? [...updates.categoryIds] : undefined,
        tagIds: updates.tagIds ? [...updates.tagIds] : undefined,
        apiKeys: updates.apiKeys ? [...updates.apiKeys] : undefined,
        updatedAt: new Date()
      }
      await db.websites.update(id, dataToUpdate)
      await loadWebsites()
    } catch (error) {
      console.error('Failed to update website:', error)
      throw error
    }
  }

  const deleteWebsite = async (id: number) => {
    try {
      await db.websites.delete(id)
      await loadWebsites()
    } catch (error) {
      console.error('Failed to delete website:', error)
      throw error
    }
  }

  const getWebsiteById = async (id: number) => {
    try {
      selectedWebsite.value = await db.websites.get(id)
      return selectedWebsite.value
    } catch (error) {
      console.error('Failed to get website:', error)
      return null
    }
  }

  const getWebsiteIconUrl = (website: Website) => {
    return arrayBufferToUrl(website.icon, website.iconMimeType)
  }

  return {
    websites,
    selectedWebsite,
    isLoading,
    loadWebsites,
    addWebsite,
    updateWebsite,
    deleteWebsite,
    getWebsiteById,
    getWebsiteIconUrl
  }
}
