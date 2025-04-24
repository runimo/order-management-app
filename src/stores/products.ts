import { defineStore } from 'pinia'
import { useUserStore } from './user'
import response from '@/mocks/products.json'

const userStore = useUserStore()
const { currentUser } = userStore

export const useProductsStore = defineStore('products', {
    state: () => ({
      products: []
    }),

    actions: {
      createProduct ({ name, price, stock}: {name: string, price: number, stock: number}): void {
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

      fetchProducts () {
        this.products = response.data
      }
    },

    getters: {
      productsByCurrentUserCompany(state) {
        if (!currentUser?.company?.id) {
          return []
        }

        return state.products.filter(product =>
          product.relationships?.supplier?.data?.id === userStore.currentUser.company.id
        )
      }
    }
})