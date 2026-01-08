<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="modal-backdrop" @click="handleClose">
        <Transition name="scale">
          <div v-if="isOpen" class="modal-content" @click.stop>
            <div class="modal-header">
              <h2>标签管理</h2>
              <button @click="handleClose" class="close-btn">
                <i class="mdi mdi-close"></i>
              </button>
            </div>

            <div class="modal-body">
              <!-- Tag Items -->
              <div class="items-container">
                <!-- Add New Item -->
                <div class="item add-item" :class="{ 'is-editing': editingId === 'new' }">
                  <!-- Add Button -->
                  <template v-if="editingId !== 'new'">
                    <button @click="startAdd" class="add-trigger">
                      <i class="mdi mdi-plus"></i>
                      <span>添加标签</span>
                    </button>
                  </template>

                  <!-- Add Mode -->
                  <template v-else>
                    <div class="edit-row">
                      <span class="hash-prefix">#</span>
                      <input
                        v-model="editForm.name"
                        type="text"
                        class="edit-input"
                        placeholder="输入标签名称"
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
                  </template>
                </div>

                <!-- Existing Tags -->
                <div
                  v-for="tag in tags"
                  :key="tag.id"
                  class="item"
                  :class="{ 'is-editing': editingId === tag.id }"
                >
                  <!-- Display Mode -->
                  <template v-if="editingId !== tag.id">
                    <div class="item-content">
                      <span class="item-name">#{{ tag.name }}</span>
                    </div>
                    <div class="item-actions">
                      <button @click="startEdit(tag)" class="action-btn edit">
                        <i class="mdi mdi-pencil-outline"></i>
                      </button>
                      <button @click="handleDelete(tag)" class="action-btn delete">
                        <i class="mdi mdi-delete-outline"></i>
                      </button>
                    </div>
                  </template>

                  <!-- Edit Mode -->
                  <template v-else>
                    <div class="edit-row">
                      <span class="hash-prefix">#</span>
                      <input
                        v-model="editForm.name"
                        type="text"
                        class="edit-input"
                        placeholder="标签名称"
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
import { useTags } from '@/composables/useTags'
import type { Tag } from '@/types'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { tags, loadTags, addTag, updateTag, deleteTag } = useTags()

const editingId = ref<number | 'new' | null>(null)
const editInputRef = ref<HTMLInputElement | null>(null)
const addInputRef = ref<HTMLInputElement | null>(null)

const editForm = reactive({
  name: ''
})

onMounted(() => {
  loadTags()
})

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    loadTags()
  } else {
    cancelEdit()
  }
})

const startAdd = () => {
  editingId.value = 'new'
  editForm.name = ''
  nextTick(() => {
    addInputRef.value?.focus()
  })
}

const startEdit = (tag: Tag) => {
  editingId.value = tag.id!
  editForm.name = tag.name
  nextTick(() => {
    // editInputRef is an array when used in v-for
    const input = Array.isArray(editInputRef.value) ? editInputRef.value[0] : editInputRef.value
    input?.focus()
  })
}

const cancelEdit = () => {
  editingId.value = null
  editForm.name = ''
}

const handleSave = async () => {
  if (!editForm.name.trim()) return

  try {
    if (editingId.value === 'new') {
      await addTag({
        name: editForm.name.trim(),
        count: 0
      })
    } else if (editingId.value) {
      const tag = tags.value.find(t => t.id === editingId.value)
      await updateTag(editingId.value, {
        name: editForm.name.trim(),
        count: tag?.count || 0
      })
    }
    cancelEdit()
  } catch (error) {
    console.error('Failed to save tag:', error)
    alert('保存失败')
  }
}

const handleDelete = async (tag: Tag) => {
  if (!confirm(`确定要删除"${tag.name}"吗？`)) return

  try {
    await deleteTag(tag.id!)
  } catch (error) {
    console.error('Failed to delete tag:', error)
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
  max-width: 400px;
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
  flex: 1;
}

.item-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--accent);
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

.hash-prefix {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--accent);
  padding-left: 4px;
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

@media (max-width: 640px) {
  .item-actions {
    opacity: 1;
  }
}
</style>
