<script setup lang="ts">
  import FlyoutMenu from './FlyoutMenu.vue'

  const emit = defineEmits([
    'delete',
    'edit'
  ])
</script>

<template>
  <FlyoutMenu>
    <ul class="py-1 text-sm text-gray-700">
      <li>
        <button
          class="w-full px-4 py-2 text-left cursor-pointer hover:bg-gray-100"
          @click="emit('edit')">
          Edit
        </button>
      </li>
      <li>
        <button
          class="w-full px-4 py-2 text-left cursor-pointer hover:bg-gray-100"
          @click="emit('delete')">
          Delete
        </button>
      </li>
    </ul>
  </FlyoutMenu>
</template>