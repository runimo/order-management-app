import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: {
      id: 'user-001',
      name: 'User Name',
      company: {
        id: 'company-001',
        name: 'Company 001'
      }
    }
  })
})