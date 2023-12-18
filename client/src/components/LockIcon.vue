<template>
  <span
    class="sp-icon lockIcon"
    v-on:click="clickFunction"
    style="position: relative"
  >
    <span
      class="unlockAnimation"
      :style="isLocked ? 'opacity: 0' : 'opacity: 1'"
    >
      <svg
        fill="currentColor"
        width="20px"
        height="20px"
        viewBox="0 0 32 32"
        id="icon"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M24,14H12V8a4,4,0,0,1,8,0h2A6,6,0,0,0,10,8v6H8a2,2,0,0,0-2,2V28a2,2,0,0,0,2,2H24a2,2,0,0,0,2-2V16A2,2,0,0,0,24,14Zm0,14H8V16H24Z"
        />
        <rect
          id="_Transparent_Rectangle_"
          data-name="&lt;Transparent Rectangle&gt;"
          class="cls-1"
          width="32"
          height="32"
          fill="none"
        />
      </svg>
    </span>
    <span
      class="unlockAnimation"
      :style="!isLocked ? 'opacity: 0' : 'opacity: 1'"
    >
      <svg
        fill="currentColor"
        width="20px"
        height="20px"
        viewBox="0 0 32 32"
        id="icon"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M24,14H22V8A6,6,0,0,0,10,8v6H8a2,2,0,0,0-2,2V28a2,2,0,0,0,2,2H24a2,2,0,0,0,2-2V16A2,2,0,0,0,24,14ZM12,8a4,4,0,0,1,8,0v6H12ZM24,28H8V16H24Z"
        />
        <rect
          id="_Transparent_Rectangle_"
          data-name="&lt;Transparent Rectangle&gt;"
          class="cls-1"
          width="32"
          height="32"
          fill="none"
        /></svg></span
  ></span>
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
  opacity: 1;
  display: inline-block;
  width: 20px;
  height: 20px;
  margin-bottom: -16px;
}

.lockIcon:hover {
  color: black;
}
</style>
