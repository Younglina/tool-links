<template>
  <header class="header">
    <div class="header-content">
      <div class="header-left">
        <button
          @click="toggleSidebar"
          class="menu-btn lg:hidden"
        >
          <i class="mdi mdi-menu text-xl"></i>
        </button>
        <div class="logo">
          <div class="logo-icon">
            <i class="mdi mdi-robot-love-outline text-xl"></i>
          </div>
          <span class="logo-text">工具集</span>
        </div>
      </div>

      <div class="header-center">
        <SearchBar />
      </div>

      <div class="header-right">
        <div class="action-dropdown" ref="dropdownRef">
          <button @click="toggleDropdown" class="action-btn">
            <i class="mdi mdi-plus"></i>
            <span class="btn-text">添加</span>
            <i class="mdi mdi-chevron-down chevron" :class="{ 'rotate': showDropdown }"></i>
          </button>
          <Transition name="dropdown">
            <div v-if="showDropdown" class="dropdown-menu">
              <button @click="handleAction('website')" class="dropdown-item">
                <i class="mdi mdi-web"></i>
                <span>添加网站</span>
              </button>
              <button @click="handleAction('category')" class="dropdown-item">
                <i class="mdi mdi-folder-outline"></i>
                <span>分类管理</span>
              </button>
              <button @click="handleAction('tag')" class="dropdown-item">
                <i class="mdi mdi-tag-outline"></i>
                <span>标签管理</span>
              </button>
              <div class="dropdown-divider"></div>
              <button @click="handleAction('export')" class="dropdown-item">
                <i class="mdi mdi-export"></i>
                <span>导出数据</span>
              </button>
              <label class="dropdown-item">
                <i class="mdi mdi-import"></i>
                <span>导入数据</span>
                <input type="file" accept=".json" @change="handleImportClick" @click.stop hidden />
              </label>
            </div>
          </Transition>
        </div>

        <Teleport to="body">
          <div v-if="showImportDialog" class="modal-overlay" @click="showImportDialog = false">
            <div class="modal-content" @click.stop>
              <h3 class="modal-title">导入数据</h3>
              <p class="modal-desc">请选择导入方式：</p>
              <div class="modal-actions">
                <button @click="handleImportConfirm('merge')" class="modal-btn primary">
                  <i class="mdi mdi-merge"></i>
                  合并（跳过重复）
                </button>
                <button @click="handleImportConfirm('replace')" class="modal-btn danger">
                  <i class="mdi mdi-replace"></i>
                  替换（清空现有数据）
                </button>
              </div>
              <button @click="showImportDialog = false" class="modal-close">
                <i class="mdi mdi-close"></i>
              </button>
            </div>
          </div>
        </Teleport>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import SearchBar from '@/components/filter/SearchBar.vue'
import { exportData, importData } from '@/composables/useImportExport'

const emit = defineEmits<{
  (e: 'toggle-sidebar'): void
  (e: 'action', type: 'website' | 'category' | 'tag' | 'export' | 'import'): void
}>()

const showDropdown = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const importing = ref(false)
const exporting = ref(false)
const showImportDialog = ref(false)
let pendingImportFile: File | null = null

const toggleSidebar = () => {
  emit('toggle-sidebar')
}

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const handleAction = (type: 'website' | 'category' | 'tag' | 'export' | 'import') => {
  if (type === 'export') {
    handleExport()
  } else {
    showDropdown.value = false
    emit('action', type)
  }
}

const handleExport = async () => {
  showDropdown.value = false
  exporting.value = true
  try {
    await exportData()
  } catch (error) {
    console.error('Failed to export:', error)
    alert('导出失败')
  } finally {
    exporting.value = false
  }
}

const handleImportClick = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  showDropdown.value = false
  pendingImportFile = file
  showImportDialog.value = true
  input.value = ''
}

const handleImportConfirm = async (mode: 'merge' | 'replace') => {
  if (!pendingImportFile) return

  showImportDialog.value = false
  importing.value = true

  try {
    const result = await importData(pendingImportFile, mode)
    const modeText = mode === 'merge' ? '合并' : '替换'
    alert(`${modeText}成功！\n新增网站: ${result.websites}\n分类: ${result.categories}\n标签: ${result.tags}`)
  } catch (error) {
    console.error('Failed to import:', error)
    alert('导入失败')
  } finally {
    importing.value = false
    pendingImportFile = null
  }
}

