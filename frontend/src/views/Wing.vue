<template>
  <section class="transition-all duration-500 flex flex-row justify-center">
    <div
      class="relative transition-all transform duration-500 mr-8"
      :class="{ '-translate-x-72': route.params.step > 1 }"
    >
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
      <div class="form-control">
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
      <div class="form-control">
        <label class="label">
          <span class="label-text">Segments</span>
        </label>
        <div
          v-for="seg in wing.segments"
          :key="seg.angle"
          class="card shadow mb-4"
        >
          <div class="p-4">
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
        <div class="btn-group">
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
    <div id="wing-plot"></div>
  </section>
</template>

<script setup>
import { onMounted, reactive, computed, watch, ref } from "vue";
import { useRoute } from "vue-router";
import Plotly from "plotly.js-gl3d-dist-min";
import { profile } from "../components/stub/0009";
import { Camera } from "../components/services/camera";

const route = useRoute();

const wing = reactive({
  chordEnd: 1,
  segments: [
    {
      startChord: 2,
      angle: 10,
      startX: 0,
      startY: 0,
    },
  ],
  span: 10,
});

const addSegment = () => {
  let prevSegment = wing.segments[wing.segments.length - 1];
  let startY = (prevSegment.startY + wing.span / 2) / 2;
  let segment = {
    startY,
    startX: -(
      Math.tan((prevSegment.angle * Math.PI) / 180) *
        (startY - prevSegment.startY) -
      prevSegment.startX
    ),
    startChord: (prevSegment.startChord + wing.chordEnd) / 2,
    angle: prevSegment.angle * 1.25,
  };
  wing.segments.push(segment);

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

const traces = computed(() => {
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

const removeSegment = () => {
  wing.segments.pop();
  Plotly.react("wing-plot", traces.value, layout, options);
};

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
