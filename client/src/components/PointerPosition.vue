<template>
  <div class="pointerPosition" @click="preventNextClick">
    {{ formatPos(pointerX) }} ; {{ formatPos(pointerY) }}
  </div>
</template>
<script>
import { defineComponent } from "vue";
export default defineComponent({
  name: "PointerPosition",
  props: {
    pointerX: Number,
    pointerY: Number,
  },
  methods: {
    preventNextClick() {
      this.$store.commit("preventNextClick", true);
    },
    formatPos(x) {
      return Math.floor(x);
    },
  },
});
</script>

<style>
.pointerPosition {
  position: absolute;
  right: 2rem;
  bottom: 2rem;
}
</style>
