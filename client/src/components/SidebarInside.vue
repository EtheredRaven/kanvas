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
  },
});
</script>
