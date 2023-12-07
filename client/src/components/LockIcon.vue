<template>
  <span
    class="sp-icon lockIcon"
    v-on:click="clickFunction"
    style="position: relative"
  >
    <span
      class="sp-icon icon-Unlock unlockAnimation"
      :style="isLocked ? 'opacity: 0' : 'opacity: 1'" />
    <span
      class="sp-icon icon-Lock unlockAnimation"
      :style="!isLocked ? 'opacity: 0' : 'opacity: 1'"
  /></span>
</template>

<script>
export default {
  props: {
    isLocked: {
      type: Boolean,
      default: true,
    },
    clickFunction: {
      type: Function,
      default: () => {},
    },
  },
};
</script>

<style>
.unlockAnimation {
  transition: 0.3s ease;
  position: absolute;
  top: 0;
  left: 0;
}

.lockIcon {
  color: rgb(160, 160, 160);
  transition: 0.3s ease;
  transition: color 0.1s ease;
  opacity: 1;
  height: 14px;
  display: inline-block;
  margin-right: 12px;
}

.lockIcon:hover {
  color: black;
}
</style>
