<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="modal-backdrop" @click="handleClose">
        <Transition name="scale">
          <div v-if="isOpen" class="modal-content" @click.stop>
            <div class="modal-header">
              <h2>分类管理</h2>
              <button @click="handleClose" class="close-btn">
                <i class="mdi mdi-close"></i>
              </button>
            </div>

            <div class="modal-body">
              <!-- Category Items -->
              <div class="items-container">
                <!-- Add New Item -->
                <div class="item add-item" :class="{ 'is-editing': editingId === 'new' }">
                  <!-- Add Button -->
                  <template v-if="editingId !== 'new'">
                    <button @click="startAdd" class="add-trigger">
                      <i class="mdi mdi-plus"></i>
                      <span>添加分类</span>
                    </button>
                  </template>

                  <!-- Add Mode -->
                  <template v-else>
                    <div class="edit-row">
                      <div class="icon-picker-trigger" @click="toggleIconPicker">
                        <i :class="['mdi', `mdi-${editForm.iconName}`]"></i>
                        <i class="mdi mdi-chevron-down picker-arrow"></i>
                      </div>
                      <input
                        v-model="editForm.name"
                        type="text"
                        class="edit-input"
                        placeholder="输入分类名称"
                        @keyup.enter="handleSave"
                        @keyup.escape="cancelEdit"
                        ref="addInputRef"
                      />
                      <button @click="handleSave" class="action-btn confirm" :disabled="!editForm.name.trim()">
                        <i class="mdi mdi-check"></i>
                      </button>
                      <button @click="cancelEdit" class="action-btn cancel">
                        <i class="mdi mdi-close"></i>
                      </button>
                    </div>
                    <!-- Icon Picker Dropdown -->
                    <Transition name="dropdown">
                      <div v-if="showIconPicker" class="icon-picker">
                        <div
                          v-for="icon in availableIcons"
                          :key="icon"
                          @click="selectIcon(icon)"
                          :class="['icon-option', editForm.iconName === icon ? 'selected' : '']"
                        >
                          <i :class="['mdi', `mdi-${icon}`]"></i>
                        </div>
                      </div>
                    </Transition>
                  </template>
                </div>

                <!-- Existing Categories -->
                <div
                  v-for="category in categories"
                  :key="category.id"
                  class="item"
                  :class="{ 'is-editing': editingId === category.id }"
                >
                  <!-- Display Mode -->
                  <template v-if="editingId !== category.id">
                    <div class="item-content">
                      <div class="item-icon">
                        <i :class="['mdi', `mdi-${category.iconName}`]"></i>
                      </div>
                      <span class="item-name">{{ category.name }}</span>
                    </div>
                    <div class="item-actions">
                      <button @click="startEdit(category)" class="action-btn edit">
                        <i class="mdi mdi-pencil-outline"></i>
                      </button>
                      <button @click="handleDelete(category)" class="action-btn delete">
                        <i class="mdi mdi-delete-outline"></i>
                      </button>
                    </div>
                  </template>

                  <!-- Edit Mode -->
                  <template v-else>
                    <div class="edit-row">
                      <div class="icon-picker-trigger" @click="toggleIconPicker">
                        <i :class="['mdi', `mdi-${editForm.iconName}`]"></i>
                        <i class="mdi mdi-chevron-down picker-arrow"></i>
                      </div>
                      <input
                        v-model="editForm.name"
                        type="text"
                        class="edit-input"
                        placeholder="分类名称"
                        @keyup.enter="handleSave"
                        @keyup.escape="cancelEdit"
                        ref="editInputRef"
                      />
                      <button @click="handleSave" class="action-btn confirm">
                        <i class="mdi mdi-check"></i>
                      </button>
                      <button @click="cancelEdit" class="action-btn cancel">
                        <i class="mdi mdi-close"></i>
                      </button>
                    </div>
                    <!-- Icon Picker Dropdown -->
                    <Transition name="dropdown">
                      <div v-if="showIconPicker" class="icon-picker">
                        <div
                          v-for="icon in availableIcons"
                          :key="icon"
                          @click="selectIcon(icon)"
                          :class="['icon-option', editForm.iconName === icon ? 'selected' : '']"
                        >
                          <i :class="['mdi', `mdi-${icon}`]"></i>
                        </div>
                      </div>
                    </Transition>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, nextTick } from 'vue'
import { useCategories } from '@/composables/useCategories'
import type { Category } from '@/types'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { categories, loadCategories, addCategory, updateCategory, deleteCategory } = useCategories()

const editingId = ref<number | 'new' | null>(null)
const showIconPicker = ref(false)
const editInputRef = ref<HTMLInputElement | null>(null)
const addInputRef = ref<HTMLInputElement | null>(null)

