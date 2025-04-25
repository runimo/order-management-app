import { defineStore } from 'pinia'
import { useUserStore } from './user'
import response from '@/mocks/orders.json'

export const useOrdersStore = defineStore('orders', {
    state: () => ({
      orders: []
    }),

    actions: {
      createOrder (order): void {
        const userStore = useUserStore()
        const { currentUser } = userStore
        const quantities = order.products.map(({ id, count }: { id: string, count: number }) => ({ productId: id, count }))
        const mostRecentOrder = this.orders.reduce((max, order) => {
          return order.attributes.orderNumber > max.attributes.orderNumber
          ? order
          : max
        })
        const newNumber =  Number(mostRecentOrder.attributes.orderNumber) + 1
        const newOrderNumber = newNumber.toString().padStart(3, '0')
        
        
        const mostRecentIdNumber = mostRecentOrder.id.replace('order-', '')
        const newIdNumber = Number(mostRecentIdNumber) + 1
        const id = `order-${newIdNumber.toString().padStart(3, '0')}`

        const relationships = {
          products: {
            data: order.products.map(({ id }: { id: string}) => ({ id, type: 'Product' }))
          },
          supplier: {
            data: {
              id: order.supplierId,
              type: 'Company'
            }
          },
          customer: {
            data: {
              id: currentUser.company.id,
              type: 'Company'
            }
          }
        }

        const newOrder = {
          id,
          attributes: {
            createdAt: new Date(),
            orderNumber: newOrderNumber,
            status: 'pending',
            quantities
          },
          relationships,
          type: 'Order'
        }

        this.orders.unshift(newOrder)
      },

      fetchOrders (): void {
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
      }
    }
})