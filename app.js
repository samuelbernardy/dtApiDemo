// express
const express = require("express");
const app = express();
const port = 3000;
// import utils
const {
  downloadResource,
  getListOfMonitorIds,
  getListOfMZIds,
  buildMZIterable,
  buildIterable,
  monitorTagFormat,
  testToken,
  buildExecutionIterable,
  filterMZ,
  createMZ,
} = require("./utils.js");
const testData = require("./testMzs.json");
//EXPORT SYNTHETIC DETAIL CSV
app.get("/exportMonitorsDetail", (req, res) => {
  let params = [];

  for (const [key, value] of Object.entries(req.query)) {
    params.push({ label: `${key}`, value: `${value}` });
  }

  isParams = params.length > 0;

  if (!isParams) {
    res.send(
      "declare columns and datasource in the query parameters. Example can be found here: https://github.com/samuelbernardy/dtApiDemo/blob/master/readme.md#exportmonitorsdetail"
    );
  } else {
    getListOfMonitorIds()
      .then((list) => {
        return buildIterable(list);
      })
      .then((detailsIterable) => {
        Promise.all(detailsIterable).then((data) => {
          downloadResource(
            res,
            "syntheticMonitors" + Date.now() + ".csv",
            params == [] ? null : params,
            monitorTagFormat(data)
          );
        });
      });
  }
});
//EXPORT EXECUTION DETAILS CSV
app.get("/exportExecutionDetails", (req, res) => {
  let params = { monitors: [], resultType: "" };

  for (const [key, value] of Object.entries(req.query)) {
    if (key.indexOf("exec") > -1) {
      params.monitors.push(`${value}`);
    } else if (key == "resultType") {
      params.resultType = `${value}`;
    }
  }
  isParams =
    params.monitors.length > 0 &&
    (params.resultType == "SUCCESS" || params.resultType == "FAILED");
  if (!isParams) {
    res.send("Parameters must be set.");
  } else {
    getListOfMonitorIds()
      .then((list) => {
        console.log("oldList", list);
        let newList = list.filter((entity) => params.monitors.includes(entity));
        console.log("newList", newList);
        return buildExecutionIterable(newList);
      })
      .then((detailsIterable) => {
        Promise.all(detailsIterable).then((data) => {
          console.log("execData", data);
          downloadResource(
            res,
            "syntheticExecutions" + Date.now() + ".csv",
            null,
            data
          );
        });
      });
  }
});

//UPGRADE MANAGEMENT ZONES TO INCLUDE FOCUS GROUPS
app.get("/upgradeMZs", (req, res) => {
  console.log("get list of MZs");
  // get all mzs
  getListOfMZIds().then((list) => {
    // assembling iterable out of get details calls
    const iterable = buildMZIterable(list);
    // execute get details calls
    Promise.all(iterable).then((data) => {
      // Filter data by Synthetic entity
      // USE FOLLOWING FOR LIMITED TESTING
      // const filtered = filterMZ(testData);
      const filtered = filterMZ(testData);
      // iterate through mz
      filtered.forEach((mz) => {
        //create new mzs
        createMZ(mz);
      });
      // print filtered data payload to browser window
      res.send(filtered);
    });
  });
});

//TEST SERVER
app.get("/", (req, res) => {
  console.log("testing express server");
  res.send(
    "Your server is up and running. Try using /testclient to check your DT REST API client connection"
  );
});

//TEST API
app.get("/testclient", (req, res) => {
  console.log("testing api token and connectivity");

  testToken().then((data) => {
    if (data.scopes && data.scopes.length > 0 && data.enabled) {
      console.log(
        "API CONNECTION SUCCESSFUL: " + JSON.stringify(data, null, 2)
      );
      res.send("API CONNECTION SUCCESSFUL: " + JSON.stringify(data, null, 2));
    }

    if (data.status && data.status == 404) {
      console.log("TOKEN INVALID: " + data.message);
      res.send("TOKEN INVALID: " + data.message);
    }

    if (data.status && data.status !== 404 && data.message) {
      console.log("API ACCESS PROBLEM: " + data.message);
      res.send("API ACCESS PROBLEM: " + data.message);
    }
  });
});

//START SERVER
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
