<script setup lang="ts">
defineProps({
  withTrigger: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <div class="text-left">
    <!-- Requires relative class on parent container -->
    <div
      class="absolute right-0 top-[30px] z-10 w-28 origin-top-right rounded-xs bg-white shadow-lg ring-1 ring-gray-100 focus:outline-none"
    >
      <slot />
    </div>
  </div>
</template>
