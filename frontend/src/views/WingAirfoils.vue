<template>
  <div>
    <div
      v-for="seg in wing.segments"
      :key="seg.angle"
      class="form-control w-full max-w-xs"
    >
      <label class="label">
        <span class="label-text">{{ airfoilLabel(seg.id) }}</span>
      </label>
      <select class="select select-bordered w-full max-w-xs">
        <option selected="selected">0009</option>
      </select>
    </div>
    <div class="form-control w-full max-w-xs">
      <label class="label">
        <span class="label-text">Tip airfoil</span>
      </label>
      <select class="select select-bordered w-full max-w-xs">
        <option selected="selected">0009</option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { wing } from "./outline";

const airfoilLabel = (i) => (i === 0 ? "Fuselage airfoil" : `Airfoil #${i}`);
</script>
