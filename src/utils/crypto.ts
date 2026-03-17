/**
 * 加密工具模块
 * 使用 Web Crypto API 实现 AES-256-GCM 加密
 */

/**
 * 从密码派生密钥
 * @param password - 用户密码
 * @param salt - 盐值
 * @returns 派生的密钥
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const passwordBuffer = encoder.encode(password)

  // 导入密码作为密钥材料
  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  )

  // 派生 AES-GCM 密钥
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * 将 ArrayBuffer 转换为 Base64 字符串
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * 将 Base64 字符串转换为 ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

/**
 * 加密数据
 * @param data - 要加密的数据（任意 JSON 可序列化对象）
 * @param password - 加密密码
 * @returns 加密后的 JSON 字符串
 */
export async function encrypt(data: unknown, password: string): Promise<string> {
  if (!password || password.length < 8) {
    throw new Error('密码长度至少为8个字符')
  }

  // 生成随机 IV（初始化向量）和盐值
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const salt = crypto.getRandomValues(new Uint8Array(16))

  // 派生密钥
  const key = await deriveKey(password, salt)

  // 将数据编码为 JSON
  const encoder = new TextEncoder()
  const plaintext = encoder.encode(JSON.stringify(data))

  // 加密
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    plaintext
  )

  // 返回加密结果
  const result = {
    version: '1.0',
    iv: arrayBufferToBase64(iv),
    salt: arrayBufferToBase64(salt),
    ciphertext: arrayBufferToBase64(ciphertext)
  }

  return JSON.stringify(result)
}

/**
 * 解密数据
 * @param encryptedData - 加密的数据字符串
 * @param password - 解密密码
 * @returns 解密后的原始数据
 */
export async function decrypt<T = unknown>(encryptedData: string, password: string): Promise<T> {
  if (!password) {
    throw new Error('请提供解密密码')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(encryptedData)
  } catch (e) {
    throw new Error('加密数据格式无效')
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('加密数据格式无效')
  }

  const data = parsed as { version?: string; iv?: string; salt?: string; ciphertext?: string }

  if (data.version !== '1.0') {
    throw new Error(`不支持的加密版本: ${data.version}`)
  }

  if (!data.iv || !data.salt || !data.ciphertext) {
    throw new Error('加密数据不完整')
  }

  try {
    // 解析 IV、盐值和密文
    const iv = base64ToArrayBuffer(data.iv)
    const salt = base64ToArrayBuffer(data.salt)
    const ciphertext = base64ToArrayBuffer(data.ciphertext)

    // 派生密钥
    const key = await deriveKey(password, salt)

    // 解密
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: new Uint8Array(iv)
      },
      key,
      ciphertext
    )

    // 解码为 JSON
    const decoder = new TextDecoder()
    const plaintext = decoder.decode(decrypted)

    return JSON.parse(plaintext) as T
  } catch (e) {
    throw new Error('解密失败，请检查密码是否正确')
  }
}

export default { encrypt, decrypt }
