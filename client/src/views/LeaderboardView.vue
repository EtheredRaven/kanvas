<script>
import LeaderboardTable from "@/components/LeaderboardTable.vue";
export default {
  components: {
    LeaderboardTable,
  },
};
</script>

<template>
  <div class="leaderboardContainer">
    <div class="leaderboardTitle">
      <img
        src="../../public/img/trophy.svg"
        alt="icon"
        class="leaderboardIcon"
      />Pixelers leaderboard
    </div>
    <LeaderboardTable />
  </div>
</template>

<style>
.leaderboardContainer {
  padding: 4rem;
  box-sizing: border-box;
}

.leaderboardTitle {
  font-weight: bold;
  font-size: 3rem;
  text-align: center;
  margin-bottom: 4rem;
}

.leaderboardIcon {
  height: 2.2rem;
  margin-right: 0.8rem;
}
</style>
