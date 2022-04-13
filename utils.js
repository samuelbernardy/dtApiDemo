// import dynatrace api client
// https://github.com/dynatrace-esa/dynatrace-api-client
const dynatraceApiClient = require("@dt-esa/dynatrace-api-client");
const { DynatraceTenantAPI } = require("@dt-esa/dynatrace-api-client");
const { application } = require("express");
// import csv handler
const { Parser } = require("json2csv");
// import configs
// add related config file...
// {
//   token: "DT REST API TOKEN",
//   tenant: "DT REST API ENDPOINT"
// }
const apiConfig = require("./apiConfig.json");
const dtAPI = new DynatraceTenantAPI(
  {
    url: apiConfig.tenant,
    token: apiConfig.token,
  },
  false
);

//GET ALL DETAILS
function getDetailsForEachMonitor(entityId) {
  return new Promise((resolve, reject) => {
    dtAPI.v1.synthetic.getMonitor(entityId).then((data) => {
      console.log("Got details for this monitor \n\n", data);
      resolve(data);
    });
  });
}

module.exports = {
  // ----------- START SYNTHETICS EXPORT MODULES ----------- //

  // INIT DOWNLOAD
  downloadResource: function (res, fileName, fields, data) {
    const json2csv = new Parser({ fields });
    const csv = json2csv.parse(data);
    res.header("Content-Type", "text/csv");
    res.attachment(fileName);
    return res.send(csv);
  },

  //GET MONITORS
  getListOfMonitorIds: function () {
    return new Promise((resolve, reject) => {
      dtAPI.v1.synthetic.getMonitorsCollection().then((data) => {
        const map = data.monitors.map((entity) => entity.entityId);
        resolve(map);
      });
    });
  },

  //CREATE PROMISE ARRAY
  buildIterable: function (list) {
    let detailCalls = [];
    list.forEach((entityId) => {
      detailCalls.push(getDetailsForEachMonitor(entityId));
    });
    return detailCalls;
  },

  //REFORMAT TAG FIELDS
  monitorTagFormat: function (obj) {
    obj
      // Filter out all entitys that have no tags
      .filter((entity) => entity.tags && entity.tags.length > 0)
      // For each entity with a tag
      .forEach((entity) => {
        entity.tags.forEach((t) => {
          const split = t.key.split(":");
          const isKVkey = t.key.includes(":");

          const name = isKVkey ? split[0] : t.name;
          const value = isKVkey ? split[1] : t.value;

          entity[
            `tags.${t.context !== "CONTEXTLESS" ? `[${t.context}]` : ""}${name}`
          ] = value;
        });
        // remove original json
        entity.tags = undefined;
      });
    return obj;
  },

  // -----------  END  SYNTHETICS EXPORT MODULES ----------- //

  // -----------  START  TEST EXPORT MODULES ----------- //

  testToken: function () {
    return new Promise((resolve, reject) => {
      data = {
        token: apiConfig.token,
      };
      dtAPI.v2.apiTokens
        .lookupApiToken(data)
        .then((info) => {
          resolve(info);
        })
        .catch((e) => {
          resolve(e);
        });
    });
  },

  // TODO: WRITE TEST FUNCTIONS
};
