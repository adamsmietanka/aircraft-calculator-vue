<template>
  <section class="transition-all duration-500 flex flex-row justify-center">
    <div class="relative mr-8">
      <div
        class="relative transition-all transform duration-500 p-2"
        :class="{ '-translate-x-400': route.params.step > 1 }"
      >
        <div class="form-control">
          <label class="label">
            <span class="label-text">Wing type</span>
          </label>
          <label class="cursor-pointer label justify-start">
            <input
              type="radio"
              v-model="wing.shape"
              @change="Plotly.react('wing-plot', traces, layout, options)"
              class="radio radio-sm mr-1"
              value="rectangular"
            />
            <span class="label-text">Rectangular</span>
          </label>
          <label class="cursor-pointer label justify-start">
            <input
              type="radio"
              v-model="wing.shape"
              @change="Plotly.react('wing-plot', traces, layout, options)"
              class="radio radio-sm mr-1"
              value="trapezoidal"
            />
            <span class="label-text">Trapezoidal</span>
          </label>
          <label class="cursor-pointer label justify-start">
            <input
              type="radio"
              v-model="wing.shape"
              @change="Plotly.react('wing-plot', traces, layout, options)"
              class="radio radio-sm mr-1"
              value="elliptical"
            />
            <span class="label-text">Elliptical</span>
          </label>
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">Wingspan</span>
          </label>
          <input
            type="number"
            step="0.2"
            class="input input-bordered"
            v-model="wing.span"
            @change="Plotly.react('wing-plot', traces, layout, options)"
          />
        </div>
        <div class="form-control" v-if="wing.shape === 'trapezoidal'">
          <label class="label">
            <span class="label-text">Tip chord</span>
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            class="input input-bordered"
            v-model="wing.chordEnd"
            @change="Plotly.react('wing-plot', traces, layout, options)"
          />
        </div>
        <div class="form-control" v-if="wing.shape === 'rectangular'">
          <label class="label">
            <span class="label-text">Chord</span>
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            class="input input-bordered"
            v-model="wing.chordRect"
            @change="Plotly.react('wing-plot', traces, layout, options)"
          />
        </div>
        <div
          class="form-control transition-all transform duration-500"
          :class="{
            'translate-x-0':
              route.params.step === '1' && wing.shape === 'trapezoidal',
            '-translate-x-400':
              wing.shape !== 'trapezoidal' || route.params.step !== '1',
          }"
        >
          <label class="label">
            <span class="label-text">Segments</span>
          </label>
          <div id="segments" class="overflow-y-scroll max-h-100 mb-4 -mt-3 p-1">
            <div
              v-for="seg in wing.segments"
              :key="seg.angle"
              class="card shadow my-2"
            >
              <div class="p-4">
                <h3>{{ segmentLabel(seg.id) }}</h3>
                <div class="form-control" v-if="seg.startY">
                  <label class="label">
                    <span class="label-text">Start</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    class="input input-sm input-bordered"
                    v-model="seg.startY"
                    @change="Plotly.react('wing-plot', traces, layout, options)"
                  />
                </div>
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">Start chord</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    class="input input-sm input-bordered"
                    v-model="seg.startChord"
                    @change="Plotly.react('wing-plot', traces, layout, options)"
                  />
                </div>
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">Angle</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    class="input input-sm input-bordered"
                    v-model="seg.angle"
                    @change="Plotly.react('wing-plot', traces, layout, options)"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="btn-group w-full">
            <button
              class="btn btn-sm btn-success"
              v-if="wing.segments.length < 5"
              @click="addSegment"
            >
              Add
            </button>
            <button
              class="btn btn-sm btn-error"
              v-if="wing.segments.length > 1"
              @click="removeSegment"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
      <WingAirfoils
        class="absolute inset-0 p-2 transition-all transform duration-500"
        :class="{
          'translate-x-0': route.params.step === '2',
          '-translate-x-400': route.params.step !== '2',
        }"
      />
    </div>
    <div id="wing-plot"></div>
  </section>
