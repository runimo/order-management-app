<script setup lang="ts">
  import { computed } from 'vue'

  const { status } = defineProps<{
    status: 'pending' | 'processing' | 'shipped' | 'delivered'
  }>()

  const badgeClasses = computed(() => {
    const baseClasses = 'inline-block px-3 pb-1 rounded-full text-sm font-medium border'

    const colors: Record<typeof status, string> = {
      pending: 'text-yellow-600 border-yellow-600 bg-yellow-50',
      processing: 'text-blue-600 border-blue-600 bg-blue-50',
      shipped: 'text-purple-600 border-purple-600 bg-purple-50',
      delivered: 'text-green-600 border-green-600 bg-green-50',
    }

    return `${baseClasses} ${colors[status]}`
  })
</script>

<template>
  <span :class="badgeClasses">
    {{ status }}
  </span>
</template>
