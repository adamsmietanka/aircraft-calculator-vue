<template>
  <nav class="fixed left-0 inset-y-0 w-72 z-50 bg-gray-100">
    <button
      v-for="r in routes"
      :key="r"
      class="btn btn-block"
      :class="{ 'btn-ghost': route.name !== r }"
      @click="moveTo(r)"
    >
      {{ r }}
    </button>
  </nav>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const routes = ["Home", "Wing", "Performance"];

const moveTo = (route) => {
  route === "Home"
    ? router.push({ name: route })
    : router.push({ name: route, params: { step: 1 } });
};
</script>
