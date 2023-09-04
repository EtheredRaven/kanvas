<template>
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

export default {
  components: {
    SidebarContainer,
    Layout,
  },
};
</script>
