<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useCompaniesStore } from '@/stores/companies'
import { useOrdersStore } from '@/stores/orders'
import { useProductsStore } from '@/stores/products'
import BaseButton from './BaseButton.vue'
import CreateOrderForm from './CreateOrderForm.vue'
import EditOrderForm from './EditOrderForm.vue'
import dayjs from 'dayjs'
import ListActionFlyout from './ListActionFlyout.vue'
import StatusBadge from './StatusBadge.vue'
import type { Order } from '@/types/index.d.ts'

const ordersStore = useOrdersStore()
const { deleteOrder, fetchOrders } = ordersStore
const { createdOrdersByCurrentUserCompany } = storeToRefs(ordersStore)

const orderToEdit = ref<Order | null>(null)
const setOrderToEdit = (order: Order) => {
  orderToEdit.value = order
}

const companiesStore = useCompaniesStore()
const { fetchCompanies } = companiesStore

const productsStore = useProductsStore()
const { fetchProducts } = productsStore

const formatDate = (isoString: string) => {
  return dayjs(isoString).format('D MMM YYYY, HH:mm')
}

const isCreateFormOpen = ref<boolean>(false)
const toggleCreateForm = (): void => {
  isCreateFormOpen.value = !isCreateFormOpen.value
}

const openFlyoutId = ref<string | null>(null)
const toggleFlyout = (orderId: string): void => {
  openFlyoutId.value = openFlyoutId.value === orderId ? null : orderId
}

const isEdit = ref<boolean>(false)
const enableEditMode = (): void => {
  isEdit.value = true
}
const disableEditMode = (): void => {
  isEdit.value = false
}
const handleDelete = (orderId: string): void => {
  if (window.confirm('Are you sure you want to delete this order?')) {
    deleteOrder(orderId)
  }
  toggleFlyout(orderId)
}
const handleEdit = (order: Order): void => {
  setOrderToEdit(order)
  enableEditMode()
  toggleFlyout(order.id)
}

onMounted(() => {
  fetchOrders()
  fetchCompanies()
  fetchProducts()
})
</script>

