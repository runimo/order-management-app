import { defineStore } from 'pinia'
import { useUserStore } from './user'
import response from '@/mocks/companies.json'

export const useCompaniesStore = defineStore('companies', {
    state: () => ({
      companies: []
    }),

    actions: {
      fetchCompanies () {
        this.companies = response.data
      }
    },

    getters: {
      availableCompanies (state) {
        const userStore = useUserStore()
        const { currentUser } = userStore

        return state.companies
          .filter(company => company.id !== currentUser.company.id)
          .filter(company => company.relationships.products.data.length > 0)
      }
    }
})
