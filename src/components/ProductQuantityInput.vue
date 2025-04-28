<script setup lang="ts">
import { computed } from 'vue'
import { useOrdersStore } from '@/stores/orders'
import { storeToRefs } from 'pinia'

const ordersStore = useOrdersStore()
const { orderBeingCreated, orderBeingEdited } = storeToRefs(ordersStore)

const { orderType, productId } = defineProps({
  orderType: {
    type: String,
    required: true,
  },
  productId: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['decrease', 'increase'])

const quantity = computed(() => {
  let order
  switch (orderType) {
    case 'orderBeingCreated':
      order = orderBeingCreated.value
      break
    case 'orderBeingEdited':
      order = orderBeingEdited.value
      break
    default:
      console.warn(`Unknown orderType: ${orderType}`)
  }

  return order?.products?.find((product) => product.id === productId)?.count || 0
})

const handleInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  const value = Number(input.value)
  if (value > quantity.value) {
    emit('increase')
  } else if (value < quantity.value) {
    emit('decrease')
  }
}
</script>

<template>
  <div class="flex justify-center">
    <button
      @click="emit('decrease')"
      class="w-[24px] px-2 py-1 bg-gray-200 rounded"
      :class="quantity === 0 ? 'cursor-default' : 'cursor-pointer'"
      :disabled="quantity === 0"
    >
      -
    </button>
    <input
      type="number"
      min="0"
      step="1"
      class="w-[40px] text-center mx-2"
      :value="quantity"
      @input="(event: Event) => handleInput(event)"
    />
    <button @click="emit('increase')" class="w-[24px] px-2 py-1 bg-gray-200 rounded cursor-pointer">
      +
    </button>
  </div>
</template>
