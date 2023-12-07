<template>
  <div class="zoomLevel">
    <img
      src="../../public/img/magnifier.svg"
      alt="magnifier"
      class="magnifier"
    />
    x {{ zoomLevel.toFixed(1) }}
  </div>
</template>

<script>
export default {
  computed: {
    zoomLevel() {
      return this.$store.state.zoomLevel;
    },
  },
  methods: {
    changeZoomLevel(newZoomLevel) {
      this.zoomLevel = newZoomLevel;
    },
  },
};
</script>

<style>
.zoomLevel {
  position: absolute;
  left: 2rem;
  bottom: 2rem;
  text-align: left;
  line-height: 1.5rem;
  padding: 0.7rem 1rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 0.8rem 1.6rem -0.3rem rgba(140, 148, 159, 0.15);
}

.magnifier {
  width: 14px;
  margin-bottom: -3px;
  margin-right: 1px;
}
</style>
