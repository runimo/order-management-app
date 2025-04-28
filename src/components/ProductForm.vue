<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { PropType } from 'vue'
import BaseButton from './BaseButton.vue'
import BaseInput from './BaseInput.vue'
import type { ProductDraft } from '@/types/index.d.ts'

const { product } = defineProps({
  product: {
    type: Object as PropType<ProductDraft | null>,
    default: null,
  },
})

const emit = defineEmits(['cancel', 'save'])

const updatedProduct = ref<ProductDraft>({
  name: '',
  price: 0,
  stock: 0,
})
const setInitialProduct = (): void => {
  if (product) {
    updatedProduct.value = { ...product }
  }
}

onMounted(() => {
  if (product) {
    setInitialProduct()
  }
})
</script>

<template>
  <div class="flex justify-center">
    <div class="w-[90%] md:w-[50%] md:justify-end rounded-xs border border-gray-300 mt-4 p-4">
      <BaseInput class="mb-2" id="name" label="Name" v-model="updatedProduct.name" />
      <BaseInput class="mb-2" id="price" label="Price (€)" v-model="updatedProduct.price" />
      <BaseInput class="mb-2" id="stock" label="Stock" v-model="updatedProduct.stock" />

      <div class="flex flex-col sm:flex-row justify-end w-full gap-2 mt-6">
        <BaseButton class="w-full sm:w-[30%]" variant="secondary" @click="emit('cancel')">
          Cancel
        </BaseButton>
        <BaseButton class="w-full sm:w-[30%]" @click="emit('save', updatedProduct)">
          Save
        </BaseButton>
      </div>
    </div>
  </div>
</template>
