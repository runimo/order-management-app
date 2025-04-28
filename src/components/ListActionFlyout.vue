<script setup lang="ts">
import FlyoutMenu from './FlyoutMenu.vue'

const {} = defineProps({
  editButtonTitle: {
    type: String || null,
    default: null,
  },
  isEditDisabled: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['delete', 'edit'])
</script>

<template>
  <FlyoutMenu>
    <ul class="py-1 text-sm">
      <li>
        <button
          class="w-full px-4 py-2 text-left"
          :class="
            isEditDisabled
              ? 'cursor-default text-gray-400'
              : 'cursor-pointer hover:bg-gray-100 text-gray-700'
          "
          :disabled="isEditDisabled"
          :title="editButtonTitle"
          type="button"
          @click="emit('edit')"
        >
          Edit
        </button>
      </li>
      <li>
        <button
          class="w-full px-4 py-2 text-left cursor-pointer hover:bg-gray-100"
          type="button"
          @click="emit('delete')"
        >
          Delete
        </button>
      </li>
    </ul>
  </FlyoutMenu>
</template>
