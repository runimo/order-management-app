<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useOrdersStore } from '@/stores/orders'
import dayjs from 'dayjs'


const ordersStore = useOrdersStore()
const { fetchOrders } = ordersStore
const {
  createdOrdersByCurrentUserCompany,
  supplierByOrderId
} = storeToRefs(ordersStore)

const formatDate = (isoString: string) => {
  return dayjs(isoString).format('D MMM YYYY, HH:mm')
}

onMounted(() => {
  fetchOrders()
})
</script>

<template>
  <div class="block md:hidden space-y-4">
    <div
      v-for="order in createdOrdersByCurrentUserCompany"
      :key="order.id"
      class="p-4 bg-white rounded-xs shadow border border-gray-200">
      <h2 class="text-lg font-semibold text-gray-900 mb-1">
        #{{ order.attributes.orderNumber }}
      </h2>
      <p class="text-gray-700">
        <span class="font-semibold">Status:</span> {{ order.attributes.status }}
      </p>
      <p class="text-gray-700">
        <span class="font-semibold">Created at:</span> {{ formatDate(order.attributes.createdAt) }}
      </p>
      <p class="text-gray-700">
        <span class="font-semibold">Supplier:</span> {{ supplierByOrderId(order.id).attributes.name }}
      </p>
    </div>
  </div>

  <div class="hidden md:block">
    <table class="min-w-full table-auto border-collapse border border-gray-300">
      <thead>
        <tr class="bg-gray-100 text-left">
          <th class="p-2 border border-gray-300">
            Order Number
          </th>
          <th class="p-2 border border-gray-300">
            Created at
          </th>
          <th class="p-2 border border-gray-300">
            Status
          </th>
          <th class="p-2 border border-gray-300">
            Supplier
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="order in createdOrdersByCurrentUserCompany"
          :key="order.id"
          class="hover:bg-gray-50">
          <td class="p-2 border border-gray-300">
            #{{ order.attributes.orderNumber }}
          </td>
          <td class="p-2 border border-gray-300">
            {{ formatDate(order.attributes.createdAt) }}
          </td>
          <td class="p-2 border border-gray-300">
            {{ order.attributes.status }}
          </td>
          <td class="p-2 border border-gray-300">
            {{ supplierByOrderId(order.id).attributes.name }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>