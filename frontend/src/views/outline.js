import { reactive } from "vue";

export const wing = reactive({
  shape: "rectangular",
  chordEnd: 1,
  chordRect: 2,
  segments: [
    {
      id: 0,
      startChord: 2,
      angle: 10,
      startX: 0,
      startY: 0,
    },
  ],
  span: 10,
});