const editForm = reactive({
  name: '',
  iconName: 'folder'
})

const availableIcons = [
  // AI & Tech
  'robot', 'robot-outline', 'brain', 'head-snowflake', 'memory', 'chip',
  'creation', 'creation-outline', 'auto-fix', 'lightning-bolt', 'atom', 'atom-variant',
  'raspberry-pi', 'cpu-32-bit', 'cpu-64-bit', 'expansion-card',
  // Media & Image
  'image', 'image-outline', 'image-multiple', 'image-edit', 'camera', 'camera-outline',
  'video', 'video-outline', 'movie', 'movie-open', 'movie-outline', 'filmstrip',
  'music', 'music-note', 'microphone', 'microphone-outline', 'headphones', 'speaker',
  // Development
  'code-tags', 'code-braces', 'code-brackets', 'code-json', 'xml', 'script',
  'language-javascript', 'language-typescript', 'language-python', 'language-java',
  'language-html5', 'language-css3', 'language-go', 'language-rust',
  'git', 'github', 'gitlab', 'source-branch', 'source-merge',
  'api', 'webhook', 'console', 'console-line', 'terminal', 'powershell',
  'bug', 'bug-outline', 'test-tube', 'flask', 'flask-outline',
  // Data & Analytics
  'chart-line', 'chart-bar', 'chart-pie', 'chart-donut', 'chart-areaspline',
  'chart-timeline', 'chart-scatter-plot', 'poll', 'finance', 'trending-up',
  'database', 'database-outline', 'table', 'view-list', 'clipboard-list',
  'calculator', 'calculator-variant', 'sigma', 'function', 'matrix',
  // Design & Creative
  'palette', 'palette-outline', 'brush', 'brush-outline', 'pencil', 'pencil-outline',
  'format-paint', 'draw', 'drawing', 'drawing-box', 'vector-square',
  'shape', 'shape-outline', 'layers', 'layers-outline', 'puzzle', 'puzzle-outline',
  'lightbulb', 'lightbulb-outline', 'lightbulb-on', 'lightbulb-on-outline',
  // Documents & Text
  'file-document', 'file-document-outline', 'file-pdf-box', 'file-word', 'file-excel',
  'notebook', 'notebook-outline', 'note-text', 'note-text-outline', 'text-box',
  'format-text', 'format-quote-close', 'translate', 'alphabetical', 'spellcheck',
  'clipboard-text', 'clipboard-text-outline', 'content-copy', 'content-paste',
  // Web & Cloud
  'web', 'earth', 'google-chrome', 'firefox', 'microsoft-edge',
  'cloud', 'cloud-outline', 'cloud-download', 'cloud-upload', 'cloud-sync',
  'server', 'server-network', 'dns', 'wifi', 'access-point',
  'lan', 'lan-connect', 'router-wireless', 'ethernet', 'ip-network',
  // Organization
  'folder', 'folder-outline', 'folder-open', 'folder-multiple', 'folder-star',
  'bookmark', 'bookmark-outline', 'bookshelf', 'tag', 'tag-outline',
  'label', 'label-outline', 'archive', 'package', 'package-variant',
  'inbox', 'inbox-full', 'tray-full', 'briefcase', 'briefcase-outline',
  // Communication
  'email', 'email-outline', 'gmail', 'chat', 'chat-outline',
  'forum', 'forum-outline', 'message', 'message-outline', 'comment-text',
  'phone', 'phone-outline', 'cellphone', 'send', 'share',
  'share-variant', 'rss', 'broadcast', 'antenna', 'bell',
  // Tools & Settings
  'cog', 'cog-outline', 'cogs', 'wrench', 'wrench-outline',
  'hammer', 'hammer-wrench', 'tools', 'toolbox', 'toolbox-outline',
  'tune', 'tune-vertical', 'screwdriver', 'application-cog', 'account-cog',
  // Education & Learning
  'school', 'school-outline', 'book', 'book-open', 'book-open-outline',
  'book-multiple', 'library', 'certificate', 'certificate-outline', 'diploma',
  'graduation-cap', 'human-male-board', 'teach', 'trophy', 'trophy-outline',
  'medal', 'medal-outline', 'counter', 'abacus', 'brain',
  // Favorites & Ratings
  'star', 'star-outline', 'star-circle', 'heart', 'heart-outline',
  'thumb-up', 'thumb-up-outline', 'thumb-down', 'fire', 'flash',
  'flash-outline', 'diamond', 'diamond-outline', 'crown', 'crown-outline',
  'flag', 'flag-outline', 'pin', 'pin-outline', 'target',
  // Security & Privacy
  'shield', 'shield-outline', 'shield-check', 'shield-lock', 'lock',
  'lock-outline', 'lock-open', 'key', 'key-outline', 'key-variant',
  'fingerprint', 'eye', 'eye-outline', 'eye-off', 'incognito',
  'security', 'passport', 'id-card', 'account-key', 'two-factor-authentication',
  // Shopping & Business
  'cart', 'cart-outline', 'store', 'storefront', 'shopping',
  'cash', 'cash-multiple', 'credit-card', 'credit-card-outline', 'wallet',
  'wallet-outline', 'gift', 'gift-outline', 'sale', 'percent',
  'currency-usd', 'currency-eur', 'currency-cny', 'bitcoin', 'ethereum',
  // Health & Lifestyle
  'hospital-box', 'medical-bag', 'pill', 'needle', 'stethoscope',
  'food', 'food-apple', 'coffee', 'coffee-outline', 'glass-mug-variant',
  'silverware-fork-knife', 'run', 'walk', 'bike', 'yoga',
  'meditation', 'spa', 'flower', 'leaf', 'tree',
  // Entertainment & Games
  'gamepad-variant', 'controller-classic', 'puzzle', 'dice-multiple', 'cards',
  'chess-knight', 'poker-chip', 'slot-machine', 'party-popper', 'balloon',
  'emoticon', 'emoticon-happy', 'emoticon-cool', 'drama-masks', 'theater',
  // Travel & Places
  'airplane', 'car', 'bus', 'train', 'subway',
  'ferry', 'earth', 'map', 'map-marker', 'compass',
  'home', 'home-outline', 'office-building', 'city', 'beach',
  // Misc
  'apps', 'view-grid', 'view-dashboard', 'dots-grid', 'infinity',
  'link', 'link-variant', 'attachment', 'paperclip', 'magnet',
  'download', 'upload', 'sync', 'refresh', 'cached',
  'timer', 'clock', 'clock-outline', 'calendar', 'calendar-outline',
  'alarm', 'bell-outline', 'bullhorn', 'information', 'help-circle'
]