<template>
  <div>
    <div v-if="!isCreateFormOpen && !isEdit" class="flex justify-center sm:justify-end">
      <BaseButton class="w-[90%] sm:w-[50%] md:w-[25%]" @click="toggleCreateForm">
        Create Order
      </BaseButton>
    </div>

    <CreateOrderForm v-if="isCreateFormOpen" @close="toggleCreateForm" />

    <div class="block md:hidden mt-8">
      <div v-if="!isEdit" class="space-y-4">
        <div
          v-for="order in createdOrdersByCurrentUserCompany"
          :key="order.id"
          class="p-4 bg-white rounded-xs shadow border border-gray-200"
        >
          <div class="flex justify-between">
            <h2 class="text-lg font-semibold text-gray-900 ml-6 mb-4">
              Order #{{ order.attributes.orderNumber }}
            </h2>
            <div class="relative inline-block">
              <button
                class="hover:bg-violet-100 hover:text-violet-700 cursor-pointer font-semibold leading-normal rounded-3xl pt-0 pb-2 px-1"
                type="button"
                @click="toggleFlyout(order.id)"
              >
                ...
              </button>
              <ListActionFlyout
                v-if="openFlyoutId === order.id"
                :edit-button-title="
                  order.attributes.status === 'delivered' || order.attributes.status === 'shipped'
                    ? `You can't edit this order anymore.`
                    : undefined
                "
                :is-edit-disabled="
                  order.attributes.status === 'delivered' || order.attributes.status === 'shipped'
                "
                @delete="handleDelete(order.id)"
                @edit="handleEdit(order)"
              />
            </div>
          </div>

          <div class="ml-6 mr-6">
            <div class="grid gap-1">
              <div class="flex justify-between">
                <span class="text-gray-500">Status</span>
                <StatusBadge :status="order.attributes.status" />
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Created at</span>
                <span>{{ formatDate(order.attributes.createdAt) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Supplier</span>
                <span>{{
                  companiesStore.companies.find(
                    (company) => company.id === order.relationships.supplier.data.id,
                  )?.attributes.name
                }}</span>
              </div>
            </div>

            <hr class="my-4 text-gray-300" />

            <div class="mb-2">
              <div class="text-gray-500 mb-1">Products</div>
              <ul class="space-y-1">
                <li
                  v-for="product in order.attributes.quantities"
                  :key="`product:${product.productId}`"
                  class="flex justify-between"
                >
                  <span class="text-gray-800">{{
                    productsStore.productById(product.productId)?.attributes.name
                  }}</span>
                  <span
                    >{{ product.count }} x
                    {{ productsStore.productById(product.productId)?.attributes.price }} €</span
                  >
                </li>
              </ul>
            </div>

            <hr class="my-4 text-gray-300" />

            <div class="flex justify-between font-semibold">
              <span>Total</span>
              <span>{{ order.attributes.totalPrice }} €</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="flex justify-center">
        <EditOrderForm :order="orderToEdit" @close="disableEditMode" />
      </div>
    </div>

    <div class="hidden md:block mt-8">
      <table v-if="!isEdit" class="min-w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr class="bg-gray-100 text-left">
            <th class="p-2 border-b border-t border-gray-300">Order Number</th>
            <th class="p-2 border-b border-t border-gray-300">Created at</th>
            <th class="p-2 border-b border-t border-gray-300">Status</th>
            <th class="p-2 border-b border-t border-gray-300">Supplier</th>
            <th>Products</th>
            <th>Total</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="order in createdOrdersByCurrentUserCompany"
            :key="order.id"
            class="hover:bg-gray-50"
          >
            <td class="p-2 border-b border-t border-gray-300">
              #{{ order.attributes.orderNumber }}
            </td>
            <td class="p-2 border-b border-t border-gray-300">
              {{ formatDate(order.attributes.createdAt) }}
            </td>
            <td class="p-2 border-b border-t border-gray-300">
              <StatusBadge :status="order.attributes.status" />
            </td>
            <td class="p-2 border-b border-t border-gray-300">
              {{
                companiesStore.companies.find(
                  (company) => company.id === order.relationships.supplier.data.id,
                )?.attributes.name
              }}
            </td>
            <td class="py-2 border-b border-t border-gray-300">
              <ul class="space-y-1">
                <li
                  v-for="product in order.attributes.quantities"
                  :key="`product:${product.productId}`"
                >
                  <div class="font-medium">
                    {{ productsStore.productById(product.productId)?.attributes.name }}
                  </div>
                  <div class="text-sm text-gray-600">
                    {{ product.count }} x
                    {{ productsStore.productById(product.productId)?.attributes.price }} €
                  </div>
                </li>
              </ul>
            </td>
            <td class="py-2 border-b border-t border-gray-300">
              {{ order.attributes.totalPrice }} €
            </td>
            <td class="p-2 border-b border-t border-gray-300">
              <div class="relative inline-block">
                <button
                  class="hover:bg-violet-100 hover:text-violet-700 cursor-pointer font-semibold leading-normal rounded-3xl pt-0 pb-2 px-1"
                  type="button"
                  @click="toggleFlyout(order.id)"
                >
                  ...
                </button>
                <ListActionFlyout
                  v-if="openFlyoutId === order.id"
                  :edit-button-title="
                    order.attributes.status === 'delivered' || order.attributes.status === 'shipped'
                      ? `You can't edit this order anymore.`
                      : undefined
                  "
                  :is-edit-disabled="
                    order.attributes.status === 'delivered' || order.attributes.status === 'shipped'
                  "
                  @delete="handleDelete(order.id)"
                  @edit="handleEdit(order)"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else class="flex justify-center">
        <EditOrderForm
          class="sm:w-[80%] lg:w-[50%]"
          :order="orderToEdit"
          @close="disableEditMode"
        />
      </div>
    </div>
  </div>
</template>
