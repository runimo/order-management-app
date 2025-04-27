import { defineStore } from 'pinia'
import { useUserStore } from './user'
import response from '@/mocks/companies.json'
import type { Company } from '@/types/index.d.ts'

export const useCompaniesStore = defineStore('companies', {
    state: () => ({
      companies: [] as Company[]
    }),

    actions: {
      fetchCompanies () {
        this.companies = response.data as Company[]
      }
    },

    getters: {
      availableCompanies (state): Company[] {
        const userStore = useUserStore()
        const { currentUser } = userStore

        return state.companies
          .filter(company => company.id !== currentUser.company.id)
          .filter(company => company.relationships.products.data.length > 0)
      }
    }
})
