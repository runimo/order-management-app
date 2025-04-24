<script setup lang="ts">
import { defineProps } from 'vue'

interface NavLink {
  path: string;
  name: string;
}

interface Props {
  navLinks: NavLink[]
}

const { navLinks } = defineProps<Props>()
</script>

<template>
  <nav class="w-full text-base text-center mt-8">
    <RouterLink
      v-for="link in navLinks"
      :key="`navlink:${link.name.toLowerCase()}`"
      activeClass="font-semibold text-violet-700 border-b-2 border-violet-700 hover:text-violet-800 hover:border-violet-800"
      class="inline-block py-2 mx-2"
      :to="link.path">
      {{ link.name }}
    </RouterLink>
  </nav>
</template>