<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useProductsStore } from '@/stores/products'
import { storeToRefs } from 'pinia'
import BaseButton from './BaseButton.vue'
import BaseInput from './BaseInput.vue'
import ListActionFlyout from './ListActionFlyout.vue'

const productsStore = useProductsStore()
const {
  createProduct,
  fetchProducts
} = productsStore
const { productsByCurrentUserCompany } = storeToRefs(productsStore)

const isCreateFormOpen = ref(false)
const toggleCreateForm = () => {
  isCreateFormOpen.value = !isCreateFormOpen.value
}

const newProduct = ref({
  name: '',
  price: null,
  stock: null
})

const cancel = (): void => {
  toggleCreateForm()
  reset()
}

const handleSave = (): void => {
  createProduct(newProduct.value)
  toggleCreateForm()
  reset()
}

const reset = (): void => {
  newProduct.value = {
    name: '',
    price: null,
    stock: null
  }
}

onMounted(() => {
  fetchProducts()
})
</script>

<template>
  <div class="flex justify-center sm:justify-end">
    <BaseButton
      v-if="!isCreateFormOpen"
      class="w-[90%] sm:w-[50%] md:w-[25%]"
      @click="toggleCreateForm">
      Add Product
    </BaseButton>
  </div>
  <div
    v-if="isCreateFormOpen"
    class="flex justify-center">
    <div
      class="w-[90%] md:w-[50%] md:justify-end rounded-xs border border-gray-300 mt-4 p-4">
      <BaseInput
        class="mb-2"
        id="name"
        label="Name"
        v-model="newProduct.name" />
      <BaseInput
        class="mb-2"
        id="price"
        label="Price (€)"
        v-model="newProduct.price" />
      <BaseInput
        class="mb-2"
        id="stock"
        label="Stock"
        v-model="newProduct.stock" />

      <div class="flex flex-col sm:flex-row justify-end w-full gap-2 mt-6">
        <BaseButton
          class="w-full sm:w-[30%]"
          variant="secondary"
          @click="cancel">
          Cancel
        </BaseButton>
        <BaseButton
          class="w-full sm:w-[30%]"
          @click="handleSave">
          Save
        </BaseButton>
      </div>
    </div>
  </div>
  
  <div class="block md:hidden space-y-4 mt-8">
    <div
      v-for="product in productsByCurrentUserCompany"
      :key="product.id"
      class="p-4 bg-white rounded-xs shadow border border-gray-200">
      <h2 class="text-lg font-semibold text-gray-900 mb-1">
        {{ product.attributes.name }}
      </h2>
      <p class="text-gray-700">
        Price: €{{ product.attributes.price }}
      </p>
      <p class="text-gray-700">
        Stock: {{ product.attributes.stock }}
      </p>
      <div class="relative inline-block">
        <button
          class="hover:bg-violet-100 hover:text-violet-700 cursor-pointer font-semibold leading-normal rounded-3xl pt-0 pb-2 px-1"
          type="button"
          @click="toggleFlyout(product.id)">
          ...
        </button>
        <ListActionFlyout v-if="openFlyoutId === product.id" />
      </div>
    </div>
  </div>

  <div class="hidden md:block mt-8">
    <table class="min-w-full table-auto rounded-sm border-collapse border border-gray-300">
      <thead>
        <tr class="bg-gray-100 text-left">
          <th class="p-2 border-b border-t border-gray-300">
            Name
          </th>
          <th class="p-2 border-b border-t border-gray-300">
            Price
          </th>
          <th class="p-2 border-b border-t border-gray-300">
            Stock
          </th>
          <th class="p-2 border-b border-t border-gray-300">
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="product in productsByCurrentUserCompany"
          :key="product.id"
          class="hover:bg-gray-50">
          <td class="p-2 border-b border-t border-gray-300">
            {{ product.attributes.name }}
          </td>
          <td class="p-2 border-b border-t border-gray-300">
            €{{ product.attributes.price }}
          </td>
          <td class="p-2 border-b border-t border-gray-300">
            {{ product.attributes.stock }}
          </td>
          <td class="p-2 border-b border-t border-gray-300">
            <div class="relative inline-block">
              <button
                class="hover:bg-violet-100 hover:text-violet-700 cursor-pointer font-semibold leading-normal rounded-3xl pt-0 pb-2 px-1"
                type="button"
                @click="toggleFlyout(product.id)">
                ...
              </button>
              <ListActionFlyout v-if="openFlyoutId === product.id" />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>