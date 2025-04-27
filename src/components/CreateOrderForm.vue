<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useCompaniesStore } from '@/stores/companies'
  import { useOrdersStore } from '@/stores/orders'
  import { useProductsStore } from '@/stores/products'
  import BaseButton from './BaseButton.vue'
  import BaseSelect from './BaseSelect.vue'
  import ProductQuantitySelector from './ProductQuantitySelector.vue'
  
  const ordersStore = useOrdersStore()
  const {
    createOrder,
    resetOrderByType
  } = ordersStore
  const {
    orderBeingCreated
  } = storeToRefs(ordersStore)

  const companiesStore = useCompaniesStore()
  const { fetchCompanies } = companiesStore 
  const { availableCompanies } = storeToRefs(companiesStore)

  const emit = defineEmits([
    'close'
  ])

  const currentStep = ref(1)
  const newOrder = ref({
    supplierId: '',
    products: [],
    totalPrice: 0
  })
  const steps = [
    'Select Supplier',
    'Select Products',
    'Confirm'
  ]
  const setCurrentStep = (stepNumber: number): void => {
    currentStep.value = stepNumber
  }
  const cancel = (): void => {
    emit('close')
    toggleCreateForm()
    resetCreateForm()
  }
  const handleBack = (): void => {
    if (currentStep === 2) {
      newOrder.value = {
        ...newOrder.value,
        products: [],
        totalPrice: 0
      }
    }

    currentStep.value--
  }
  const resetCreateForm = (): void => {
    setCurrentStep(1)
    newOrder.value = {
      supplierId: '',
      products: [],
      totalPrice: 0
    }
    resetOrderByType('orderBeingCreated')
  }
  const handleCreateOrder = (): void => {
    emit('close')
    createOrder()
    resetCreateForm()
  }
  const availableSuppliers = computed(() => {
    return availableCompanies.value.map(company => ({
      id: company.id,
      label: company.attributes.name
    }))
  })

  const productsStore = useProductsStore()
  const availableProducts = computed(() => {
    const { supplierId } = newOrder.value

    return supplierId
      ? productsStore.productsByCompanyId(supplierId)
      : []
  })
</script>

<template>
  <div>
    <div class="flex justify-center">
      <div class="w-[90%] md:w-[50%] md:justify-end rounded-xs border border-gray-300 mt-4 p-4">
        <div class="flex items-center justify-center w-full max-w-3xl mb-[48px] mx-auto">
          <div class="flex items-center w-[90%]">
            <div
              v-for="(step, index) in steps"
              :key="index"
              class="flex items-center relative"
              :class="step === 'Confirm' ? '' : 'w-full'">
              <div
                :class="[
                  'flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-semibold z-10',
                  currentStep > (index + 1)
                    ? 'bg-violet-600 border-violet-600 text-white'
                    : currentStep === (index + 1)
                      ? 'bg-white border-violet-600 text-violet-600'
                      : 'bg-white border-gray-300 text-gray-400']">
                {{ index + 1 }}
              </div>
              <div
                class="absolute top-10 text-xs text-center"
                :class="[step === 'Confirm' ? 'left-[-3px]' : 'left-[-20px]', index + 1 === currentStep ? 'font-semibold': '']">
                {{ step }}
              </div>
              <div
                v-if="index < steps.length - 1"
                class="flex-1 h-1 mx-2 bg-gray-300 relative overflow-hidden">
                <div
                  class="h-1 bg-violet-600 absolute top-0 left-0 transition-all duration-500"
                  :class="[currentStep > (index + 1) ? 'w-full' : currentStep === (index + 1) ? 'w-[50%]' : 'w-0']">
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="currentStep === 1">
          <BaseSelect
            id="supplier"
            label="Supplier"
            :options="availableSuppliers"
            v-model="newOrder.supplierId" />
          <div class="flex flex-col sm:flex-row justify-end w-full mt-6">
            <BaseButton
              class="w-full sm:w-[30%] sm:mr-2"
              variant="secondary"
              @click="cancel">
              Cancel
            </BaseButton>
            <BaseButton
              class="w-full sm:w-[30%]"
              :disabled="newOrder.supplierId === ''"
              @click="setCurrentStep(2)">
              Next
            </BaseButton>
          </div>
        </div>
        
        <div v-if="currentStep === 2">
          <ProductQuantitySelector
            :available-products="availableProducts"
            :order="newOrder"
            orderType="orderBeingCreated" />

          <div class="flex flex-col sm:flex-row justify-between w-full mt-6">
            <BaseButton
              class="w-full sm:w-[30%]"
              variant="secondary"
              @click="handleBack">
              Back
            </BaseButton>
            <BaseButton
              class="w-full sm:w-[30%]"
              :disabled="newOrder.products.length === 0"
              @click="setCurrentStep(3)">
              Next
            </BaseButton>
          </div>
        </div>

        <div v-if="currentStep === 3">
          <div>
            <h2 class="font-semibold text-lg mb-2">
                Your order
            </h2>
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
                  v-for="product in newOrder.products"
                  :key="product.id"
                  class="border border-gray-300">
                  <td class="px-4 py-2 border border-gray-300">
                    {{ product.name }}
                  </td>
                  <td class="px-4 py-2 border border-gray-300">
                    {{ product.price }} €
                  </td>
                  <td class="px-4 py-2 border border-gray-300">
                    {{ product.count }}
                  </td>
                </tr>
              </tbody>
            </table>
            <div class="text-right mt-4 mr-1">
              <span class="font-semibold">Total: </span>
              <span>
                {{ orderBeingCreated.totalPrice }} €
              </span>
          </div>
          </div>

          <div class="flex flex-col sm:flex-row justify-between w-full gap-2 mt-6">
            <BaseButton
              class="w-full sm:w-[30%]"
              variant="secondary"
              @click="handleBack">
              Back
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
  </div>
</template>