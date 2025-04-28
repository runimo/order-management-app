<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavBar from '@/components/NavBar.vue'

const navLinks = [
  {
    path: '/orders',
    name: 'Orders',
  },
  {
    path: '/products',
    name: 'Products',
  },
]
</script>

<template>
  <header class="flex leading-loose max-h-screen">
    <div class="flex justify-center w-full items-start flex-wrap mb-8">
      <NavBar :navLinks="navLinks" />
    </div>
    <div class="flex items-center">
      <img
        src="./assets/ashley-nicole-sVRW9DaK9ew-unsplash.jpg"
        alt="User Photo"
        title="You are logged in as User Name (Company 001)"
        class="w-[52px] sm:w-12 h-12 rounded-full object-cover shadow-lg relative top-[-40px]"
      />
    </div>
  </header>

  <RouterView />
</template>
