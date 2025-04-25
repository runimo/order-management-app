<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useCompaniesStore } from '@/stores/companies'
import { useOrdersStore } from '@/stores/orders'
import { useProductsStore } from '@/stores/products'
import BaseButton from './BaseButton.vue'
import BaseSelect from './BaseSelect.vue'
import dayjs from 'dayjs'

const ordersStore = useOrdersStore()
const {
  createOrder,
  fetchOrders,
} = ordersStore
const {
  createdOrdersByCurrentUserCompany
} = storeToRefs(ordersStore)
const newOrder = ref({
  supplierId: '',
  products: []
})
const totalPrice = ref(0)
const decreaseTotalPrice = (amountToRemove) => {
  if (typeof totalPrice.value === 'string') {
    totalPrice.value = totalPrice.value.replace(",", ".")
  }
  const newTotalPrice = Number(totalPrice.value.replace(",", ".")) - Number(amountToRemove)
  const roundedPrice = Math.round(newTotalPrice * 100) / 100
  const [intPart, decimalPart] = roundedPrice.toString().split('.')
  const formattedPrice = `${intPart},${decimalPart?.padEnd(2, '0')}`
  totalPrice.value = formattedPrice
}
const increaseTotalPrice = (amountToAdd) => {
  if (typeof totalPrice.value === 'string') {
    totalPrice.value = totalPrice.value.replace(",", ".")
  }
  const newTotalPrice = Number(totalPrice.value) + Number(amountToAdd)
  const roundedPrice = Math.round(newTotalPrice * 100) / 100
  const [intPart, decimalPart] = roundedPrice.toString().split('.')
  const formattedPrice = `${intPart},${decimalPart?.padEnd(2, '0')}`
  totalPrice.value = formattedPrice
}

const companiesStore = useCompaniesStore()
const { fetchCompanies } = companiesStore 
const { availableCompanies } = storeToRefs(companiesStore)

const productsStore = useProductsStore()
const { fetchProducts } = productsStore
const availableProducts = computed(() => {
  return productsStore.productsByCompanyId(newOrder.value.supplierId)
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
  reset()
}
const reset = (): void => {
  setCreateFormStep(1)
  newOrder.value = {
    supplierId: '',
    products: []
  }
  totalPrice.value = 0
}
const handleCreateOrder = (): void => {
  toggleCreateForm()
  createOrder(newOrder.value)
  reset()
}
const options = computed(() => {
  return availableCompanies.value.map(company => ({
    id: company.id,
    label: company.attributes.name
  }))
})

const handleDecrease = (productId: string): void => {
  const currentProduct = newOrder.value.products.find(product => product.id === productId)
  const product = availableProducts.value.find(product => product.id === productId)
  const price = product?.attributes.price || 0
  
  if (currentProduct) {
    decreaseProductQuantity(currentProduct)
    decreaseTotalPrice(price)

    if (currentProduct.count === 0) {
      removeProduct(productId)
    }
  }
}
const handleIncrease = (productId) => {
  const currentProduct = newOrder.value.products.find(product => product.id === productId)
  const product = availableProducts.value.find(product => product.id === productId)
  const price = product?.attributes.price || 0
  const name = product?.attributes.name || ''

  if (currentProduct) {
    increaseProductQuantity(currentProduct)
  } else {
    addProduct({ id: productId, count: 1, price, name })
  }

  increaseTotalPrice(price)
}
const decreaseProductQuantity = (product): void => {
  product.count -= 1
}
const removeProduct = (productId: string): void => {
  newOrder.value.products = newOrder.value.products.filter(product => product.id !== productId)
}
const addProduct = (product) => {
  newOrder.value.products.push(product)
}
const increaseProductQuantity = (product): void => {
  product.count += 1
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
      v-if="!isCreateFormOpen"
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
          <table class="w-full table-auto border-collapse">
            <thead>
              <tr>
                <th class="px-4 py-2 border border-gray-300 text-left">
                  Product
                </th>
                <th class="px-4 py-2 border border-gray-300 text-left">
                  Price
                </th>
                <th class="px-4 py-2 border border-gray-300 text-left">
                  Quantity
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="product in availableProducts"
                :key="product.id"
                class="border border-gray-300">
                <td class="px-4 py-2 border border-gray-300">
                  {{ product.attributes.name }}
                </td>
                <td class="px-4 py-2 border border-gray-300">
                  € {{ product.attributes.price }}
                </td>
                <td class="px-4 py-2 border border-gray-300">
                  <div class="flex items-center">
                    <button
                      @click="handleDecrease(product.id)"
                      class="px-2 py-1 bg-gray-200 rounded">
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      class="w-16 text-center mx-2"
                      :value="newOrder.products.find(el => el.id === product.id)?.count || 0" />
                    <button
                      @click="handleIncrease(product.id)"
                      class="px-2 py-1 bg-gray-200 rounded">
                      +
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="text-right mt-4 mr-1">
            <span class="font-semibold">Total price: </span>
            <span>€ {{ totalPrice }}</span>
          </div>
          <div class="flex flex-col sm:flex-row justify-end w-full mt-6">
            <BaseButton
              class="w-full sm:w-[30%]"
              :disabled="!newOrder.products || (newOrder.products && newOrder.products.length === 0)"
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
                  <td class="px-4 py-2 border border-gray-300">€ {{ product.price }}</td>
                  <td class="px-4 py-2 border border-gray-300">
                    {{ product.count }}
                  </td>
                </tr>
              </tbody>
            </table>
            <div class="text-right mt-4 mr-1">
              <span class="font-semibold">Total price: </span>
              <span>€ {{ totalPrice }}</span>
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
          <span class="font-semibold">Supplier:</span> {{ companiesStore.companies.find(company => company.id === order.relationships.supplier.data.id).attributes.name }}
        </p>
      </div>
    </div>

    <div class="hidden md:block mt-8">
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
              {{ companiesStore.companies.find(company => company.id === order.relationships.supplier.data.id).attributes.name }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>