onMounted(() => {
  loadCategories()
})

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    loadCategories()
  } else {
    cancelEdit()
  }
})

const startAdd = () => {
  editingId.value = 'new'
  editForm.name = ''
  editForm.iconName = 'folder'
  showIconPicker.value = false
  nextTick(() => {
    addInputRef.value?.focus()
  })
}

const startEdit = (category: Category) => {
  editingId.value = category.id!
  editForm.name = category.name
  editForm.iconName = category.iconName
  showIconPicker.value = false
  nextTick(() => {
    // editInputRef is an array when used in v-for
    const input = Array.isArray(editInputRef.value) ? editInputRef.value[0] : editInputRef.value
    input?.focus()
  })
}

const cancelEdit = () => {
  editingId.value = null
  editForm.name = ''
  editForm.iconName = 'folder'
  showIconPicker.value = false
}

const toggleIconPicker = () => {
  showIconPicker.value = !showIconPicker.value
}

const selectIcon = (icon: string) => {
  editForm.iconName = icon
  showIconPicker.value = false
}

const handleSave = async () => {
  if (!editForm.name.trim()) return

  try {
    if (editingId.value === 'new') {
      await addCategory({
        name: editForm.name.trim(),
        iconName: editForm.iconName
      })
    } else if (editingId.value) {
      await updateCategory(editingId.value, {
        name: editForm.name.trim(),
        iconName: editForm.iconName
      })
    }
    cancelEdit()
  } catch (error) {
    console.error('Failed to save category:', error)
    alert('保存失败')
  }
}

const handleDelete = async (category: Category) => {
  if (!confirm(`确定要删除"${category.name}"吗？`)) return

  try {
    await deleteCategory(category.id!)
  } catch (error) {
    console.error('Failed to delete category:', error)
    alert('删除失败')
  }
}

const handleClose = () => {
  cancelEdit()
  emit('close')
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: var(--bg-primary);
  border-radius: 20px;
  width: 100%;
  max-width: 420px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.neumorphism-theme .modal-content {
  box-shadow: var(--shadow-extruded);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(163,177,198,0.15);
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.close-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  color: var(--text-secondary);
  border-radius: 10px;
  transition: all 0.2s ease;
}

.neumorphism-theme .close-btn {
  box-shadow: var(--shadow-extruded-small);
}

.close-btn:hover {
  color: var(--text-primary);
}

.close-btn .mdi {
  font-size: 1.125rem;
}

.modal-body {
  padding: 16px 24px 24px;
  overflow-y: auto;
  flex: 1;
}

/* Items Container */
.items-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item {
  padding: 12px 16px;
  background: var(--bg-primary);
  border-radius: 14px;
  transition: all 0.2s ease;
  position: relative;
}

.neumorphism-theme .item {
  box-shadow: var(--shadow-extruded-small);
}

.item:hover:not(.is-editing) {
  transform: translateY(-1px);
}

.neumorphism-theme .item:hover:not(.is-editing) {
  box-shadow: var(--shadow-extruded);
}

.item.is-editing {
  padding: 12px;
}

.neumorphism-theme .item.is-editing {
  box-shadow: var(--shadow-inset);
}

/* Display Mode */
.item-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.item-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  border-radius: 10px;
  color: var(--accent);
  flex-shrink: 0;
}

