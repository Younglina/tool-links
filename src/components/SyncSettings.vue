<template>
  <teleport to="body">
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        @click="$emit('close')"
      >
        <transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="open"
            class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            @click.stop
          >
            <!-- 标题栏 -->
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                远程同步设置
              </h2>
              <button
                @click="$emit('close')"
                class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- 内容区域 -->
            <div class="flex-1 overflow-y-auto p-6 space-y-6">
              <!-- GitHub Token 配置 -->
              <div class="bg-gray-50 dark:bg-gray-900 rounded-xl p-5">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.411 2.91 1.411 4.597 0 4.616-2.809 5.626-5.476 5.92.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub 配置
                  </h3>
                  <span
                    v-if="userInfo"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  >
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    已验证
                  </span>
                </div>

                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      GitHub Token
                    </label>
                    <input
                      v-model="tokenInput"
                      type="password"
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                      class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      :disabled="isSyncing"
                    />
                    <p class="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                      需要 gist 权限。
                      <a
                        href="https://github.com/settings/tokens/new?scopes=gist"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-blue-500 hover:text-blue-600 underline"
                      >
                        创建新 Token
                      </a>
                    </p>
                  </div>

                  <div>
                    <button
                      @click="handleValidateToken"
                      :disabled="!tokenInput || isSyncing"
                      class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:dark:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                    >
                      <svg v-if="validating" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {{ validating ? '验证中...' : '验证 Token' }}
                    </button>
                  </div>

                  <div v-if="userInfo" class="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {{ userInfo.login?.charAt(0).toUpperCase() }}
                      </div>
                      <div>
                        <div class="font-medium text-gray-900 dark:text-white">{{ userInfo.login }}</div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">{{ userInfo.email || '邮箱未设置' }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 加密密码 -->
              <div class="bg-gray-50 dark:bg-gray-900 rounded-xl p-5">
                <h3 class="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  加密密码
                </h3>

                <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
                  <div class="flex gap-2">
                    <svg class="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                    <p class="text-sm text-amber-800 dark:text-amber-200">
                      密码用于加密/解密数据，请务必记住！密码不会保存到本地。
                    </p>
                  </div>
                </div>

                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      密码
                    </label>
                    <input
                      v-model="password"
                      type="password"
                      placeholder="请输入加密密码（至少8位）"
                      class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      :disabled="isSyncing"
                      :class="{ 'border-red-500 focus:ring-red-500': password && password.length < 8 }"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      确认密码
                    </label>
                    <input
                      v-model="confirmPassword"
                      type="password"
                      placeholder="请再次输入密码"
                      class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      :disabled="isSyncing"
                      :class="{
                        'border-red-500 focus:ring-red-500': confirmPassword && password && password !== confirmPassword,
                        'border-green-500 focus:ring-green-500': confirmPassword && password && password === confirmPassword && password.length >= 8
                      }"
                    />
                  </div>

                  <!-- 密码匹配提示 -->
                  <div v-if="confirmPassword && password" class="text-sm flex items-center gap-2">
                    <span v-if="password !== confirmPassword" class="text-red-600 dark:text-red-400 flex items-center gap-1">
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                      </svg>
                      两次输入的密码不一致
                    </span>
                    <span v-else-if="password.length >= 8" class="text-green-600 dark:text-green-400 flex items-center gap-1">
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                      密码一致
                    </span>
                    <span v-else class="text-gray-500 dark:text-gray-400">
                      请输入至少8位密码
                    </span>
                  </div>
                </div>
              </div>

              <!-- 同步操作 -->
              <div class="bg-gray-50 dark:bg-gray-900 rounded-xl p-5">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    同步操作
                  </h3>
                  <span v-if="lastSync" class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ getLastSyncText() }}
                  </span>
                </div>

                <!-- Gist ID 输入（用于无痕模式或手动指定） -->
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gist ID <span class="text-xs text-gray-500 dark:text-gray-400 normal">(可选，用于手动指定或无痕模式)</span>
                  </label>
                  <div class="flex gap-2">
                    <input
                      v-model="manualGistId"
                      type="text"
                      placeholder="手动输入 Gist ID"
                      class="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                      :disabled="isSyncing"
                    />
                    <button
                      @click="setManualGistId"
                      :disabled="!manualGistId || isSyncing"
                      class="px-4 py-2.5 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 disabled:dark:bg-gray-600 text-white font-medium rounded-lg transition-colors text-sm"
                    >
                      使用此 Gist
                    </button>
                  </div>
                </div>

                <div class="space-y-3">
                  <div class="flex gap-3">
                    <button
                      @click="handleUpload"
                      :disabled="!canUpload || !password || password.length < 8"
                      class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:dark:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                    >
                      <svg v-if="syncStatus === 'uploading'" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      上传到 Gist
                    </button>
                    <button
                      @click="handleDownload"
                      :disabled="!canDownload || !password || password.length < 8"
                      class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:dark:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                    >
                      <svg v-if="syncStatus === 'downloading'" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      从 Gist 下载
                    </button>
                  </div>

                  <a
                    v-if="gistUrl"
                    :href="gistUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="block text-center text-blue-500 hover:text-blue-600 text-sm underline"
                  >
                    打开 Gist 页面
                  </a>
                </div>
              </div>

              <!-- 同步摘要 -->
              <div v-if="syncSummary" class="bg-gray-50 dark:bg-gray-900 rounded-xl p-5">
                <h3 class="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  同步摘要
                </h3>

                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div class="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div class="text-gray-500 dark:text-gray-400 mb-1">本地网站</div>
                    <div class="text-xl font-bold text-gray-900 dark:text-white">{{ syncSummary.websiteSummary.localCount }}</div>
                  </div>
                  <div class="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div class="text-gray-500 dark:text-gray-400 mb-1">远程网站</div>
                    <div class="text-xl font-bold text-gray-900 dark:text-white">{{ syncSummary.websiteSummary.remoteCount }}</div>
                  </div>
                  <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                    <div class="text-blue-700 dark:text-blue-300 mb-1">本地新增</div>
                    <div class="text-xl font-bold text-blue-900 dark:text-blue-100">{{ syncSummary.websiteSummary.localNewCount }}</div>
                  </div>
                  <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                    <div class="text-green-700 dark:text-green-300 mb-1">远程新增</div>
                    <div class="text-xl font-bold text-green-900 dark:text-green-100">{{ syncSummary.websiteSummary.remoteNewCount }}</div>
                  </div>
                </div>

                <div v-if="syncSummary.websiteSummary.conflictCount > 0" class="mt-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <div class="flex gap-2">
                    <svg class="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                    <p class="text-sm text-amber-800 dark:text-amber-200">
                      发现 {{ syncSummary.websiteSummary.conflictCount }} 个冲突，已自动使用本地数据
                    </p>
                  </div>
                </div>
              </div>

              <!-- 加载状态 -->
              <div v-if="isSyncing" class="bg-gray-50 dark:bg-gray-900 rounded-xl p-5">
                <div class="flex items-center justify-center gap-3">
                  <svg class="w-6 h-6 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span class="text-gray-700 dark:text-gray-300">{{ getStatusText() }}</span>
                </div>
              </div>

              <!-- 错误提示 -->
              <div v-if="syncError" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div class="flex gap-2">
                  <svg class="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                  <p class="text-sm text-red-800 dark:text-red-200">{{ syncError }}</p>
                </div>
              </div>
            </div>

            <!-- 底部按钮 -->
            <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                @click="handleClose"
                class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium rounded-lg transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useSyncStore } from '@/stores/sync'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  synced: []
}>()

