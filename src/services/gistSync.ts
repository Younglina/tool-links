/**
 * GitHub Gist 同步服务
 * 用于将加密的数据同步到 GitHub Gist
 */

const GIST_FILENAME = 'ai-tools-links-data.json.enc'
const GIST_DESCRIPTION = 'AI Tools Links Encrypted Data'

/**
 * 同步状态枚举
 */
export enum SyncStatus {
  IDLE = 'idle',
  ENCRYPTING = 'encrypting',
  UPLOADING = 'uploading',
  DOWNLOADING = 'downloading',
  DECRYPTING = 'decrypting',
  MERGING = 'merging',
  SUCCESS = 'success',
  ERROR = 'error'
}

/**
 * Gist 上传结果
 */
export interface GistUploadResult {
  id: string
  url: string
  updatedAt: string
  version: string
}

/**
 * Gist 版本信息
 */
export interface GistVersionInfo {
  id: string
  url: string
  updatedAt: string
  version: string
  historyCount: number
}

/**
 * GitHub 用户信息
 */
export interface GitHubUserInfo {
  login: string
  email: string | null
  id: number
}

/**
 * Gist 同步服务类
 */
export class GistSyncService {
  private token: string
  private baseUrl = 'https://api.github.com'

  constructor(token: string) {
    this.token = token
  }

  /**
   * 获取请求头
   */
  private getHeaders(): HeadersInit {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    }
  }

  /**
   * 创建或更新 Gist
   * @param encryptedData - 加密后的数据
   * @param gistId - 已存在的 Gist ID（可选）
   * @returns 创建/更新的 Gist 信息
   */
  async upload(encryptedData: string, gistId: string | null = null): Promise<GistUploadResult> {
    const gistData = {
      description: GIST_DESCRIPTION,
      public: false,
      files: {
        [GIST_FILENAME]: {
          content: encryptedData
        }
      }
    }

    const url = gistId
      ? `${this.baseUrl}/gists/${gistId}`
      : `${this.baseUrl}/gists`

    const method = gistId ? 'PATCH' : 'POST'

    try {
      const response = await fetch(url, {
        method,
        headers: this.getHeaders(),
        body: JSON.stringify(gistData)
      })

      if (!response.ok) {
        const error: unknown = await response.json()
        const message = typeof error === 'object' && error !== null && 'message' in error
          ? String(error.message)
          : '上传到 Gist 失败'
        throw new Error(message)
      }

      const result = await response.json()

      return {
        id: result.id,
        url: result.html_url,
        updatedAt: result.updated_at,
        version: result.version
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('Bad credentials')) {
        throw new Error('GitHub Token 无效，请检查配置')
      }
      throw error
    }
  }

  /**
   * 从 Gist 下载数据
   * @param gistId - Gist ID
   * @returns 加密的数据字符串
   */
  async download(gistId: string): Promise<string> {
    if (!gistId) {
      throw new Error('未找到 Gist ID，请先上传数据')
    }

    try {
      const response = await fetch(`${this.baseUrl}/gists/${gistId}`, {
        headers: this.getHeaders()
      })

      if (!response.ok) {
        const error: unknown = await response.json()
        const message = typeof error === 'object' && error !== null && 'message' in error
          ? String(error.message)
          : '从 Gist 下载失败'
        throw new Error(message)
      }

      const gist = await response.json()
      const file = gist.files[GIST_FILENAME]

      if (!file) {
        throw new Error('Gist 中未找到数据文件')
      }

      return file.content
    } catch (error) {
      if (error instanceof Error && error.message.includes('Not Found')) {
        throw new Error('Gist 不存在或已被删除')
      }
      throw error
    }
  }

  /**
   * 获取 Gist 最新版本信息
   * @param gistId - Gist ID
   * @returns 版本信息，如果获取失败返回 null
   */
  async getLatestVersion(gistId: string): Promise<GistVersionInfo | null> {
    if (!gistId) {
      return null
    }

    try {
      const response = await fetch(`${this.baseUrl}/gists/${gistId}`, {
        headers: this.getHeaders()
      })

      if (!response.ok) {
        return null
      }

      const gist = await response.json()

      return {
        id: gist.id,
        url: gist.html_url,
        updatedAt: gist.updated_at,
        version: gist.version,
        historyCount: gist.history?.length ?? 0
      }
    } catch (error) {
      console.error('获取 Gist 版本信息失败:', error)
      return null
    }
  }

  /**
   * 验证 Token 是否有效
   * @returns 是否有效
   */
  async validateToken(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/user`, {
        headers: this.getHeaders()
      })

      return response.ok
    } catch {
      return false
    }
  }

  /**
   * 获取用户信息
   * @returns 用户信息
   */
  async getUserInfo(): Promise<GitHubUserInfo> {
    try {
      const response = await fetch(`${this.baseUrl}/user`, {
        headers: this.getHeaders()
      })

      if (!response.ok) {
        throw new Error('获取用户信息失败')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}

export default GistSyncService
