<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { useCompaniesStore } from '@/stores/companies'
  import { useOrdersStore } from '@/stores/orders'
  import { useProductsStore } from '@/stores/products'
  import BaseButton from './BaseButton.vue'
  import dayjs from 'dayjs'
  import ProductQuantitySelector from './ProductQuantitySelector.vue'
  import StatusBadge from './StatusBadge.vue'
  import type { Order } from '@/types/index.d.ts'

  const { order } = defineProps({
    order: {
      type: Object as PropType<Order>,
      required: true
    }
  })

  const emit = defineEmits([
    'close'
  ])

  const ordersStore = useOrdersStore()
  const {
    resetOrderByType,
    updateOrder
  } = ordersStore

  const companiesStore = useCompaniesStore()

  const productsStore = useProductsStore()
  const availableProducts = computed(() => {
    const supplierId = orderToEdit.value.supplierId

    return supplierId ? productsStore.productsByCompanyId(supplierId) : []
  })

  const orderToEdit = ref<Order | null>(null)
  const setOrderToEdit = () => {
    const {
      createdAt,
      orderNumber,
      quantities,
      status,
      totalPrice
    } = order.attributes
    const products = quantities.map(product => {
      const { productId, count } = product
      const fullProduct = productsStore.productById(productId)
      const { name, price } = fullProduct.attributes

      return {
        id: productId,
        count,
        name,
        price
      }
    })
    const transformedOrder = {
      id: order.id,
      createdAt,
      orderNumber,
      products,
      status,
      supplierId: order.relationships.supplier.data.id,
      totalPrice
    }

    orderToEdit.value = transformedOrder
  }

  const formatDate = (isoString: string) => {
    return dayjs(isoString).format('D MMM YYYY, HH:mm')
  }

  const cancel = (): void => {
    emit('close')
  }
  const handleSaveEdit = ():void => {
    emit('close')
    updateOrder()
    resetOrderByType('orderBeingEdited')
  }

  onMounted(() => {
    setOrderToEdit()
  })
</script>

<template>
  <div
    v-if="orderToEdit"
    class="flex flex-col justify-center space-y-4 mt-8">
    <div class="max-w-full p-4 bg-white rounded-xs shadow border border-gray-200">
      <div class="flex justify-between">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">
          Order #{{ orderToEdit.orderNumber }}
        </h2>
      </div>

      <div class="grid gap-1">
        <div class="flex justify-between">
          <span class="text-gray-500">
            Status
          </span>
          <StatusBadge :status="orderToEdit.status" />
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">
            Created at
          </span>
          <span>
            {{ formatDate(orderToEdit.createdAt) }}
          </span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">
            Supplier
          </span>
          <span>
            {{ companiesStore.companies.find(company => company.id === orderToEdit.supplierId).attributes.name }}
          </span>
        </div>
      </div>
    
      <hr class="mt-4 text-gray-300">

      <ProductQuantitySelector
        :available-products="availableProducts"
        :order="orderToEdit"
        order-type="orderBeingEdited" />

      <div class="flex flex-col sm:flex-row justify-end w-full gap-2 mt-6">
        <BaseButton
          class="w-full sm:w-[30%]"
          variant="secondary"
          @click="cancel">
          Cancel
        </BaseButton>
        <BaseButton
          class="w-full sm:w-[30%]"
          @click="handleSaveEdit">
          Save
        </BaseButton>
      </div>
    </div>
  </div>
</template>