import { defineStore } from 'pinia'
import { useUserStore } from './user'
import response from '@/mocks/orders.json'
import type {
  CompanyResourceType,
  Order,
  OrderDraft,
  OrderResourceType,
  OrderStatus,
  OrderTransformedForEdit,
  OrderType,
  ProductResourceType,
} from '@/types/index.d.ts'

export const useOrdersStore = defineStore('orders', {
  state: () => ({
    orderBeingCreated: null as OrderDraft | null,
    orderBeingEdited: null as OrderTransformedForEdit | null,
    orders: [] as Order[],
  }),

  actions: {
    addProductToOrder({
      orderType,
      product,
    }: {
      orderType: OrderType
      product: { id: string; count: number; price: number; name: string }
    }): void {
      const orderToUpdate = this[orderType] as OrderTransformedForEdit | OrderDraft | null

      if (orderToUpdate) {
        orderToUpdate.products.push(product)
      }
    },

    createOrder(): void {
      const userStore = useUserStore()
      const { currentUser } = userStore
      const quantities =
        this.orderBeingCreated?.products.map(({ id, count }: { id: string; count: number }) => ({
          productId: id,
          count,
        })) || []
      const mostRecentOrder = this.orders.reduce((max, order) => {
        return order.attributes.orderNumber > max.attributes.orderNumber ? order : max
      })
      const newNumber = Number(mostRecentOrder.attributes.orderNumber) + 1
      const newOrderNumber = newNumber.toString().padStart(3, '0')
      const mostRecentIdNumber = mostRecentOrder.id.replace('order-', '')
      const newIdNumber = Number(mostRecentIdNumber) + 1
      const id = `order-${newIdNumber.toString().padStart(3, '0')}`

      const relationships = {
        products: {
          data:
            this.orderBeingCreated?.products.map(({ id }: { id: string }) => ({
              id,
              type: 'Product' as ProductResourceType,
            })) || [],
        },
        supplier: {
          data: {
            id: this.orderBeingCreated?.supplierId || '',
            type: 'Company' as CompanyResourceType,
          },
        },
        customer: {
          data: {
            id: currentUser.company.id,
            type: 'Company' as CompanyResourceType,
          },
        },
      }

      const newOrder = {
        id,
        attributes: {
          createdAt: new Date().toString(),
          orderNumber: newOrderNumber,
          status: 'pending' as OrderStatus,
          quantities,
          totalPrice: this.orderBeingCreated?.totalPrice || '0',
        },
        relationships,
        type: 'Order' as OrderResourceType,
      }

      this.orders.unshift(newOrder)
    },

    deleteOrder(orderId: string): void {
      this.orders = this.orders.filter((order) => order.id !== orderId)
    },

    fetchOrders(): void {
      this.orders = response.data as Order[]
    },

    decreaseProductQuantity({
      orderType,
      productId,
    }: {
      orderType: OrderType
      productId: string
    }): void {
      const orderToUpdate = this[orderType]
      const productToUpdate = orderToUpdate?.products.find((product) => product.id === productId)

      if (productToUpdate) {
        productToUpdate.count -= 1
      }
    },

    increaseProductQuantity({
      orderType,
      productId,
    }: {
      orderType: OrderType
      productId: string
    }): void {
      const productToUpdate = this[orderType]?.products.find((product) => product.id === productId)

      if (productToUpdate) {
        productToUpdate.count += 1
      }
    },

    removeProductFromOrder({
      orderType,
      productId,
    }: {
      orderType: OrderType
      productId: string
    }): void {
      const orderToUpdate = this[orderType]

      if (orderToUpdate) {
        orderToUpdate.products.filter((product) => product.id !== productId)
      }
    },

    resetOrderByType(orderType: OrderType): void {
      this[orderType] = null
    },

    setOrderByType({
      orderType,
      order,
    }: {
      orderType: OrderType
      order: OrderTransformedForEdit | OrderDraft
    }): void {
      if (orderType === 'orderBeingEdited') {
        this.orderBeingEdited = order as OrderTransformedForEdit
      }
      if (orderType === 'orderBeingCreated') {
        this.orderBeingCreated = order as OrderDraft
      }
    },

    updateOrder(): void {
      const orderId = this.orderBeingEdited?.id
      const order = this.orders.find((order) => order.id === orderId)

      if (order) {
        const products = this.orderBeingEdited?.products
        const quantities = products
          ?.map((product) => ({ productId: product.id, count: product.count }))
          .filter((quantity) => quantity.count > 0)
        const updatedProductIds = quantities?.map((quantity) => quantity.productId)
        const transformedProducts = {
          data: products
            ?.filter((product) => updatedProductIds?.includes(product.id))
            .map((product) => ({ id: product.id, type: 'Product' })),
        }
        const deTransformedOrder = {
          id: this.orderBeingEdited?.id,
          attributes: {
            ...order.attributes,
            quantities,
            totalPrice: this.orderBeingEdited?.totalPrice,
          },
          relationships: {
            ...order.relationships,
            products: transformedProducts,
          },
          type: 'Order',
        } as Order

        const index = this.orders.findIndex((order) => order.id === orderId)
        if (index !== -1) {
          this.orders[index] = deTransformedOrder
        }
      }
    },

    updateTotalPrice({
      orderType,
      amount,
      operation,
    }: {
      orderType: OrderType
      amount: number
      operation: 'decrease' | 'increase'
    }): void {
      const orderToUpdate = this[orderType]

      if (orderToUpdate) {
        if (typeof orderToUpdate.totalPrice === 'string') {
          orderToUpdate.totalPrice = orderToUpdate.totalPrice.replace(',', '.')
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
    createdOrdersByCurrentUserCompany(state): Order[] {
      const userStore = useUserStore()

      if (!userStore.currentUser?.company?.id) {
        return []
      }

      return state.orders.filter(
        (order) => order.relationships?.customer?.data?.id === userStore.currentUser.company.id,
      )
    },
  },
})
