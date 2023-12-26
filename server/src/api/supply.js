module.exports = function (Server) {
  Server.kanReserveAddress = "1LQni7rXgA8C8sjoaQxCL7kSBJ4jj84EWv";
  let getTotalSupply = async function () {
    let totalSupply = await Server.kanvasContract.functions.total_supply({});
    return totalSupply.result.value;
  };

  Server.app.get("/api/supply/total/", async (req, res) => {
    return res.send(await getTotalSupply());
  });

  Server.app.get("/api/supply/circulating/", async (req, res) => {
    let totalSupply = await getTotalSupply();
    let kanReserve = await Server.kanvasContract.functions.balance_of({
      owner: Server.kanReserveAddress,
    });
    let kanReserveValue = kanReserve.result.value;
    let circulatingSupply = totalSupply - kanReserveValue;
    return res.send("" + circulatingSupply);
  });
};
