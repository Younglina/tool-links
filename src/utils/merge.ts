/**
 * 数据合并工具
 * 用于合并本地和远程的工具数据
 */

import type { Website, Category, Tag } from '@/types'

/**
 * 解析更新时间
 */
function parseUpdateDate(dateStr: string | Date): Date {
  if (!dateStr) return new Date(0)
  const date = dateStr instanceof Date ? dateStr : new Date(dateStr)
  return isNaN(date.getTime()) ? new Date(0) : date
}

/**
 * 比较两个条目的更新时间
 * @param a - 条目 A
 * @param b - 条目 B
 * @returns 比较结果（负数：A较新，正数：B较新，0：相同）
 */
function compareUpdate<T extends { updatedAt?: string | Date }>(a: T, b: T): number {
  const dateA = parseUpdateDate(a.updatedAt ?? '')
  const dateB = parseUpdateDate(b.updatedAt ?? '')
  return dateB.getTime() - dateA.getTime()
}

/**
 * 冲突信息
 */
export interface ConflictInfo<T> {
  id: number
  local: T
  remote: T
}

/**
 * 合并结果
 */
export interface MergeResult<T> {
  merged: T[]
  conflicts: ConflictInfo<T>[]
}

/**
 * 合并本地和远程的网站数据
 * 策略：按 ID 合并，保留更新时间较新的数据
 * @param localWebsites - 本地网站数组
 * @param remoteWebsites - 远程网站数组
 * @returns 合并结果
 */
export function mergeWebsites(
  localWebsites: Website[],
  remoteWebsites: Website[]
): MergeResult<Website> {
  const localMap = new Map<number, Website>()
  const remoteMap = new Map<number, Website>()

  // 创建 ID 到网站的映射
  localWebsites.forEach(site => {
    if (site.id !== undefined) {
      localMap.set(site.id, site)
    }
  })

  remoteWebsites.forEach(site => {
    if (site.id !== undefined) {
      remoteMap.set(site.id, site)
    }
  })

  const merged: Website[] = []
  const conflicts: ConflictInfo<Website>[] = []

  // 处理所有唯一 ID
  const allIds = new Set<number>([...localMap.keys(), ...remoteMap.keys()])

  allIds.forEach(id => {
    const localSite = localMap.get(id)
    const remoteSite = remoteMap.get(id)

    if (localSite && remoteSite) {
      // 双方都有此网站，比较更新时间
      const comparison = compareUpdate(localSite, remoteSite)

      if (comparison > 0) {
        // 远程较新
        merged.push(remoteSite)
      } else if (comparison < 0) {
        // 本地较新
        merged.push(localSite)
      } else {
        // 更新时间相同，可能有冲突
        const isDifferent = JSON.stringify(localSite) !== JSON.stringify(remoteSite)
        if (isDifferent) {
          conflicts.push({
            id,
            local: localSite,
            remote: remoteSite
          })
        }
        merged.push(localSite)
      }
    } else if (localSite) {
      // 仅本地有
      merged.push(localSite)
    } else if (remoteSite) {
      // 仅远程有
      merged.push(remoteSite)
    }
  })

  // 按更新时间排序
  merged.sort((a, b) => compareUpdate(a, b))

  return { merged, conflicts }
}

/**
 * 合并本地和远程的分类数据
 * @param localCategories - 本地分类数组
 * @param remoteCategories - 远程分类数组
 * @returns 合并后的分类数组
 */
export function mergeCategories(
  localCategories: Category[],
  remoteCategories: Category[]
): Category[] {
  const merged = new Map<string, Category>()

  // 合并所有分类，按名称去重
  const allCategories = [...localCategories, ...remoteCategories]
  allCategories.forEach(category => {
    const key = `${category.name}_${category.iconName}`
    if (!merged.has(key)) {
      merged.set(key, category)
    }
  })

  return Array.from(merged.values())
}

/**
 * 合并本地和远程的标签数据
 * @param localTags - 本地标签数组
 * @param remoteTags - 远程标签数组
 * @returns 合并后的标签数组
 */
