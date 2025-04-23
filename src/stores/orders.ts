import { defineStore } from 'pinia'
import { useUserStore } from './user'
import response from '@/mocks/orders.json'

export const useOrdersStore = defineStore('orders', {
    state: () => ({
      orders: []
    }),

    actions: {
      fetchOrders () {
        this.orders = response.data
      }
    },

    getters: {
      createdOrdersByCurrentUserCompany(state) {
        const userStore = useUserStore()
  
        if (!userStore.currentUser?.company?.id) {
          return []
        }
  
        return state.orders.filter(order =>
          order.relationships?.customer?.data?.id === userStore.currentUser.company.id
        )
      },

      supplierByOrderId: (state) => {
        return (orderId: string) => {
          const supplierId = state.orders.find(order => order.id === orderId)?.relationships.supplier.data.id
          const supplier = supplierId
            ? response.included
              .find(resource => resource.type === 'Company' && resource.id === supplierId)
            : null

          return supplier
        }
      }
    }
})