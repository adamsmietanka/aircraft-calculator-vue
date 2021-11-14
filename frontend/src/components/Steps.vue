<template>
  <ul class="w-full steps mb-8" v-if="appSteps">
    <li
      v-for="step in appSteps"
      :key="step.id"
      class="step cursor-pointer"
      :class="{ 'step-primary': route.params.step >= step.id }"
      @click="router.push({ params: { step: step.id } })"
    >
      {{ step.title }}
    </li>
  </ul>
  <button
    class="btn fixed left-80 bottom-5"
    v-if="route.params.step > 1"
    @click="router.push({ params: { step: parseInt(route.params.step) - 1 } })"
  >
    Previous
  </button>
  <button
    class="btn fixed right-8 bottom-5"
    v-if="route.params.step < appSteps?.length"
    @click="router.push({ params: { step: parseInt(route.params.step) + 1 } })"
  >
    Next
  </button>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import steps from "../views/steps";

const route = useRoute();
const router = useRouter();

let appSteps = ref([]);

watch(
  () => route.name,
  (newValue) => {
    appSteps.value = steps.filter((s) => s.type === newValue)[0]?.steps;
  }
);
</script>
