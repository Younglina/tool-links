import { db } from './index'
import { DEFAULT_CATEGORIES, DEFAULT_TAGS } from '@/utils/constants'
import type { Website } from '@/types'

// 开发环境内置网站数据
const DEFAULT_WEBSITES: Omit<Website, 'id'>[] = [
  {
    name: 'ChatGPT',
    url: 'https://chat.openai.com',
    icon: new ArrayBuffer(0),
    iconMimeType: '',
    description: 'OpenAI 开发的大型语言模型，支持对话、写作、编程等多种任务',
    categoryIds: [1],
    tagIds: [2, 4, 5],
    apiKeys: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Claude',
    url: 'https://claude.ai',
    icon: new ArrayBuffer(0),
    iconMimeType: '',
    description: 'Anthropic 开发的 AI 助手，擅长分析、写作和编程',
    categoryIds: [1],
    tagIds: [1, 4, 5],
    apiKeys: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Midjourney',
    url: 'https://www.midjourney.com',
    icon: new ArrayBuffer(0),
    iconMimeType: '',
    description: '强大的 AI 图像生成工具，通过文字描述创建精美图片',
    categoryIds: [2],
    tagIds: [2, 4, 5],
    apiKeys: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Stable Diffusion',
    url: 'https://stability.ai',
    icon: new ArrayBuffer(0),
    iconMimeType: '',
    description: '开源的图像生成模型，支持本地部署和自定义训练',
    categoryIds: [2],
    tagIds: [1, 4, 7],
    apiKeys: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'GitHub Copilot',
    url: 'https://github.com/features/copilot',
    icon: new ArrayBuffer(0),
    iconMimeType: '',
    description: 'AI 编程助手，提供代码补全、生成和解释功能',
    categoryIds: [3],
    tagIds: [2, 4, 5],
    apiKeys: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Cursor',
    url: 'https://cursor.sh',
    icon: new ArrayBuffer(0),
    iconMimeType: '',
    description: '基于 AI 的代码编辑器，支持智能补全和代码生成',
    categoryIds: [3],
    tagIds: [1, 4, 5],
    apiKeys: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'ElevenLabs',
    url: 'https://elevenlabs.io',
    icon: new ArrayBuffer(0),
    iconMimeType: '',
    description: 'AI 语音合成平台，支持多语言、多音色的语音生成',
    categoryIds: [4],
    tagIds: [1, 4, 5],
    apiKeys: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Runway',
    url: 'https://runwayml.com',
    icon: new ArrayBuffer(0),
    iconMimeType: '',
    description: 'AI 视频生成和编辑平台，支持文生视频、图生视频等功能',
    categoryIds: [5],
    tagIds: [2, 4, 5],
    apiKeys: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: '通义千问',
    url: 'https://tongyi.aliyun.com',
    icon: new ArrayBuffer(0),
    iconMimeType: '',
    description: '阿里云推出的大语言模型，支持中文对话和多模态理解',
    categoryIds: [1],
    tagIds: [1, 3, 5],
    apiKeys: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: '文心一言',
    url: 'https://yiyan.baidu.com',
    icon: new ArrayBuffer(0),
    iconMimeType: '',
    description: '百度推出的生成式 AI 产品，支持对话、创作等功能',
    categoryIds: [1],
    tagIds: [1, 3, 5],
    apiKeys: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Kimi',
    url: 'https://kimi.moonshot.cn',
    icon: new ArrayBuffer(0),
    iconMimeType: '',
    description: '月之暗面推出的 AI 助手，支持超长上下文和文件分析',
    categoryIds: [1],
    tagIds: [1, 3, 5],
    apiKeys: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Perplexity',
    url: 'https://www.perplexity.ai',
    icon: new ArrayBuffer(0),
    iconMimeType: '',
    description: 'AI 搜索引擎，结合大模型和实时网络搜索提供答案',
    categoryIds: [1],
    tagIds: [1, 4, 5],
    apiKeys: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

export const seedDatabase = async () => {
  const categoryCount = await db.categories.count()
  if (categoryCount === 0) {
    await db.categories.bulkAdd(DEFAULT_CATEGORIES)
    console.log('Categories seeded')
  }

  const tagCount = await db.tags.count()
  if (tagCount === 0) {
    await db.tags.bulkAdd(DEFAULT_TAGS)
    console.log('Tags seeded')
  }

  // 仅在开发环境添加示例网站
  if (import.meta.env.DEV) {
    const websiteCount = await db.websites.count()
    if (websiteCount === 0) {
      await db.websites.bulkAdd(DEFAULT_WEBSITES)
      console.log('Websites seeded')
    }
  }
}