</template>

<script setup>
import { onMounted, reactive, computed, watch, ref, onUpdated } from "vue";
import { useRoute } from "vue-router";
import Plotly from "plotly.js-gl3d-dist-min";
import { profile } from "../components/stub/0009";
import { Camera } from "../components/services/camera";
import { wing } from "./outline";
import WingAirfoils from "./WingAirfoils.vue";
import { bezierEasier } from "../components/services/interp";

const segmentLabel = (i) => {
  if (i === 0) {
    return "Fuselage segment";
  } else if (i + 1 === wing.segments.length) {
    return "Tip segment";
  } else {
    return `Segment #${i + 1}`;
  }
};

const scrollToBottom = async () => {
  let FRAME_NUMBER = 30;
  let segments = document.getElementById("segments");
  let { scrollTop: start } = segments;
  let end = segments.scrollHeight - segments.offsetHeight + 260;
  for (let i = 0; i <= FRAME_NUMBER; i++) {
    let mu = i / FRAME_NUMBER;
    await new Promise((r) => setTimeout(r, 500 / FRAME_NUMBER));
    segments.scrollTop = bezierEasier(start, end, mu);
  }
};

const scrollUp = async () => {
  let FRAME_NUMBER = 30;
  let segments = document.getElementById("segments");
  let { scrollTop: start } = segments;
  let end = segments.scrollHeight - segments.offsetHeight - 260;
  for (let i = 0; i <= FRAME_NUMBER; i++) {
    let mu = i / FRAME_NUMBER;
    await new Promise((r) => setTimeout(r, 400 / FRAME_NUMBER));
    segments.scrollTop = bezierEasier(start, end, mu);
  }
};

const addSegment = () => {
  let prevSegment = wing.segments[wing.segments.length - 1];
  let startY = (prevSegment.startY + wing.span / 2) / 2;
  let segment = {
    id: wing.segments.length,
    startY,
    startX: -(
      Math.tan((prevSegment.angle * Math.PI) / 180) *
        (startY - prevSegment.startY) -
      prevSegment.startX
    ),
    startChord: (prevSegment.startChord + wing.chordEnd) / 2,
    angle: prevSegment.angle * 1.25,
  };
  scrollToBottom();
  wing.segments.push(segment);
  Plotly.react("wing-plot", traces.value, layout, options);
};

const removeSegment = async () => {
  await scrollUp();
  wing.segments.pop();
  Plotly.react("wing-plot", traces.value, layout, options);
};

const calculateSection = (x, y, chord) => ({
  x: profile[0].map((i) => i * -chord + x),
  y: Array(profile[0].length).fill(y),
  z: profile[1].map((i) => i * -chord),
  type: "scatter3d",
  mode: "lines",
  marker: { color: "black" },
});

const calculateLeading = (seg) => ({
  x: [...Array(11).keys()].map(
    (x) => (x * (seg.endX - seg.startX)) / 10 + seg.startX
  ),
  y: [...Array(11).keys()].map(
    (y) => (y * (seg.endY - seg.startY)) / 10 + seg.startY
  ),
  z: Array(11).fill(0),
  type: "scatter3d",
  mode: "lines",
  marker: { color: "black" },
});

const calculateTrailing = (seg) => ({
  x: [...Array(11).keys()].map(
    (x) =>
      (x * (seg.endX - seg.endChord - (seg.startX - seg.startChord))) / 10 +
      seg.startX -
      seg.startChord
  ),
  y: [...Array(11).keys()].map(
    (y) => (y * (seg.endY - seg.startY)) / 10 + seg.startY
  ),
  z: Array(11).fill(0),
  type: "scatter3d",
  mode: "lines",
  marker: { color: "black" },
});

