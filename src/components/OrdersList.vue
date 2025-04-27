<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useCompaniesStore } from '@/stores/companies'
import { useOrdersStore } from '@/stores/orders'
import { useProductsStore } from '@/stores/products'
import { useUserStore } from '@/stores/user'
import BaseButton from './BaseButton.vue'
import BaseSelect from './BaseSelect.vue'
import dayjs from 'dayjs'
import ListActionFlyout from './ListActionFlyout.vue'
import ProductQuantitySelector from './ProductQuantitySelector.vue'

const userStore = useUserStore()
const { currentUser } = userStore

const ordersStore = useOrdersStore()
const {
  createOrder,
  fetchOrders,
  resetOrderByType,
  updateOrder
} = ordersStore
const {
  createdOrdersByCurrentUserCompany,
  orderBeingCreated,
  orderBeingEdited
} = storeToRefs(ordersStore)
const newOrder = ref({
  supplierId: '',
  products: [],
  totalPrice: 0
})
const orderInEdit = ref(null)
const setOrderInEdit = (order) => {
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

  orderInEdit.value = transformedOrder
}
const currentOrderType = computed(() => {
  let orderType = ''

  if (isEdit.value) {
    orderType = 'orderBeingEdited'
  } else if (isCreateFormOpen.value) {
    orderType = 'orderBeingCreated'
  }

  return orderType
})
const currentOrder = computed(() => {
  switch (currentOrderType.value) {
    case 'orderBeingCreated':
      return orderBeingCreated.value
    case 'orderBeingEdited':
      return orderBeingEdited.value
    default:
      console.warn(`Unknown orderType ${currentOrderType.value}`)
      return null
  }
})

const companiesStore = useCompaniesStore()
const { fetchCompanies } = companiesStore 
const { availableCompanies } = storeToRefs(companiesStore)

const productsStore = useProductsStore()
const { fetchProducts } = productsStore
const availableProducts = computed(() => {
  let supplierId = null

  if (isEdit.value) {
    supplierId = orderInEdit.value.supplierId
  } else if (isCreateFormOpen.value) {
    supplierId = newOrder.value.supplierId
  }

  return supplierId ? productsStore.productsByCompanyId(supplierId) : []
})

const formatDate = (isoString: string) => {
  return dayjs(isoString).format('D MMM YYYY, HH:mm')
}

const isCreateFormOpen = ref(false)
const createFormStep = ref(1)
const toggleCreateForm = (): void => {
  isCreateFormOpen.value = !isCreateFormOpen.value
}
const setCreateFormStep = (stepNumber: number): void => {
  createFormStep.value = stepNumber
}
const cancel = (): void => {
  toggleCreateForm()
  resetCreateForm()
}
const resetCreateFormForm = (): void => {
  setCreateFormStep(1)
  newOrder.value = {
    supplierId: '',
    products: [],
    totalPrice: 0
  }
  resetOrderByType('orderBeingCreated')
}
const handleCreateOrder = (): void => {
  toggleCreateForm()
  createOrder()
  resetCreateFormForm()
}
const options = computed(() => {
  return availableCompanies.value.map(company => ({
    id: company.id,
    label: company.attributes.name
  }))
})

const openFlyoutId = ref<string | null>(null)
const toggleFlyout = (orderId: string): void => {
  openFlyoutId.value = openFlyoutId.value === orderId ? null : orderId
}

const isEdit = ref(false)
const enableEditMode = ():void => {
  isEdit.value = true
}
const disableEditMode = ():void => {
  isEdit.value = false
}
const handleEdit = (order):void => {
  setOrderInEdit(order)
  enableEditMode()
  toggleFlyout(order.id)
}
const cancelEdit = ():void => {
  disableEditMode()
}
const handleSaveEdit = ():void => {
  disableEditMode()
  updateOrder()
  resetOrderByType('orderBeingEdited')
}

onMounted(() => {
  fetchOrders()
  fetchCompanies()
  fetchProducts()
})
</script>

