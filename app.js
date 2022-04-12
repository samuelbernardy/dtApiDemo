// express
const express = require("express");
const app = express();
const port = 3000;

// import utils
const {
  downloadResource,
  getListOfMonitorIds,
  buildIterable,
  monitorTagFormat,
} = require("./utils.js");

//EXPORT SYNTHETIC DETAIL CSV
app.get("/exportMonitorsDetail", (req, res) => {
  let params = [];
  for (const [key, value] of Object.entries(req.query)) {
    params.push({ label: `${key}`, value: `${value}` });
  }
  console.log(params);

  getListOfMonitorIds()
    .then((list) => {
      return buildIterable(list);
    })
    .then((detailsIterable) => {
      Promise.all(detailsIterable).then((data) => {
        downloadResource(
          res,
          "syntheticMonitors" + Date.now() + ".csv",
          params,
          monitorTagFormat(data)
        );
      });
    });
});

//TEST SERVER
app.get("/", (req, res) => {
  res.send(
    "Your server is up and running. Try using /testAPI to check your DT REST API client connection"
  );
});

//TEST API
// TODO: WRITE APP.GET(/TESTAPI)

//START SERVER
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