const handleClickOutside = (e: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.header {
  background: var(--bg-primary);
  position: sticky;
  top: 0;
  z-index: 100;
}

/* Neumorphism header styles */
.neumorphism-theme .header {
  box-shadow: 0 4px 10px rgb(163,177,198,0.4), 0 -2px 6px rgba(255,255,255,0.6);
}

.header-content {
  padding: 0 2rem;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
  min-width: 200px;
}

.menu-btn {
  padding: 10px;
  background: var(--bg-primary);
  color: var(--text-secondary);
  border-radius: 12px;
  transition: all 0.3s ease-out;
}

/* Neumorphism menu button */
.neumorphism-theme .menu-btn {
  box-shadow: var(--shadow-extruded-small);
}

.neumorphism-theme .menu-btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-extruded);
}

.neumorphism-theme .menu-btn:active {
  transform: translateY(0.5px);
  box-shadow: var(--shadow-inset-small);
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  color: var(--accent);
  background: var(--bg-primary);
}

/* Neumorphism logo icon well */
.neumorphism-theme .logo-icon {
  box-shadow: var(--shadow-inset);
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.header-center {
  flex: 1;
  max-width: 560px;
  margin-left: auto;
}

.header-right {
  flex-shrink: 0;
}

/* Action Dropdown */
.action-dropdown {
  position: relative;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--accent);
  color: #ffffff;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9375rem;
  transition: all 0.3s ease-out;
}

.neumorphism-theme .action-btn {
  box-shadow: 5px 5px 10px rgb(163,177,198,0.6), -5px -5px 10px rgba(255,255,255,0.5);
}

.action-btn:hover {
  background: var(--accent-light);
}

.neumorphism-theme .action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 8px 8px 16px rgb(163,177,198,0.7), -8px -8px 16px rgba(255,255,255,0.6);
}

.action-btn .mdi {
  font-size: 1.125rem;
}

.action-btn .chevron {
  font-size: 1rem;
  transition: transform 0.2s ease;
}

.action-btn .chevron.rotate {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 160px;
  background: var(--bg-primary);
  border-radius: 12px;
  overflow: hidden;
  z-index: 200;
}

.neumorphism-theme .dropdown-menu {
  box-shadow: var(--shadow-extruded);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 16px;
  color: var(--text-primary);
  font-size: 0.9375rem;
  font-weight: 500;
  transition: all 0.2s ease;
  text-align: left;
}

.dropdown-item:hover {
  background: var(--bg-secondary);
  color: var(--accent);
}

.dropdown-item .mdi {
  font-size: 1.125rem;
  color: var(--text-secondary);
}

.dropdown-item:hover .mdi {
  color: var(--accent);
}

.dropdown-item input {
  display: none;
}

.dropdown-divider {
  height: 1px;
  background: var(--bg-secondary);
  margin: 4px 0;
}

/* Dropdown transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 1024px) {
  .header-content {
    height: 60px;
    padding: 0 1.5rem;
    flex-wrap: wrap;
  }

  .header-left {
    min-width: auto;
  }

  .header-right {
    margin-left: auto;
  }

  .header-center {
    width: 100%;
    max-width: none;
    margin-top: 0;
  }

  .btn-text {
    display: none;
  }

  .action-btn {
    padding: 10px 12px;
  }

  .action-btn .chevron {
    display: none;
  }
}

@media (max-width: 640px) {
  .header-content {
    padding: 0 1rem;
    height: 56px;
  }

  .logo-text {
    font-size: 1.125rem;
  }

  .logo-icon {
    width: 36px;
    height: 36px;
  }

  .logo-icon .mdi {
    font-size: 1.25rem;
  }

  .dropdown-menu {
    right: 0;
    left: auto;
  }
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 24px;
  position: relative;
  min-width: 300px;
}

.neumorphism-theme .modal-content {
  box-shadow: var(--shadow-extruded);
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.modal-desc {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0 0 20px 0;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.modal-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.modal-btn.primary {
  background: var(--accent);
  color: white;
}

.modal-btn.danger {
  background: #ff3b30;
  color: white;
}

.modal-btn:hover {
  transform: translateY(-1px);
  filter: brightness(1.1);
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.modal-close:hover {
  color: var(--text-primary);
}
</style>
