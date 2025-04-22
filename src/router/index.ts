import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import OrdersList from '@/components/OrdersList.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/orders'
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
      children: [
        {
          path: '/orders',
          name: 'orders',
          component: OrdersList,
        },
        {
          path: '/products',
          name: 'products',
          component: () => import('../components/ProductsList.vue'),
        }
      ]
    }
  ]
})

export default router
