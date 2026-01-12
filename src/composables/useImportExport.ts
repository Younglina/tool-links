import { db } from '@/db'
import { Website, Category, Tag } from '@/types'

export interface ExportData {
  version: number
  exportedAt: string
  websites: WebsiteExport[]
  categories: Category[]
  tags: Tag[]
}

export interface WebsiteExport extends Omit<Website, 'icon'> {
  icon?: string
}

export interface ImportResult {
  websites: number
  categories: number
  tags: number
}

async function arrayBufferToBase64(buffer: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

async function base64ToArrayBuffer(base64: string): Promise<ArrayBuffer> {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

export async function exportData(): Promise<void> {
  const websites = await db.websites.toArray()
  const categories = await db.categories.toArray()
  const tags = await db.tags.toArray()

  const exportData: ExportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    websites: await Promise.all(websites.map(async w => ({
      ...w,
      icon: w.icon ? await arrayBufferToBase64(w.icon) : undefined
    }))),
    categories,
    tags
  }

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `tools-export-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function importData(file: File, mode: 'merge' | 'replace' = 'merge'): Promise<ImportResult> {
  const text = await file.text()
  const data: ExportData = JSON.parse(text)

  if (mode === 'replace') {
    await db.websites.clear()
    await db.categories.clear()
    await db.tags.clear()
  }

  const oldCategoryIdMap = new Map<number, number>()
  const oldTagIdMap = new Map<number, number>()

  const categoryIds: number[] = []
  for (const c of data.categories) {
    const existing = await db.categories.where('name').equals(c.name).first()
    if (existing) {
      oldCategoryIdMap.set(c.id!, existing.id!)
      categoryIds.push(existing.id!)
    } else {
      const id = await db.categories.add({ name: c.name, iconName: c.iconName })
      if (typeof id === 'number') {
        oldCategoryIdMap.set(c.id!, id)
        categoryIds.push(id)
      }
    }
  }

  const tagIds: number[] = []
  for (const t of data.tags) {
    const existing = await db.tags.where('name').equals(t.name).first()
    if (existing) {
      oldTagIdMap.set(t.id!, existing.id!)
      tagIds.push(existing.id!)
    } else {
      const id = await db.tags.add({ name: t.name, count: 0 })
      if (typeof id === 'number') {
        oldTagIdMap.set(t.id!, id)
        tagIds.push(id)
      }
    }
  }

  const existingUrls = new Set((await db.websites.toArray()).map(w => w.url))

  let websiteCount = 0
  for (const w of data.websites) {
    if (existingUrls.has(w.url)) {
      continue
    }
    await db.websites.add({
      name: w.name,
      url: w.url,
      icon: w.icon ? await base64ToArrayBuffer(w.icon) : undefined,
      iconMimeType: w.iconMimeType || 'image/png',
      description: w.description,
      apiKeys: w.apiKeys || [],
      categoryIds: (w.categoryIds || []).map(id => oldCategoryIdMap.get(id) || 0),
      tagIds: (w.tagIds || []).map(id => oldTagIdMap.get(id) || 0),
      createdAt: w.createdAt ? new Date(w.createdAt) : new Date(),
      updatedAt: w.updatedAt ? new Date(w.updatedAt) : new Date()
    })
    websiteCount++
  }

  return {
    websites: websiteCount,
    categories: categoryIds.length,
    tags: tagIds.length
  }
}
