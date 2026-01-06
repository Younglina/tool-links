import Dexie, { Table } from 'dexie'
import { Website, Category, Tag } from '@/types'

export class AISitesDB extends Dexie {
  websites!: Table<Website>
  categories!: Table<Category>
  tags!: Table<Tag>

  constructor() {
    super('AISitesDB')

    this.version(1).stores({
      websites: '++id, name, categoryId, createdAt',
      categories: '++id, name',
      tags: '++id, name'
    })
  }
}

export const db = new AISitesDB()