.neumorphism-theme .item-icon {
  box-shadow: var(--shadow-inset-small);
}

.item-icon .mdi {
  font-size: 1.25rem;
}

.item-name {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-primary);
  flex: 1;
}

/* Item Actions */
.item-actions {
  display: flex;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.2s ease;
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
}

.item:hover .item-actions {
  opacity: 1;
}

.action-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  color: var(--text-secondary);
  border-radius: 8px;
  transition: all 0.15s ease;
}

.neumorphism-theme .action-btn {
  box-shadow: var(--shadow-extruded-small);
}

.action-btn:hover {
  color: var(--accent);
}

.action-btn.edit:hover {
  color: var(--accent);
}

.action-btn.delete:hover {
  color: #ff3b30;
}

.action-btn.confirm {
  background: var(--accent);
  color: #ffffff;
}

.action-btn.confirm:hover {
  background: var(--accent-light);
}

.action-btn.confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.cancel:hover {
  color: #ff3b30;
}

.action-btn .mdi {
  font-size: 1rem;
}

/* Edit Mode */
.edit-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-picker-trigger {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  border-radius: 10px;
  cursor: pointer;
  color: var(--accent);
  flex-shrink: 0;
  position: relative;
}

.neumorphism-theme .icon-picker-trigger {
  box-shadow: var(--shadow-extruded-small);
}

.icon-picker-trigger:hover {
  transform: translateY(-1px);
}

.icon-picker-trigger .mdi:first-child {
  font-size: 1.375rem;
}

.picker-arrow {
  position: absolute;
  bottom: 2px;
  right: 2px;
  font-size: 0.75rem !important;
  color: var(--text-secondary);
}

.edit-input {
  flex: 1;
  padding: 10px 14px;
  background: var(--bg-secondary);
  border: 2px solid transparent;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-primary);
  min-width: 0;
  transition: all 0.2s ease;
}

.neumorphism-theme .edit-input {
  background: var(--bg-primary);
  box-shadow: var(--shadow-inset-small);
}

.edit-input:focus {
  outline: none;
  border-color: var(--accent);
  background: var(--bg-primary);
}

.neumorphism-theme .edit-input:focus {
  box-shadow: var(--shadow-inset-small), 0 0 0 2px rgba(var(--accent-rgb, 99, 102, 241), 0.15);
}

.edit-input::placeholder {
  color: var(--text-secondary);
  font-weight: 400;
}

/* Icon Picker */
.icon-picker {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 6px;
  margin-top: 12px;
  padding: 12px;
  background: var(--bg-primary);
  border-radius: 12px;
  max-height: 240px;
  overflow-y: auto;
}

@media (max-width: 640px) {
  .icon-picker {
    grid-template-columns: repeat(7, 1fr);
  }
}

.neumorphism-theme .icon-picker {
  box-shadow: var(--shadow-inset);
}

.icon-option {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  color: var(--text-secondary);
}

.neumorphism-theme .icon-option {
  box-shadow: var(--shadow-extruded-small);
}

.icon-option:hover {
  color: var(--accent);
  transform: scale(1.1);
}

.icon-option.selected {
  background: var(--accent);
  color: #ffffff;
}

.neumorphism-theme .icon-option.selected {
  box-shadow: inset 2px 2px 4px rgba(0,0,0,0.2);
}

.icon-option .mdi {
  font-size: 1.1rem;
}

/* Add Item */
.add-item {
  background: transparent;
  border: 2px dashed rgba(163,177,198,0.3);
}

.neumorphism-theme .add-item {
  box-shadow: none;
}

.add-item.is-editing {
  background: var(--bg-primary);
  border: none;
}

.neumorphism-theme .add-item.is-editing {
  box-shadow: var(--shadow-inset);
}

.add-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 4px 0;
  color: var(--text-secondary);
  font-size: 0.9375rem;
  font-weight: 500;
  transition: color 0.2s ease;
}

.add-trigger:hover {
  color: var(--accent);
}

.add-trigger .mdi {
  font-size: 1.25rem;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.25s cubic-bezier(0.32, 0.72, 0, 1);
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 640px) {
  .item-actions {
    opacity: 1;
  }
}
</style>
