<script>
export default {
  props: {
    showBar: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      gameWidth: window.innerWidth,
      manaBarWidth: window.innerWidth / 4,
      updatedManaAmount: 0,
      maxMana: 0,
      updatedPixelsAmount: 0,
      maxPixels: 0,
      updatingInterval: null,
    };
  },
  computed: {
    currentAccountAddress() {
      return this.$store.state.activeAccount?.address;
    },
    manaProgress() {
      // Used for the width of the mana bar
      return this.maxMana && this.maxMana > 0
        ? (this.updatedManaAmount / this.maxMana) * 100
        : 100;
    },
    pixelsProgress() {
      return this.maxPixels && this.maxPixels > 0
        ? ((this.maxPixels - this.updatedPixelsAmount) / this.maxPixels) * 100
        : 100;
    },
    manaBarStyle() {
      // Style of the mana bar, position it at the center of the game canvas
      return `
        width: ${this.manaBarWidth}px;
        position: absolute;
        bottom: 12px;
        left: ${(this.gameWidth - this.manaBarWidth) / 2}px;
        background-color: rgb(200,200,200);
        border-radius: 6px;
        padding: 4px 8px;
        height: 20px;
        box-shadow: 0 0.8rem 1.6rem -0.3rem rgba(140, 148, 159, 0.15);
      `;
    },
    pixelsBarStyle() {
      return `
        bottom: 36px;
      `;
    },
    progressManaBarStyle() {
      // The mana amount progress inside the mama bar, adjust it according to the percentage of refilled mana
      return `
        background: #6F00F6;
        width: ${this.manaProgress}%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        border-radius: 6px;
      `;
    },
    progressPixelsBarStyle() {
      return `
        background: #F6006F;
        width: ${this.pixelsProgress}%;
      `;
    },
  },
  watch: {
    currentAccountAddress: function () {
      this.computeMana();
      this.computePixels(false);
    },
  },
  methods: {
    preventNextClick() {
      this.$store.commit("preventNextClick", true);
    },
    computeMana() {
      this.computeMaxMana();
      this.computeUpdatedManaAmount();
    },
    async computeMaxMana() {
      if (!this.currentAccountAddress) return;
      this.maxMana = await this.$store.getters.getKoinBalance(
        this.currentAccountAddress
      );
    },
    async computeUpdatedManaAmount() {
      if (!this.currentAccountAddress) return;
      this.updatedManaAmount = await this.$store.getters.getMana(
        this.currentAccountAddress
      );
    },
    async computeMaxPixels(cache = true) {
      if (!this.currentAccountAddress) return;
      this.maxPixels = await this.$store.getters.getTokenBalance(
        this.currentAccountAddress,
        cache
      );
    },
    async computeUpdatedPixelsAmount(cache) {
      if (!this.currentAccountAddress) return;
      this.updatedPixelsAmount = await this.$store.getters.getPixelsAmount(
        this.$store.state.activeAccount,
        cache
      );
    },
    computePixels(cache = true) {
      this.computeMaxPixels(cache);
      this.computeUpdatedPixelsAmount(cache);
    },
    formatValue(val) {
      return Math.max(0, Math.floor(100 * val) / 100);
    },
  },
  created() {
    // Recompute the mana amount locally every 200ms
    this.updatingInterval = setInterval(() => {
      this.computeMana();
      this.computePixels();
    }, 1000);
  },
  beforeUnmount() {
    // Clear the interval
    clearInterval(this.updatingInterval);
    this.updatingInterval = null;
    delete this.updatingInterval;
  },
};
</script>

<template>
  <div v-if="showBar && currentAccountAddress" @click="preventNextClick">
    <div :style="manaBarStyle + pixelsBarStyle">
      <div :style="progressManaBarStyle + progressPixelsBarStyle"></div>
      <div class="manaAmount">
        {{ formatValue(maxPixels - updatedPixelsAmount) }} /
        {{ formatValue(maxPixels) }} PIXELS
      </div>
    </div>
    <div :style="manaBarStyle">
      <div :style="progressManaBarStyle"></div>
      <div class="manaAmount">
        {{ formatValue(updatedManaAmount) }} / {{ formatValue(maxMana) }} MANA
      </div>
    </div>
  </div>
</template>

<style>
.manaAmount {
  width: 100%;
  text-align: center;
  position: absolute;
  top: 5px;
  left: 0;
  color: white;
  white-space: nowrap;
}
</style>
