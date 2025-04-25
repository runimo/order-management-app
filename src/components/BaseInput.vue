<script setup lang="ts">
import {
  defineEmits,
  defineModel,
  defineProps
} from 'vue'

const model = defineModel()

defineProps({
  id: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  }
})

defineEmits([
  'update:model-value'
])
</script>

<template>
  <div class="w-full">
    <label
      :for="id"
      class="font-semibold cursor-pointer">
      {{ label }}
    </label>
    <input
      class="w-full border border-gray-300 rounded-xs pl-2 h-[36px]"
      :id="id"
      type="text"
      v-model="model" />
  </div>
</template>