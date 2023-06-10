<template>
  <SidebarInside
    v-on:sidebar-open="sidebarOpen = true"
    v-on:sidebar-close="sidebarOpen = false"
    v-on:click="preventNextClick"
  >
    <template v-slot:header>Kanvas</template>
    <template v-slot:default>
      <LinkIcon link="/" text="Pixel Map" icon="Dashboard" />
      <LinkIcon text="Wallet (soon)" icon="Lock" />
      <LinkIcon text="Docs (soon)" icon="Form" />
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
