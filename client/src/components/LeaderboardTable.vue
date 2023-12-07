<template>
  <EasyDataTable
    :headers="headers"
    :items="items"
    :sort-by="sortBy"
    :sort-type="sortType"
    buttons-pagination
    table-class-name="customize-table"
    show-index
    theme-color="#5956E9"
    :loading="!hasLoaded"
    :body-row-class-name="bodyRowClassNameFunction"
    :rows-per-page="10"
    :must-sort="true"
    :no-hover="true"
    :current-page="currentPage"
    ref="dataTable"
  >
  </EasyDataTable>
</template>

<script>
export default {
  created() {
    this.$socket.emit("get_leaderboard_data");

    this.$socket.on("got_leaderboard_data", (leaderboardData) => {
      this.parseRawData(leaderboardData);
      this.hasLoaded = true;
      setTimeout(() => {
        const pagesButtons = document.getElementsByClassName("item button");
        for (let pageButton of pagesButtons) {
          pageButton.addEventListener("click", () => {
            this.currentPage = Number(pageButton.innerHTML);
          });
        }
      }, 300);
    });
  },
  data() {
    return {
      hasLoaded: false,
      items: [],
      currentPage: 1,
      sortBy: "pixels_balance",
      sortType: "desc",
      headers: [
        { text: "Address", value: "id" },
        { text: "Pixels owned", value: "pixels_balance", sortable: true },
        {
          text: "$KAN owned",
          value: "token_balance",
          sortable: true,
        },
        {
          text: "Used pixels (%)",
          value: "used_pixels_percentage",
          sortable: true,
        },
      ],
    };
  },
  methods: {
    async parseRawData(leaderboardData) {
      this.items = await Promise.all(
        leaderboardData.map(async (row) => {
          let pixels_balance = Math.floor(
            Math.min(row.pixels_balance, row.token_balance / 100000000)
          );
          let token_balance = Math.floor(row.token_balance / 10000000) / 10;
          let used_pixels_percentage = token_balance
            ? Math.round((pixels_balance / token_balance) * 100 * 100) / 100
            : 0;
          let kapName = await this.$store.getters.getKapName(row.id);

          return {
            id: kapName ?? row.id,
            pixels_balance: pixels_balance,
            token_balance: token_balance,
            used_pixels_percentage: used_pixels_percentage,
          };
        })
      );
    },
    bodyRowClassNameFunction(item, rowNumber) {
      if (this.currentPage == 1) {
        switch (rowNumber) {
          case 1:
            return "first-row";
          case 2:
            return "second-row";
          case 3:
            return "third-row";
        }
      }

      return "";
    },
    /*bodyItemClassNameFunction(column) {
      if (column === "token_balance") return "align-right";
      return "";
    },
    headerClassNameFunction(header) {
      if (header.value === "token_balance") return "align-right";
      return "";
    },*/
  },
};
</script>

<style>
.align-right {
  text-align: right !important;
}

.customize-table {
  --easy-table-body-row-font-size: 1.4rem;
  --easy-table-body-item-padding: 1.4rem 1.2rem;
  --easy-table-header-font-size: 2rem;
  --easy-table-body-row-height: 3.8rem;
  --easy-table-header-item-padding: 1.4rem 1.2rem;
  --easy-table-header-background-color: #5956e9;
  --easy-table-header-font-color: white;
  --easy-table-border: none;
  --easy-table-footer-background-color: transparent;
  --easy-table-footer-height: 4rem;
  --easy-table-footer-font-size: 1.4rem;
  --easy-table-buttons-pagination-border: none;
  border-radius: 1rem;
}

.customize-table .pagination__items-index {
  display: none;
}

.customize-table .pagination__rows-per-page {
  display: none !important;
}

.customize-table .vue3-easy-data-table__footer {
  justify-content: center !important;
  padding-top: 3rem !important;
}

.customize-table .button {
  background-color: white;
}

.customize-table .omission {
  background-color: white;
}

.customize-table tr th {
  font-weight: normal;
}

.customize-table tr:first-child th:first-child {
  border-top-left-radius: 1rem;
}

.customize-table tr:first-child th:last-child {
  border-top-right-radius: 1rem;
}

.customize-table tr:last-child td:first-child {
  border-bottom-left-radius: 1rem;
}

.customize-table tr:last-child td:last-child {
  border-bottom-right-radius: 1rem;
}

.vue3-easy-data-table__main {
  max-height: calc(100vh - 19rem);
}

.first-row {
  --easy-table-body-row-background-color: rgba(214, 165, 0, 0.05);
  --easy-table-body-row-font-size: 2rem;
  --easy-table-body-row-font-color: rgba(195, 151, 0, 1);
  --easy-table-body-row-hover-background-color: rgba(214, 165, 0, 0.13);
  --easy-table-body-row-hover-font-color: rgba(195, 151, 0, 1);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.second-row {
  --easy-table-body-row-background-color: rgba(110, 110, 110, 0.05);
  --easy-table-body-row-font-size: 1.8rem;
  --easy-table-body-row-font-color: rgba(110, 110, 110);
  --easy-table-body-row-hover-background-color: rgba(110, 110, 110, 0.1);
  --easy-table-body-row-hover-font-color: rgba(110, 110, 110);
}

.third-row {
  --easy-table-body-row-background-color: rgba(100, 60, 0, 0.05);
  --easy-table-body-row-font-size: 1.6rem;
  --easy-table-body-row-font-color: rgba(100, 60, 0);
  --easy-table-body-row-hover-background-color: rgba(100, 60, 0, 0.1);
  --easy-table-body-row-hover-font-color: rgba(100, 60, 0);
}
</style>
