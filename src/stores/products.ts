import { defineStore } from 'pinia'
import { useUserStore } from './user'
import response from '@/mocks/products.json'
import type {
  Product,
  ProductDraft
} from '@/types/index.d.ts'

export const useProductsStore = defineStore('products', {
    state: () => ({
      products: [] as Product[]
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

      fetchProducts (): void {
        this.products = response.data as Product[]
      },

      updateProduct (product: ProductDraft): void {
        const productToUpdate = this.products.find(el => el.id === product.id)
        const { id, name, price, stock } = product
        
        if (productToUpdate) {
          const { relationships, type } = productToUpdate
          const updatedProduct = {
            id,
            attributes: {
              name,
              price,
              stock
            },
            relationships,
            type
          } as Product

          const index = this.products.findIndex(el => el.id === product.id)
          if (index !== -1) {
            this.products[index] = updatedProduct
          }
        }
      }
    },

    getters: {
      productById: (state) => {
        return (productId: string): Product | null => {
          return state.products.find(product => product.id === productId) || null
        }
      },

      productsByCompanyId (state) {
        return (companyId: string): Product[] => {
          return state.products.filter(product => product.relationships.supplier.data.id === companyId)
        }
      },

      productsByCurrentUserCompany (state): Product[] {
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