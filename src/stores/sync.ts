/**
 * 同步状态 Store
 * 管理 Gist 同步相关的状态和操作
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GistUploadResult, GitHubUserInfo, SyncStatus as SyncStatusEnum } from '@/services/gistSync'
import { encrypt, decrypt } from '@/utils/crypto'
import { mergeWebsites, mergeCategories, mergeTags, getSyncSummary } from '@/utils/merge'
import { db } from '@/db'
import type { Website, Category, Tag } from '@/types'
import GistSyncService from '@/services/gistSync'

/**
 * 同步数据结构
 */
export interface SyncData {
  websites: Website[]
  categories: Category[]
  tags: Tag[]
  exportDate: string
  version: string
}

export const useSyncStore = defineStore('sync', () => {
  // 状态
  const token = ref('')
  const gistId = ref('')
  const gistUrl = ref('')
  const lastSync = ref('')
  const syncStatus = ref<SyncStatusEnum>('idle' as SyncStatusEnum)
  const syncError = ref('')
  const userInfo = ref<GitHubUserInfo | null>(null)
  const syncSummary = ref<ReturnType<typeof getSyncSummary> | null>(null)

  // 计算属性
  const hasGist = computed(() => !!gistId.value)
  const isSyncing = computed(() => syncStatus.value !== 'idle' && syncStatus.value !== 'success' && syncStatus.value !== 'error')
  const canUpload = computed(() => !!token.value && !isSyncing.value)
  const canDownload = computed(() => !!token.value && !!gistId.value && !isSyncing.value)

  // 从 localStorage 加载配置
  function loadConfig() {
    token.value = localStorage.getItem('gistToken') || ''
    gistId.value = localStorage.getItem('gistId') || ''
    gistUrl.value = localStorage.getItem('gistUrl') || ''
    lastSync.value = localStorage.getItem('gistLastSync') || ''
  }

  // 保存配置到 localStorage
  function saveConfig() {
    if (token.value) localStorage.setItem('gistToken', token.value)
    else localStorage.removeItem('gistToken')

    if (gistId.value) localStorage.setItem('gistId', gistId.value)
    else localStorage.removeItem('gistId')

    if (gistUrl.value) localStorage.setItem('gistUrl', gistUrl.value)
    else localStorage.removeItem('gistUrl')

    if (lastSync.value) localStorage.setItem('gistLastSync', lastSync.value)
    else localStorage.removeItem('gistLastSync')
  }

  // 设置 Token
  function setToken(newToken: string) {
    token.value = newToken
    saveConfig()
  }

  // 设置 Gist ID
  function setGistId(id: string) {
    gistId.value = id
    saveConfig()
  }

  // 清除配置
  function clearConfig() {
    token.value = ''
    gistId.value = ''
    gistUrl.value = ''
    lastSync.value = ''
    userInfo.value = null
    syncSummary.value = null
    saveConfig()
  }

  // 验证 Token
  async function validateToken(): Promise<boolean> {
    if (!token.value) {
      return false
    }

    try {
      const service = new GistSyncService(token.value)
      const valid = await service.validateToken()

      if (valid) {
        userInfo.value = await service.getUserInfo()
      }

      return valid
    } catch (error) {
      console.error('验证 Token 失败:', error)
      return false
    }
  }

  // 上传到 Gist
  async function uploadToGist(password: string): Promise<void> {
    if (!password || password.length < 8) {
      throw new Error('请输入至少8位密码')
    }

    if (!token.value) {
      throw new Error('请先配置 GitHub Token')
    }

    try {
      syncStatus.value = 'encrypting'
      syncError.value = ''

      // 获取所有本地数据
      const [websites, categories, tags] = await Promise.all([
        db.websites.toArray(),
        db.categories.toArray(),
        db.tags.toArray()
      ])

      const dataToSync: SyncData = {
        websites,
        categories,
        tags,
        exportDate: new Date().toISOString(),
        version: '1.0'
      }

      // 加密数据
      const encryptedData = await encrypt(dataToSync, password)

      // 上传到 Gist
      syncStatus.value = 'uploading'
      const service = new GistSyncService(token.value)
      const result: GistUploadResult = await service.upload(encryptedData, gistId.value || null)

      // 更新 Gist 信息
      gistId.value = result.id
      gistUrl.value = result.url
      lastSync.value = new Date().toISOString()

      saveConfig()
      syncStatus.value = 'success'
    } catch (error) {
      syncStatus.value = 'error'
      syncError.value = error instanceof Error ? error.message : '上传失败'
      throw error
    }
  }

  // 从 Gist 下载
  async function downloadFromGist(password: string): Promise<void> {
    if (!password || password.length < 8) {
      throw new Error('请输入至少8位密码')
    }

    if (!token.value || !gistId.value) {
      throw new Error('请先配置 GitHub Token 并上传数据')
    }

    try {
      syncStatus.value = 'downloading'
      syncError.value = ''

      // 下载加密数据
      const service = new GistSyncService(token.value)
      const encryptedData = await service.download(gistId.value)

      // 解密数据
      syncStatus.value = 'decrypting'
      const remoteData = await decrypt<SyncData>(encryptedData, password)

      if (!remoteData.websites || !Array.isArray(remoteData.websites)) {
        throw new Error('远程数据格式无效')
      }

      // 获取本地数据
      const [localWebsites, localCategories, localTags] = await Promise.all([
        db.websites.toArray(),
        db.categories.toArray(),
        db.tags.toArray()
      ])

      // 合并数据
      syncStatus.value = 'merging'

      // 合并网站
      const { merged: mergedWebsites, conflicts: websiteConflicts } = mergeWebsites(
        localWebsites,
        remoteData.websites
      )

      // 合并分类
      const mergedCategories = mergeCategories(localCategories, remoteData.categories)

      // 合并标签
      const mergedTags = mergeTags(localTags, remoteData.tags)

      // 生成同步摘要
      syncSummary.value = getSyncSummary(localWebsites, remoteData.websites)

      // 清空并导入合并后的数据
      await db.transaction('rw', db.websites, db.categories, db.tags, async () => {
        // 清空所有表
        await db.websites.clear()
        await db.categories.clear()
        await db.tags.clear()

        // 导入合并后的数据
        await db.websites.bulkAdd(mergedWebsites)
        await db.categories.bulkAdd(mergedCategories)
        await db.tags.bulkAdd(mergedTags)
      })

      lastSync.value = new Date().toISOString()
      saveConfig()

      syncStatus.value = 'success'

      if (websiteConflicts.length > 0) {
        console.warn(`发现 ${websiteConflicts.length} 个冲突，已自动使用本地数据`)
      }
    } catch (error) {
      syncStatus.value = 'error'
      syncError.value = error instanceof Error ? error.message : '下载失败'
      throw error
    }
  }

  // 获取最后同步时间格式化文本
  function getLastSyncText(): string {
    if (!lastSync.value) return '从未同步'

    const date = new Date(lastSync.value)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diff < 60) return '刚刚同步'
    if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`
    if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`
    return date.toLocaleDateString()
  }

  // 重置状态
  function resetStatus() {
    syncStatus.value = 'idle' as SyncStatusEnum
    syncError.value = ''
    syncSummary.value = null
  }

  // 初始化
  loadConfig()

  return {
    // 状态
    token,
    gistId,
    gistUrl,
    lastSync,
    syncStatus,
    syncError,
    userInfo,
    syncSummary,

    // 计算属性
    hasGist,
    isSyncing,
    canUpload,
    canDownload,

    // 方法
    loadConfig,
    saveConfig,
    setToken,
    setGistId,
    clearConfig,
    validateToken,
    uploadToGist,
    downloadFromGist,
    getLastSyncText,
    resetStatus
  }
})