export function mergeTags(localTags: Tag[], remoteTags: Tag[]): Tag[] {
  const merged = new Map<string, Tag>()

  // 合并所有标签，按名称去重
  const allTags = [...localTags, ...remoteTags]
  allTags.forEach(tag => {
    const key = tag.name
    if (merged.has(key)) {
      // 累加计数
      const existing = merged.get(key)!
      existing.count = Math.max(existing.count, tag.count)
    } else {
      merged.set(key, { ...tag })
    }
  })

  return Array.from(merged.values())
}

/**
 * 检测本地和远程数据之间的冲突
 * @param localData - 本地数据数组
 * @param remoteData - 远程数据数组
 * @returns 冲突列表
 */
export function detectConflicts<T extends { id: number | undefined }>(
  localData: T[],
  remoteData: T[]
): ConflictInfo<T>[] {
  const { conflicts } = mergeGeneric(localData, remoteData)
  return conflicts
}

/**
 * 通用合并函数
 */
function mergeGeneric<T extends { id: number | undefined }>(
  localData: T[],
  remoteData: T[]
): MergeResult<T> {
  const localMap = new Map<number, T>()
  const remoteMap = new Map<number, T>()

  localData.forEach(item => {
    if (item.id !== undefined) {
      localMap.set(item.id, item)
    }
  })

  remoteData.forEach(item => {
    if (item.id !== undefined) {
      remoteMap.set(item.id, item)
    }
  })

  const merged: T[] = []
  const conflicts: ConflictInfo<T>[] = []

  const allIds = new Set<number>([...localMap.keys(), ...remoteMap.keys()])

  allIds.forEach(id => {
    const localItem = localMap.get(id)
    const remoteItem = remoteMap.get(id)

    if (localItem && remoteItem) {
      const isDifferent = JSON.stringify(localItem) !== JSON.stringify(remoteItem)
      if (isDifferent) {
        conflicts.push({
          id,
          local: localItem,
          remote: remoteItem
        })
      }
      merged.push(localItem)
    } else if (localItem) {
      merged.push(localItem)
    } else if (remoteItem) {
      merged.push(remoteItem)
    }
  })

  return { merged, conflicts }
}

/**
 * 同步摘要
 */
export interface SyncSummary {
  websiteSummary: {
    localCount: number
    remoteCount: number
    localNewCount: number
    remoteNewCount: number
    localUpdatedCount: number
    remoteUpdatedCount: number
    conflictCount: number
    hasChanges: boolean
  }
}

/**
 * 获取同步摘要信息
 * @param localWebsites - 本地网站数组
 * @param remoteWebsites - 远程网站数组
 * @returns 同步摘要
 */
export function getSyncSummary(
  localWebsites: Website[],
  remoteWebsites: Website[]
): SyncSummary {
  const localIds = new Set(localWebsites.map(t => t.id).filter((id): id is number => id !== undefined))
  const remoteIds = new Set(remoteWebsites.map(t => t.id).filter((id): id is number => id !== undefined))

  const localNew = localWebsites.filter(t => t.id !== undefined && !remoteIds.has(t.id))
  const remoteNew = remoteWebsites.filter(t => t.id !== undefined && !localIds.has(t.id))

  const localUpdated: Website[] = []
  const remoteUpdated: Website[] = []

  const commonIds = [...localIds].filter(id => remoteIds.has(id))

  commonIds.forEach(id => {
    const localSite = localWebsites.find(t => t.id === id)
    const remoteSite = remoteWebsites.find(t => t.id === id)

    if (localSite && remoteSite) {
      const comparison = compareUpdate(localSite, remoteSite)

      if (comparison < 0) {
        // 本地较新
        localUpdated.push(localSite)
      } else if (comparison > 0) {
        // 远程较新
        remoteUpdated.push(remoteSite)
      }
    }
  })

  const { conflicts } = mergeWebsites(localWebsites, remoteWebsites)

  return {
    websiteSummary: {
      localCount: localWebsites.length,
      remoteCount: remoteWebsites.length,
      localNewCount: localNew.length,
      remoteNewCount: remoteNew.length,
      localUpdatedCount: localUpdated.length,
      remoteUpdatedCount: remoteUpdated.length,
      conflictCount: conflicts.length,
      hasChanges:
        localNew.length > 0 ||
        remoteNew.length > 0 ||
        localUpdated.length > 0 ||
        remoteUpdated.length > 0
    }
  }
}

export default {
  mergeWebsites,
  mergeCategories,
  mergeTags,
  detectConflicts,
  getSyncSummary
}
