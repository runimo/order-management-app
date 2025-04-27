<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useProductsStore } from '@/stores/products'
import { storeToRefs } from 'pinia'
import BaseButton from './BaseButton.vue'
import ListActionFlyout from './ListActionFlyout.vue'
import ProductForm from './ProductForm.vue'

const productsStore = useProductsStore()
const {
  createProduct,
  deleteProduct,
  fetchProducts,
  updateProduct
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
const handleSave = (product): void => {
  newProduct.value = product
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

const isEdit = ref(false)
const enableEditMode = (): void => {
  isEdit.value = true
}
const disableEditMode = (): void => {
  isEdit.value = false
}
const productBeingEdited = ref(null)
const setProductBeingEdited = (product) => {
  const { id } = product
  productBeingEdited.value = {
    id,
    ...product.attributes
  }
}
const updateProductBeingEdited = (product) => {
  productBeingEdited.value = {
    id: productBeingEdited.value.id,
    ...product
  }
}

const openFlyoutId = ref<string | null>(null)
const toggleFlyout = (productId: string): void => {
  openFlyoutId.value = openFlyoutId.value === productId ? null : productId
}

const handleDelete = (productId: string): void => {
  if (window.confirm('Are you sure you want to delete this product?')) {
    deleteProduct(productId)
  }
  toggleFlyout(productId)
}

const handleEdit = (product): void => {
  enableEditMode()
  setProductBeingEdited(product)
  toggleFlyout(product.id)
}
const handleSaveEdit = (product): void => {
  updateProductBeingEdited(product)
  updateProduct(productBeingEdited.value)
  disableEditMode()
}

onMounted(() => {
  fetchProducts()
})
</script>

<template>
  <div class="flex justify-center sm:justify-end">
    <BaseButton
      v-if="!isCreateFormOpen && !isEdit"
      class="w-[90%] sm:w-[50%] md:w-[25%]"
      @click="toggleCreateForm">
      Add Product
    </BaseButton>
  </div>
  <ProductForm
    v-if="isCreateFormOpen"
    @cancel="cancel"
    @save="(product) => handleSave(product)" />
  
  <div class="block md:hidden mt-8">
    <div
      v-if="!isEdit"
      class="space-y-4">
      <div
        v-for="product in productsByCurrentUserCompany"
        :key="product.id"
        class="p-4 bg-white rounded-xs shadow border border-gray-200">
        <div class="flex justify-between">
          <h2 class="text-lg font-semibold text-gray-900 mb-1">
            {{ product.attributes.name }}
          </h2>
          <div class="relative inline-block">
            <button
              class="hover:bg-violet-100 hover:text-violet-700 cursor-pointer font-semibold leading-normal rounded-3xl pt-0 pb-2 px-1"
              type="button"
              @click="toggleFlyout(product.id)">
              ...
            </button>
            <ListActionFlyout
              v-if="openFlyoutId === product.id"
              @delete="handleDelete(product.id)"
              @edit="handleEdit(product)" />
          </div>
        </div>
        <p class="text-gray-700">
          Price: €{{ product.attributes.price }}
        </p>
        <p class="text-gray-700">
          Stock: {{ product.attributes.stock }}
        </p>
      </div>
    </div>
    <ProductForm
      v-else
      :product="productBeingEdited"
      @cancel="disableEditMode"
      @save="product => handleSaveEdit(product)" />

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
            {{ product.attributes.price }} €
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
              <ListActionFlyout
                v-if="openFlyoutId === product.id"
                @delete="handleDelete(product.id)" />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>