<template>
  <SidebarInside
    v-on:sidebar-open="sidebarOpen = true"
    v-on:sidebar-close="sidebarOpen = false"
    v-on:click="preventNextClick"
  >
    <template v-slot:header
      ><img
        src="../../public/img/icon.png"
        alt="icon"
        class="kanvasIcon"
      />Kanvas</template
    >
    <template v-slot:default>
      <LinkIcon link="/" text="Pixel map" icon="delicious" />
      <LinkIcon href="../" text="Home" icon="home" />
      <LinkIcon
        link="/pricechart"
        target="_blank"
        text="Price chart"
        icon="stats-dots"
      />
      <LinkIcon
        href="https://app.koindx.com/swap?input=15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL&output=1LeWGhDVD8g5rGCL4aDegEf9fKyTL1KhsS"
        target="_blank"
        text="Buy on KoinDX"
        icon="credit-card"
      />
      <LinkIcon
        href="https://konio.io/"
        target="_blank"
        text="Mobile wallet"
        icon="mobile"
      />
      <LinkIcon
        href="../docs/introduction/whatiskanvas.html"
        target="_blank"
        text="Docs"
        icon="book"
      />
    </template>
  </SidebarInside>
</template>

<script>
import SidebarInside from "./SidebarInside.vue";
import LinkIcon from "./LinkIcon";

export default {
  name: "SidebarContainer",
  components: {
    SidebarInside,
    LinkIcon,
  },
  data() {
    return {
      sidebarOpen: true,
    };
  },
  methods: {
    preventNextClick() {
      this.$store.commit("preventNextClick", true);
    },
  },
};
</script>

<style>
.kanvasIcon {
  width: 36px;
  margin-right: 14px;
  vertical-align: middle;
  margin-top: -5px;
}
</style>
