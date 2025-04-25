<script setup lang="ts">
import {
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
    default: ''
  },
  options: {
    type: Array,
    default: () => []
  }
})
</script>

<template>
  <div class="w-full">
    <label
      class="font-semibold cursor-pointer block"
      :for="id">
      {{ label }}
    </label>
    <select
      class="border border-gray-300 rounded-xs w-full h-[36px] cursor-pointer"
      :id="id"
      v-model="model">
      <option
        disabled
        value="">
        Please select
      </option>
      <option
        v-for="option in options"
        :key="option.id"
        :value="option.id">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>