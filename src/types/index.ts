export interface Website {
  id?: number
  name: string
  url: string
  icon: ArrayBuffer
  iconMimeType: string
  description: string
  apiKeys: string[]
  categoryId: number
  tagIds: number[]
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id?: number
  name: string
  iconName: string
}

export interface Tag {
  id?: number
  name: string
  count: number
}

export interface FilterState {
  categoryId: number | null
  tagIds: number[]
  searchQuery: string
}
