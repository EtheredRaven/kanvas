<template>
  <Wallet
    ref="wallet"
    v-on:dropdown-opened="$refs.menu.closeDropdown()"
    @click="preventNextClick"
  />
  <Layout>
    <template v-slot:sidebar>
      <SidebarContainer />
    </template>
    <template v-slot:content>
      <router-view />
    </template>
  </Layout>
</template>

<style>
body {
  margin: 0;
}
</style>

<script>
import SidebarContainer from "./components/SidebarContainer";
import Layout from "./components/Layout";
import Wallet from "./components/Wallet";

export default {
  components: {
    SidebarContainer,
    Layout,
    Wallet,
  },
  methods: {
    preventNextClick() {
      this.$store.commit("preventNextClick", true);
    },
  },
};
</script>
