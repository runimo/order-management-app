import { defineStore } from 'pinia'
import { useUserStore } from './user'
import response from '@/mocks/products.json'

export const useProductsStore = defineStore('products', {
    state: () => ({
      products: []
    }),

    actions: {
      createProduct ({ name, price, stock}: {name: string, price: number, stock: number}): void {
        const userStore = useUserStore()
        const { currentUser } = userStore
        const lastItemIdx = this.products.length - 1
        const lastItemId = this.products[lastItemIdx].id
        const id = lastItemId + 1

        this.products.unshift({
          id,
          attributes: {
            name,
            price,
            stock
          },
          type: 'Product',
          relationships: {
            supplier: {
              data: {
                type: 'Company',
                id: currentUser.company.id
              }
            }
          }
        })
      },

      deleteProduct (productId: string): void {
        this.products = this.products.filter(product => product.id !== productId)
      },

      fetchProducts () {
        this.products = response.data
      }
    },

    getters: {
      productById: (state) => {
        return (productId: string) => {
          return state.products.find(product => product.id === productId) || null
        }
      },

      productsByCompanyId (state) {
        return (companyId: string) => {
          return state.products.filter(product => product.relationships.supplier.data.id === companyId)
        }
      },

      productsByCurrentUserCompany (state) {
        const userStore = useUserStore()
        const { currentUser } = userStore

        if (!currentUser?.company?.id) {
          return []
        }

        return state.products.filter(product =>
          product.relationships?.supplier?.data?.id === userStore.currentUser.company.id
        )
      }
    }
})