<template>
  <div>
    <div
      v-if="!isCreateFormOpen && !isEdit"
      class="flex justify-center sm:justify-end">
      <BaseButton
        class="w-[90%] sm:w-[50%] md:w-[25%]"
        @click="toggleCreateForm">
        Create Order
      </BaseButton>
    </div>
    <div
      v-if="isCreateFormOpen"
      class="flex justify-center">
      <div class="w-[90%] md:w-[50%] md:justify-end rounded-xs border border-gray-300 mt-4 p-4">
        <div v-if="createFormStep === 1">
          <BaseSelect
            id="supplier"
            label="Supplier"
            :options="options"
            v-model="newOrder.supplierId" />
          <div class="flex flex-col sm:flex-row justify-end w-full mt-6">
            <BaseButton
              class="w-full sm:w-[30%]"
              :disabled="newOrder.supplierId === ''"
              @click="setCreateFormStep(2)">
              Continue
            </BaseButton>
          </div>
        </div>
        
        <div v-if="createFormStep === 2">
          <ProductQuantitySelector
            :available-products="availableProducts"
            :order="newOrder"
            orderType="orderBeingCreated" />

          <div class="flex flex-col sm:flex-row justify-end w-full mt-6">
            <BaseButton
              class="w-full sm:w-[30%]"
              :disabled="newOrder.products.length === 0"
              @click="setCreateFormStep(3)">
              Continue
            </BaseButton>
          </div>
        </div>

        <div v-if="createFormStep === 3">
          <div>
            <h2 class="font-semibold text-lg mb-2">Your order</h2>
            <table class="w-full table-auto border-collapse">
              <thead>
                <tr>
                  <th class="px-4 py-2 border border-gray-300 text-left">Product</th>
                  <th class="px-4 py-2 border border-gray-300 text-left">Price</th>
                  <th class="px-4 py-2 border border-gray-300 text-left">Quantity</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="product in newOrder.products"
                  :key="product.id"
                  class="border border-gray-300">
                  <td class="px-4 py-2 border border-gray-300">{{ product.name }}</td>
                  <td class="px-4 py-2 border border-gray-300">{{ product.price }} €</td>
                  <td class="px-4 py-2 border border-gray-300">
                    {{ product.count }}
                  </td>
                </tr>
              </tbody>
            </table>
            <div class="text-right mt-4 mr-1">
              <span class="font-semibold">Total: </span>
              <span>{{ currentOrder.totalPrice }} €</span>
          </div>
          </div>

          <div class="flex flex-col sm:flex-row justify-end w-full gap-2 mt-6">
            <BaseButton
              class="w-full sm:w-[30%]"
              variant="secondary"
              @click="cancel">
              Cancel
            </BaseButton>
            <BaseButton
              class="w-full sm:w-[30%]"
              @click="handleCreateOrder">
              Create Order
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <div class="block md:hidden space-y-4 mt-8">
      <div v-if="!isEdit">
        <div
          v-for="order in createdOrdersByCurrentUserCompany"
          :key="order.id"
          class="p-4 bg-white rounded-xs shadow border border-gray-200">
          <div class="flex justify-between">
            <h2 class="text-lg font-semibold text-gray-900 ml-6 mb-4">
              Order #{{ order.attributes.orderNumber }}
            </h2>
            <div class="relative inline-block">
              <button
                class="hover:bg-violet-100 hover:text-violet-700 cursor-pointer font-semibold leading-normal rounded-3xl pt-0 pb-2 px-1"
                type="button"
                @click="toggleFlyout(order.id)">
                ...
              </button>
              <ListActionFlyout
                v-if="openFlyoutId === order.id"
                @edit="handleEdit(order)" />
            </div>
          </div>

          <div class="ml-6 mr-6">
            <div class="grid gap-1">
              <div class="flex justify-between">
                <span class="text-gray-500">Status</span>
                <span class="font-semibold text-gray-800">{{ order.attributes.status }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Created at</span>
                <span>{{ formatDate(order.attributes.createdAt) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Supplier</span>
                <span>{{ companiesStore.companies.find(company => company.id === order.relationships.supplier.data.id).attributes.name }}</span>
              </div>
            </div>
 
            <hr class="my-4 text-gray-300">

            <div class="mb-2">
              <div class="text-gray-500 mb-1">Products</div>
              <ul class="space-y-1">
                <li
                  v-for="product in order.attributes.quantities"
                  class="flex justify-between">
                  <span class="text-gray-800">{{ productsStore.productById(product.productId)?.attributes.name }}</span>
                  <span>{{ product.count }} x {{ productsStore.productById(product.productId)?.attributes.price }} €</span>
                </li>
              </ul>
            </div>

            <hr class="my-4 text-gray-300">

            <div class="flex justify-between font-semibold">
              <span>Total</span>
              <span>{{ order.attributes.totalPrice }} €</span>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else
        class="flex justify-center space-y-4 mt-8">
        <div class="max-w-full p-4 bg-white w-[80%] xl:w-[50%] rounded-xs shadow border border-gray-200">
          <div class="flex justify-between">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">
              Order #{{ orderInEdit.orderNumber }}
            </h2>
          </div>

          <div class="grid gap-1">
            <div class="flex justify-between">
              <span class="text-gray-500">Status</span>
              <span class="font-semibold text-gray-800">{{ orderInEdit.status }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Created at</span>
              <span>{{ formatDate(orderInEdit.createdAt) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Supplier</span>
              <span>{{ companiesStore.companies.find(company => company.id === orderInEdit.supplierId).attributes.name }}</span>
            </div>
          </div>

          <hr class="mt-4 text-gray-300">

          <ProductQuantitySelector
            :available-products="availableProducts"
            :order="orderInEdit"
            order-type="orderBeingEdited" />

          <div class="flex flex-col sm:flex-row justify-end w-full gap-2 mt-6">
            <BaseButton
              class="w-full sm:w-[30%]"
              variant="secondary"
              @click="cancelEdit">
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
    </div>

    <div class="hidden md:block mt-8">
      <table
        v-if="!isEdit"
        class="min-w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr class="bg-gray-100 text-left">
            <th class="p-2 border-b border-t border-gray-300">
              Order Number
            </th>
            <th class="p-2 border-b border-t border-gray-300">
              Created at
            </th>
            <th class="p-2 border-b border-t border-gray-300">
              Status
            </th>
            <th class="p-2 border-b border-t border-gray-300">
              Supplier
            </th>
            <th>
              Products
            </th>
            <th>
              Total
            </th>
            <th>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="order in createdOrdersByCurrentUserCompany"
            :key="order.id"
            class="hover:bg-gray-50">
            <td class="p-2 border-b border-t border-gray-300">
              #{{ order.attributes.orderNumber }}
            </td>
            <td class="p-2 border-b border-t border-gray-300">
              {{ formatDate(order.attributes.createdAt) }}
            </td>
            <td class="p-2 border-b border-t border-gray-300">
              {{ order.attributes.status }}
            </td>
            <td class="p-2 border-b border-t border-gray-300">
              {{ companiesStore.companies.find(company => company.id === order.relationships.supplier.data.id).attributes.name }}
            </td>
            <td class="py-2 border-b border-t border-gray-300">
              <ul class="space-y-1">
                <li v-for="product in order.attributes.quantities">
                  <div class="font-medium">{{ productsStore.productById(product.productId)?.attributes.name }}</div>
                  <div class="text-sm text-gray-600">{{ product.count }} x {{ productsStore.productById(product.productId)?.attributes.price }} €</div>
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
                  @click="toggleFlyout(order.id)">
                  ...
                </button>
                <ListActionFlyout
                  v-if="openFlyoutId === order.id"
                  @edit="handleEdit(order)" />
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div
        v-else
        class="flex justify-center space-y-4 mt-8">
        <div class="max-w-full p-4 bg-white w-[80%] xl:w-[50%] rounded-xs shadow border border-gray-200">
          <div class="flex justify-between">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">
              Order #{{ orderInEdit.orderNumber }}
            </h2>
          </div>

          <div class="grid gap-1">
            <div class="flex justify-between">
              <span class="text-gray-500">Status</span>
              <span class="font-semibold text-gray-800">{{ orderInEdit.status }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Created at</span>
              <span>{{ formatDate(orderInEdit.createdAt) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Supplier</span>
              <span>{{ companiesStore.companies.find(company => company.id === orderInEdit.supplierId).attributes.name }}</span>
            </div>
          </div>

          <hr class="mt-4 text-gray-300">

          <ProductQuantitySelector
            :available-products="availableProducts"
            :order="orderInEdit"
            order-type="orderBeingEdited" />

          <div class="flex flex-col sm:flex-row justify-end w-full gap-2 mt-6">
            <BaseButton
              class="w-full sm:w-[30%]"
              variant="secondary"
              @click="cancelEdit">
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
    </div>
  </div>
</template>