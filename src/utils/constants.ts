import { Category, Tag } from '@/types'

export const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: '大模型', iconName: 'robot' },
  { name: '图像生成', iconName: 'image' },
  { name: '编程助手', iconName: 'code-tags' },
  { name: '音频/语音', iconName: 'volume-high' },
  { name: '视频生成', iconName: 'movie-open' },
  { name: '数据分析', iconName: 'chart-line' },
  { name: '文本处理', iconName: 'format-text' },
]

export const DEFAULT_TAGS: Omit<Tag, 'id'>[] = [
  { name: '免费', count: 0 },
  { name: '付费', count: 0 },
  { name: '中文界面', count: 0 },
  { name: '英文界面', count: 0 },
  { name: '需要注册', count: 0 },
  { name: '无需注册', count: 0 },
  { name: '开源', count: 0 },
  { name: '闭源', count: 0 },
  { name: '无需APIKey', count: 0 },
]

export const MAX_FILE_SIZE = 500 * 1024 // 500KB
export const RECOMMENDED_IMAGE_SIZE = '128-256px'