const tip = computed(() => {
  let lastSeg = wing.segments[wing.segments.length - 1];
  return {
    x:
      -Math.tan((lastSeg.angle * Math.PI) / 180) *
        (wing.span / 2 - lastSeg.startY) +
      lastSeg.startX,
    y: wing.span / 2,
    chord: wing.chordEnd,
  };
});

const trapezoidTraces = computed(() => {
  let traces = [];
  let prevSegment = { endY: 0, endX: 0, endChord: wing.segments[0].startChord };
  for (let i = 0; i < wing.segments.length; i++) {
    let seg = wing.segments[i];
    let nextSeg = wing.segments[i + 1];
    seg.startX = prevSegment.endX;
    seg.startY = prevSegment.endY;
    seg.startChord = prevSegment.endChord;
    seg.endY = i === wing.segments.length - 1 ? tip.value.y : nextSeg.startY;
    seg.endX = -(
      Math.tan((seg.angle * Math.PI) / 180) * (seg.endY - prevSegment.endY) -
      prevSegment.endX
    );
    seg.endChord =
      i === wing.segments.length - 1 ? tip.value.chord : nextSeg.startChord;
    traces.push(calculateLeading(seg));
    traces.push(calculateTrailing(seg));
    traces.push(calculateSection(seg.startX, seg.startY, seg.startChord));
    prevSegment = seg;
  }
  traces.push(calculateSection(tip.value.x, tip.value.y, tip.value.chord));
  return traces;
});

const rectTraces = computed(() => {
  let traces = [];
  traces.push({
    x: [0, 0],
    y: [0, wing.span / 2],
    z: [0, 0],
    type: "scatter3d",
    mode: "lines",
    marker: { color: "black" },
  });
  traces.push({
    x: [-wing.chordRect, -wing.chordRect],
    y: [0, wing.span / 2],
    z: [0, 0],
    type: "scatter3d",
    mode: "lines",
    marker: { color: "black" },
  });
  traces.push(calculateSection(0, 0, wing.chordRect));
  traces.push(calculateSection(0, wing.span / 2, wing.chordRect));
  return traces;
});

const traces = computed(() => {
  if (wing.shape === "rectangular") {
    return rectTraces.value;
  } else {
    return trapezoidTraces.value;
  }
});

const route = useRoute();

const layout = reactive({
  title: "Wing contour",
  showlegend: false,
  font: { size: 12 },
  height: 300,
  width: 600,
  margin: {
    l: 0,
    r: 0,
    b: 0,
    t: 50,
    pad: 4,
  },
  scene: {
    aspectmode: "data",
    dragmode: false,
    camera: {
      eye:
        route.params.step === "1"
          ? { x: 0.01, y: 0, z: 0.5 }
          : { x: 1.5, y: 1.5, z: 0.75 },
      projection: { type: "orthographic" },
    },
    zaxis: {
      autorange: true,
      showgrid: false,
      zeroline: false,
      showline: false,
      autotick: true,
      ticks: "",
      showticklabels: false,
    },
  },
});

const options = {
  scrollZoom: false,
  responsive: true,
  modeBarButtons: [["toImage"]],
  toImageButtonOptions: {
    format: "png",
    filename: "engine_power",
  },
};

onMounted(() => {
  Plotly.newPlot("wing-plot", traces.value, layout, options);
});

const camera = new Camera("wing-plot", layout);

const lockCamera = () => {
  layout.scene.dragmode = false;
};

const unlockCamera = () => {
  layout.scene.dragmode = "turntable";
};

watch(
  () => route.params.step,
  (step) => {
    let target =
      step === "1" ? { x: 0.01, y: 0, z: 1.5 } : { x: 1.5, y: 1.5, z: 0.75 };
    camera.animate(target);
    step === "1" ? lockCamera() : unlockCamera();
  }
);
</script>

<style scoped>
.-translate-x-400 {
  --tw-translate-x: -100rem;
}
.max-h-100 {
  max-height: 25rem;
}
</style>
