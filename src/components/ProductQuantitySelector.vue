<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useOrdersStore } from '@/stores/orders'
import ProductQuantityInput from './ProductQuantityInput.vue'
import type { OrderDraft, OrderTransformedForEdit, Product } from '@/types/index.d.ts'
import type { PropType } from 'vue'

const ordersStore = useOrdersStore()
const {
  addProductToOrder,
  decreaseProductQuantity,
  increaseProductQuantity,
  removeProductFromOrder,
  setOrderByType,
  updateTotalPrice,
} = ordersStore
const { orderBeingCreated, orderBeingEdited } = storeToRefs(ordersStore)

const { availableProducts, order, orderType } = defineProps({
  // All available products by the currently selected company
  availableProducts: {
    type: Array as PropType<Product[]>,
    required: true,
  },
  order: {
    type: Object as PropType<OrderDraft | OrderTransformedForEdit>,
    required: true,
  },
  // Is used to determine which store variable to update
  orderType: {
    type: String as PropType<'orderBeingCreated' | 'orderBeingEdited'>,
    required: true,
  },
})

const currentOrder = computed(() => {
  switch (orderType) {
    case 'orderBeingCreated':
      return orderBeingCreated.value
    case 'orderBeingEdited':
      return orderBeingEdited.value
    default:
      console.warn(`Unknown orderType ${orderType}`)
      return null
  }
})

const handleDecrease = (productId: string): void => {
  const currentProduct = currentOrder.value?.products.find((product) => product.id === productId)
  const fullCurrentProduct = availableProducts.find(
    (product) => product.id === productId,
  ) as Product
  const price = fullCurrentProduct?.attributes.price || 0

  if (currentProduct) {
    decreaseProductQuantity({ orderType, productId })
    updateTotalPrice({
      orderType,
      amount: price,
      operation: 'decrease',
    })

    if (currentProduct.count === 0) {
      removeProductFromOrder({ orderType, productId })
    }
  }
}
const handleIncrease = (productId: string): void => {
  const currentProduct = currentOrder.value?.products.find((product) => product.id === productId)
  const fullCurrentProduct = availableProducts.find(
    (product) => product.id === productId,
  ) as Product
  const price = fullCurrentProduct?.attributes.price || 0
  const name = fullCurrentProduct?.attributes.name || ''

  if (currentProduct) {
    increaseProductQuantity({ orderType, productId })
  } else {
    const product = {
      id: productId,
      count: 1,
      price,
      name,
    }

    addProductToOrder({ orderType, product })
  }

  updateTotalPrice({
    orderType,
    amount: price,
    operation: 'increase',
  })
}

onMounted(() => {
  setOrderByType({ orderType, order })
})
</script>

<template>
  <div>
    <table class="w-full table-auto border-collapse">
      <thead>
        <tr>
          <th class="px-4 py-2 border border-gray-300 text-left">Product</th>
          <th class="px-4 py-2 border border-gray-300 text-left">Price</th>
          <th class="px-4 py-2 border border-gray-300 text-left">Quantity</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in availableProducts" :key="product.id" class="border border-gray-300">
          <td class="px-4 py-2 border border-gray-300">
            {{ product.attributes.name }}
          </td>
          <td class="px-4 py-2 border border-gray-300">{{ product.attributes.price }} €</td>
          <td class="px-4 py-2 border border-gray-300">
            <ProductQuantityInput
              :order-type="orderType"
              :product-id="product.id"
              @decrease="handleDecrease(product.id)"
              @increase="handleIncrease(product.id)"
            />
          </td>
        </tr>
      </tbody>
    </table>

    <hr class="mt-6 mb-4 text-gray-300" />

    <div class="flex justify-between font-semibold">
      <span>Total</span>
      <span>{{ currentOrder?.totalPrice || 0 }} €</span>
    </div>
  </div>
</template>
