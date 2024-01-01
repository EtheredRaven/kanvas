<template>
  <div
    class="sp-sidebar"
    :class="{ 'sp-opened': opened, 'sp-mob-opened': mobOpened }"
  >
    <div class="sp-hamburger sp-shadow" v-on:click="toggleMobOpen">
      <div class="sp-icon icon-Hamburger"></div>
    </div>
    <div class="sp-sidebar__header" v-if="$slots.header">
      <slot name="header"></slot>
    </div>
    <div class="sp-sidebar__content">
      <slot></slot>
    </div>
    <div class="sp-sidebar__footer">
      <slot name="footer"></slot>
    </div>
    <div
      class="sidebar-touchzone"
      id="touchZone"
      @touchstart="touchStarted"
      @touchmove="touchMove"
    />
  </div>
</template>
<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "SidebarInside",
  data: function () {
    return {
      opened: true,
      mobOpened: false,
      touchStartPos: false,
    };
  },
  emits: ["sidebar-open", "sidebar-close"],
  methods: {
    toggleOpen: function () {
      this.opened = !this.opened;
      this.opened ? this.$emit("sidebar-open") : this.$emit("sidebar-close");
    },
    toggleMobOpen: function () {
      this.mobOpened = !this.mobOpened;
    },
    touchStarted: function (e) {
      // Get position of the touch start and store it
      this.touchStartPos = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    },
    touchMove: function (e) {
      if (!this.touchStartPos) return;

      // Get the touch move position so that we can calculate the difference with the start position
      const touchEndPos = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };

      let diff = this.touchStartPos.x - touchEndPos.x;
      // If swipe left, close the menu
      if (diff > 80) {
        this.opened = false;
        this.mobOpened = false;
        this.$emit("sidebar-close");
        this.touchStartPos = false;
      }

      // If swipe right, open the menu
      if (diff < -80) {
        this.opened = true;
        this.mobOpened = true;
        this.$emit("sidebar-open");
        this.touchStartPos = false;
      }
    },
  },
});
</script>

<style>
.sidebar-touchzone {
  bottom: 0;
  right: -60px;
  height: calc(100vh - 100px);
  width: 60px;
  position: absolute;
}
</style>
