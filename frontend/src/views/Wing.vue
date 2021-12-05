<template>
  <section class="transition-all duration-500">
    <div
      class="relative transition-all transform duration-500"
      :class="{ '-translate-x-72': route.params.step > 1 }"
    >
      <div class="form-control">
        <label class="label">
          <span class="label-text">Fuselage chord</span>
        </label>
        <input
          type="number"
          step="0.1"
          class="input input-bordered"
          v-model="wing.chordStart"
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
          <span class="label-text">Angle</span>
        </label>
        <input
          type="number"
          class="input input-bordered"
          v-model="wing.angle"
          @change="Plotly.react('wing-plot', traces, layout, options)"
        />
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">Segments</span>
        </label>
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
            v-if="wing.segments.length"
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
  chordStart: 2,
  chordEnd: 1,
  segments: [],
  span: 10,
  angle: 10,
});

const tipLeading = computed(
  () => -(Math.tan((wing.angle * Math.PI) / 180) * wing.span) / 2
);

const tipTrailing = computed(() => tipLeading.value - wing.chordEnd);

const sectionFuse = computed(() => ({
  x: profile[0].map((x) => x * -wing.chordStart),
  y: Array(profile[0].length).fill(0),
  z: profile[1].map((z) => z * wing.chordStart),
  type: "scatter3d",
  mode: "lines",
}));

const sectionTip = computed(() => ({
  x: profile[0].map((x) => x * -wing.chordEnd + tipLeading.value),
  y: Array(profile[0].length).fill(wing.span / 2),
  z: profile[1].map((z) => z * wing.chordEnd),
  type: "scatter3d",
  mode: "lines",
}));

const leading = computed(() => ({
  x: [...Array(11).keys()].map((x) => (x * tipLeading.value) / 10),
  y: [...Array(11).keys()].map((y) => (y * wing.span) / 2 / 10),
  z: Array(11).fill(0),
  type: "scatter3d",
  mode: "lines",
}));

const trailing = computed(() => ({
  x: [...Array(11).keys()].map(
    (x) => (x * (wing.chordStart + tipTrailing.value)) / 10 - wing.chordStart
  ),
  y: [...Array(11).keys()].map((y) => (y * wing.span) / 2 / 10),
  z: Array(11).fill(0),
  type: "scatter3d",
  mode: "lines",
}));

const addSegment = () => {
  let prevSegment = wing.segments.length
    ? wing.segments[wing.segments.length - 1]
    : { startY: 0, startX: 0, startChord: wing.chordStart, angle: wing.angle };
  let startY = (prevSegment.startY + wing.span / 2) / 2;
  let segment = {
    startY,
    startX: -(Math.tan((prevSegment.angle * Math.PI) / 180) * startY),
    startChord: (prevSegment.startChord + wing.chordEnd) / 2,
    angle: prevSegment.angle * 1,
  };
  wing.segments.push(segment);

  Plotly.react("wing-plot", traces.value, layout, options);
};

const calculateSection = (seg) => ({
  x: profile[0].map((x) => x * -seg.startChord + seg.startX),
  y: Array(profile[0].length).fill(seg.startY),
  z: profile[1].map((z) => z * -seg.startChord),
  type: "scatter3d",
  mode: "lines",
  marker: { color: "black" },
});

const calculateLeading = (seg) => ({
  x: profile[0].map((x) => x * -seg.startChord + seg.startX),
  y: Array(profile[0].length).fill(seg.startY),
  z: profile[1].map((z) => z * -seg.startChord),
  type: "scatter3d",
  mode: "lines",
  marker: { color: "black" },
});

const segmentSections = computed(() => {
  let sections = [];
  wing.segments.forEach((seg) => {
    sections.push(calculateSection(seg));
  });
  return sections;
});

const removeSegment = () => {
  wing.segments.pop();
  Plotly.react("wing-plot", traces.value, layout, options);
};

const traces = computed(() => {
  let basic = [sectionFuse.value, sectionTip.value];
  wing.segments.length
    ? basic.push(...segmentSections.value)
    : basic.push(leading.value, trailing.value);
  return basic;
});

// const aspectratio = computed(() => ({
//   x: 1,
//   y: wing.span / 2 / Math.max(wing.chordStart, -tipTrailing.value),
//   z:
//     (wing.chordStart * (Math.max(...profile[1]) - Math.min(...profile[1]))) /
//     Math.max(wing.chordStart, -tipTrailing.value),
// }));

const aspectratio = computed(() => ({
  x: (2 * Math.max(wing.chordStart, -tipTrailing.value)) / (wing.span / 2),
  y: 2,
  z:
    (2 *
      (wing.chordStart * (Math.max(...profile[1]) - Math.min(...profile[1])))) /
    (wing.span / 2),
}));

const layout = reactive({
  title: "Wing contour",
  showlegend: false,
  font: { size: 12 },
  height: 500,
  width: 800,
  margin: {
    l: 0,
    r: 0,
    b: 0,
    t: 50,
    pad: 4,
  },
  scene: {
    aspectmode: "manual",
    aspectratio: aspectratio.value,
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
  scrollZoom: true,
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

watch(aspectratio, (newValue) => {
  layout.scene.aspectratio = newValue;
});

const camera = new Camera("wing-plot", layout);

watch(
  () => route.params.step,
  (newValue) => {
    let target =
      newValue === "1"
        ? { x: 0.01, y: 0, z: 1.5 }
        : { x: 1.5, y: 1.5, z: 0.75 };
    camera.animate(target);
  }
);
</script>

<!-- <script>
import axios from "axios";
import Plotly from "plotly.js-gl3d-dist-min";
import NumberField from "@/components/NumberField";
import { mapMutations, mapState } from "vuex";

export default {
  computed: {
    selected_airfoil: {
      get() {
        return this.$store.state.wing.selected_airfoil;
      },
      set(value) {
        return this.$store.commit("SET_AIRFOIL", value);
      },
    },
  mounted() {
    Plotly.newPlot("wing-plot", this.traces, this.layout, this.options);
  },
  async created() {
    const choices = await axios.get("http://localhost:5000/airfoils");
    const airfoil = await axios.get("http://localhost:5000/airfoil", {
      params: { airfoil: this.selected_airfoil },
    });
    this.airfoils = choices.data;
    this.profile = airfoil.data;
  },
  watch: {
    traces() {
      Plotly.react("wing-plot", this.traces, this.layout, this.options);
    },
    async selected_airfoil() {
      const airfoil = await axios.get("http://localhost:5000/airfoil", {
        params: { airfoil: this.selected_airfoil },
      });
      this.profile = airfoil.data;
    },
    profile() {
      Plotly.react("wing-plot", this.traces, this.layout, this.options);
    },
  },
};
</script> -->

<style scoped>
section {
  display: flex;
  flex-direction: row;
  justify-content: center;
}
.form {
  display: flex;
  flex-direction: column;
  width: 250px;
}
</style>
