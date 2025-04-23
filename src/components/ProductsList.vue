<script setup lang="ts">
import { onMounted } from 'vue'
import { useProductsStore } from '@/stores/products'
import { storeToRefs } from 'pinia'

const productsStore = useProductsStore()
const { fetchProducts } = productsStore
const { productsByCurrentUserCompany } = storeToRefs(productsStore)

onMounted(() => {
  fetchProducts()
})
</script>

<template>
  <div class="block md:hidden space-y-4">
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
    </div>
  </div>

  <div class="hidden md:block">
    <table class="min-w-full table-auto border-collapse border border-gray-300">
      <thead>
        <tr class="bg-gray-100 text-left">
          <th class="p-2 border border-gray-300">
            Name
          </th>
          <th class="p-2 border border-gray-300">
            Price
          </th>
          <th class="p-2 border border-gray-300">
            Stock
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="product in productsByCurrentUserCompany"
          :key="product.id"
          class="hover:bg-gray-50">
          <td class="p-2 border border-gray-300">
            {{ product.attributes.name }}
          </td>
          <td class="p-2 border border-gray-300">
            €{{ product.attributes.price }}
          </td>
          <td class="p-2 border border-gray-300">
            {{ product.attributes.stock }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>