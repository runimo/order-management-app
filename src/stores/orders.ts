import { defineStore } from 'pinia'
import { useUserStore } from './user'
import response from '@/mocks/orders.json'

export const useOrdersStore = defineStore('orders', {
    state: () => ({
      orderBeingCreated: null,
      orderBeingEdited: null,
      orders: []
    }),

    actions: {
      addProductToOrder ({ orderType, product }: { orderType: 'orderBeingCreated' | 'orderBeingEdited', product: { id: string, count: number, price: number, name: string }}): void {
        const orderToUpdate = this[orderType]
        
        if (orderToUpdate) {
          orderToUpdate.products.push(product)
        }
      },

      createOrder (): void {
        const userStore = useUserStore()
        const { currentUser } = userStore
        const quantities = this.orderBeingCreated?.products.map(({ id, count }: { id: string, count: number }) => ({ productId: id, count }))
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
            data: this.orderBeingCreated.products.map(({ id }: { id: string}) => ({ id, type: 'Product' }))
          },
          supplier: {
            data: {
              id: this.orderBeingCreated.supplierId,
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
            quantities,
            totalPrice: this.orderBeingCreated.totalPrice
          },
          relationships,
          type: 'Order'
        }

        this.orders.unshift(newOrder)
      },

      deleteOrder (orderId: string): void {
        this.orders = this.orders.filter(order => order.id !== orderId)
      },

      fetchOrders (): void {
        this.orders = response.data
      },

      decreaseProductQuantity ({ orderType, productId }: { orderType: 'orderBeingCreated' | 'orderBeingEdited', productId: string}): void {
        const orderToUpdate = this[orderType]
        const productToUpdate = orderToUpdate?.products.find(product => product.id === productId)

        if (productToUpdate) {
          productToUpdate.count -= 1
        }
      },

      increaseProductQuantity ({ orderType, productId }: { orderType: 'orderBeingCreated' | 'orderBeingEdited', productId: string }): void {
        const productToUpdate = this[orderType]?.products.find(product => product.id === productId)
        
        if (productToUpdate) {
          productToUpdate.count += 1
        }
      },

      removeProductFromOrder ({ orderType, productId }: { orderType: 'orderBeingCreated' | 'orderBeingEdited', productId: string }): void {
        const orderToUpdate = this[orderType]

        if (orderToUpdate) {
          orderToUpdate.products.filter(product => product.id !== productId)
        }
      },

      resetOrderByType (orderType: 'orderBeingCreated' | 'orderBeingEdited'): void {
        this[orderType] = null
      },

      setOrderByType ({ orderType, order }): void {
        this[orderType] = order
      },

      updateOrder (): void {
        const orderId = this.orderBeingEdited.id
        let order = this.orders.find(order => order.id === orderId)

        if (order) {
          let products = this.orderBeingEdited.products
          const quantities = products
            .map(product => ({ productId: product.id, count: product.count }))
            .filter(quantity => quantity.count > 0)
          const updatedProductIds = quantities.map(quantity => quantity.productId)
          products = products
            .filter(product => updatedProductIds.includes(product.id))
            .map(product => ({ id: product.id, type: 'Product'}))
          const deTransformedOrder = {
            id: this.orderBeingEdited.id,
            attributes: {
              ...order.attributes,
              quantities,
              totalPrice: this.orderBeingEdited.totalPrice
            },
            relationships: {
              ...order.relationships,
              products
            }
          }

          const index = this.orders.findIndex(order => order.id === orderId)
          if (index !== -1) {
            this.orders[index] = deTransformedOrder
          }
        }
      },

      updateTotalPrice ({ orderType, amount, operation }: { orderType: 'orderBeingCreated' | 'orderBeingEdited', amount: string, operation: 'decrease' | 'increase' }): void {
        const orderToUpdate = this[orderType]

        if (orderToUpdate) {
          if (typeof orderToUpdate.totalPrice === 'string') {
            orderToUpdate.totalPrice = orderToUpdate.totalPrice.replace(",", ".")
          }

          let newTotalPrice = Number(orderToUpdate.totalPrice)

          switch (operation) {
            case 'increase':
              newTotalPrice += Number(amount)
              break
            case 'decrease':
              newTotalPrice -= Number(amount)
              break
            default:
              console.warn(`updateTotalPrice: Unknown operation ${operation}`)
              return
          }

          const roundedPrice = Math.round(newTotalPrice * 100) / 100
          const [intPart, decimalPart] = roundedPrice.toString().split('.')
          const formattedPrice = `${intPart},${decimalPart?.padEnd(2, '0')}`
          orderToUpdate.totalPrice = formattedPrice
        }
      },
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