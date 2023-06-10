<template>
  <div class="sp-layout">
    <slot name="sidebar"></slot>
    <div class="sp-fill">
      <slot name="content"></slot>
    </div>
  </div>
</template>
<script>
import { defineComponent } from "vue";
export default defineComponent({
  name: "Layout",
});
</script>
