<script setup lang="ts">
import {
  computed,
  defineEmits,
  defineProps
} from 'vue'

const { variant } = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator(value: string) {
      return ['primary', 'secondary'].includes(value)
    }
  }
})

const emit = defineEmits([
  'click'
])

const buttonClasses = computed (() => {
  const baseClasses = 'rounded-3xl py-1 px-4 cursor-pointer'
  const primaryClasses = 'bg-violet-700 text-white hover:bg-violet-800 focus:outline-none focus:ring-2 focus:ring-violet-300'
  const secondaryClasses = 'border-2 border-violet-700 text-violet-700 hover:border-violet-800 text-violet-800 focus:outline-none focus:ring-2 focus:ring-violet-300'
  
  return variant === 'primary'
    ? `${baseClasses} ${primaryClasses}`
    : `${baseClasses} ${secondaryClasses}`
})
</script>

<template>
  <button
    :class="buttonClasses"
    type="button"
    @click="emit('click')">
    <slot />
  </button>
</template>