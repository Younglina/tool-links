import Dexie, { Table } from 'dexie'
import { Website, Category, Tag } from '@/types'

export class SitesDB extends Dexie {
  websites!: Table<Website>
  categories!: Table<Category>
  tags!: Table<Tag>

  constructor() {
    super('SitesDB')

    this.version(1).stores({
      websites: '++id, name, categoryId, createdAt',
      categories: '++id, name',
      tags: '++id, name'
    })

    // Version 2: categoryId -> categoryIds (array)
    this.version(2).stores({
      websites: '++id, name, *categoryIds, createdAt',
      categories: '++id, name',
      tags: '++id, name'
    }).upgrade(tx => {
      return tx.table('websites').toCollection().modify(website => {
        // Migrate categoryId to categoryIds array
        if (website.categoryId !== undefined && !website.categoryIds) {
          website.categoryIds = website.categoryId ? [website.categoryId] : []
          delete website.categoryId
        }
      })
    })
  }
}

export const db = new SitesDB()
