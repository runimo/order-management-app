<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavBar from '@/components/NavBar.vue'

const navLinks = [
    {
      path: '/orders',
      name: 'Orders'
    },
    {
      path: '/products',
      name: 'Products'
    }
  ]
</script>

<template>
  <header class="flex justify-center leading-loose max-h-screen">
    <div class="flex items-start flex-wrap mb-8">
      <NavBar :navLinks="navLinks" />
    </div>
  </header>

  <RouterView />
</template>
