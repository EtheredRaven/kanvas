<template>
  <router-link
    :to="link"
    v-if="link"
    class="sp-button"
    :class="[busy ? 'sp-button__progress' : '', 'sp-button-' + type]"
    :disabled="disabled"
  >
    <span class="sp-button__text"><slot></slot></span>
    <div class="sp-button__loading">
      <div class="sp-icon icon-Reload"></div>
    </div>
  </router-link>
  <a
    :href="href"
    v-else-if="href"
    class="sp-button"
    :class="[busy ? 'sp-button__progress' : '', 'sp-button-' + type]"
    :disabled="disabled"
    :target="target"
  >
    <span class="sp-button__text"><slot></slot></span>
    <div class="sp-button__loading">
      <div class="sp-icon icon-Reload"></div>
    </div>
  </a>
  <button
    type="button"
    v-else
    class="sp-button"
    :class="[busy ? 'sp-button__progress' : '', 'sp-button-' + type]"
    :disabled="disabled"
    :style="style"
  >
    <span class="sp-button__text"><slot></slot></span>
    <div class="sp-button__loading">
      <div class="sp-icon icon-Reload"></div>
    </div>
  </button>
</template>
<script>
import { defineComponent } from "vue";
export default defineComponent({
  name: "KanvasButton",
  props: {
    busy: {
      type: Boolean,
    },
    link: {
      type: String,
    },
    href: {
      type: String,
    },
    target: {
      type: String,
    },
    type: {
      type: String,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    bgColor: {
      type: String,
    },
    additionalStyle: {
      type: String,
    },
  },
  computed: {
    style() {
      return this.bgColor
        ? "background:" + this.bgColor
        : ";" + this.additionalStyle;
    },
  },
});
</script>
