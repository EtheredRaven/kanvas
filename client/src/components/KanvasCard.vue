<template>
  <router-link
    class="sp-card"
    :class="'sp-card-' + type"
    v-if="link"
    :to="link"
  >
    <div class="sp-card__icon">
      <span class="sp-icon" :class="'icon-' + icon" />
    </div>
    <div class="sp-card__text">
      <slot></slot>
    </div>
  </router-link>
  <button
    class="sp-card"
    :class="'sp-card-' + type"
    v-else
    :style="additionalStyle"
  >
    <div class="sp-card__icon">
      <span class="sp-icon" :class="'icon-' + icon" />
    </div>
    <div class="sp-card__text">
      <slot></slot>
    </div>
  </button>
</template>
<script>
import { defineComponent } from "vue";
export default defineComponent({
  name: "KanvasCard",
  props: {
    type: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      reequired: true,
    },
    link: {
      type: String,
    },
    additionalStyle: {
      type: String,
    },
  },
});
</script>