const syncStore = useSyncStore()

const tokenInput = ref('')
const password = ref('')
const confirmPassword = ref('')
const validating = ref(false)
const manualGistId = ref('')

const token = computed(() => syncStore.token)
const gistUrl = computed(() => syncStore.gistUrl)
const lastSync = computed(() => syncStore.lastSync)
const syncStatus = computed(() => syncStore.syncStatus)
const syncError = computed(() => syncStore.syncError)
const userInfo = computed(() => syncStore.userInfo)
const syncSummary = computed(() => syncStore.syncSummary)
const isSyncing = computed(() => syncStore.isSyncing)
const canUpload = computed(() => syncStore.canUpload && password.value === confirmPassword.value && password.value.length >= 8)
const canDownload = computed(() => syncStore.canDownload && password.value === confirmPassword.value && password.value.length >= 8)

// 密码匹配状态
const passwordMatch = computed(() => {
  if (!password.value || !confirmPassword.value) return null
  return password.value === confirmPassword.value
})

// 监听 open 变化
watch(() => props.open, (val) => {
  if (val) {
    syncStore.loadConfig()
    tokenInput.value = token.value
  }
})

// 状态文本
function getStatusText(): string {
  const statusMap: Record<string, string> = {
    'encrypting': '正在加密数据...',
    'uploading': '正在上传到 Gist...',
    'downloading': '正在从 Gist 下载...',
    'decrypting': '正在解密数据...',
    'merging': '正在合并数据...'
  }
  return statusMap[syncStatus.value] || '处理中...'
}

// 验证 Token
async function handleValidateToken() {
  if (!tokenInput.value) {
    alert('请输入 GitHub Token')
    return
  }

  validating.value = true
  try {
    syncStore.setToken(tokenInput.value)
    const valid = await syncStore.validateToken()
    if (valid) {
      alert('Token 验证成功')
    } else {
      alert('Token 验证失败，请检查是否正确')
      userInfo.value = null
    }
  } catch (error) {
    alert('验证失败: ' + (error instanceof Error ? error.message : '未知错误'))
    userInfo.value = null
  } finally {
    validating.value = false
  }
}

// 上传到 Gist
async function handleUpload() {
  if (!password.value || password.value.length < 8) {
    alert('请输入至少8位密码')
    return
  }

  if (password.value !== confirmPassword.value) {
    alert('两次输入的密码不一致')
    return
  }

  try {
    await syncStore.uploadToGist(password.value)
    alert('上传成功！')
    emit('synced')
  } catch (error) {
    alert('上传失败: ' + (error instanceof Error ? error.message : '未知错误'))
  }
}

// 从 Gist 下载
async function handleDownload() {
  if (!password.value || password.value.length < 8) {
    alert('请输入至少8位密码')
    return
  }

  if (password.value !== confirmPassword.value) {
    alert('两次输入的密码不一致')
    return
  }

  try {
    await syncStore.downloadFromGist(password.value)
    alert('下载成功！已合并数据')
    emit('synced')
  } catch (error) {
    alert('下载失败: ' + (error instanceof Error ? error.message : '未知错误'))
  }
}

// 手动设置 Gist ID
function setManualGistId() {
  if (manualGistId.value) {
    syncStore.setGistId(manualGistId.value)
    alert('Gist ID 已设置，现在可以进行下载了')
  }
}

// 关闭
function handleClose() {
  password.value = ''
  confirmPassword.value = ''
  manualGistId.value = ''
  syncStore.resetStatus()
  emit('close')
}

function getLastSyncText() {
  return syncStore.getLastSyncText()
}
</script>
