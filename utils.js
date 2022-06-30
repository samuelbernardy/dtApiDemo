// import dynatrace api client
// https://github.com/dynatrace-esa/dynatrace-api-client
const dynatraceApiClient = require("@dt-esa/dynatrace-api-client");
const { DynatraceTenantAPI } = require("@dt-esa/dynatrace-api-client");
const { application } = require("express");
// import csv handler
const { Parser } = require("json2csv");
// build api client
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
  console.log("getting details for " + entityId);
  return new Promise((resolve, reject) => {
    dtAPI.v1.synthetic.getMonitor(entityId).then((data) => {
      resolve(data);
    });
  });
}
//GET DETAILS FOR EACH MZ
function getDetailsForEachMZ(entityId) {
  console.log("getting details for " + entityId);
  return new Promise((resolve, reject) => {
    dtAPI.config.managementZones.getManagementZone(entityId).then((data) => {
      resolve(data);
    });
  });
}
//GET Executions for each monitor
function getExecutionsForEachMonitor(entityId, resultType) {
  console.log("getting executions details for " + entityId);
  return new Promise((resolve, reject) => {
    dtAPI.v2.synthetic
      .getExecutionResult(entityId, resultType)
      .then((data) => {
        resolve(data);
      })
      .catch((e) => resolve(console.log(e)));
  });
}
module.exports = {
  // ----------- START SYNTHETICS EXPORT MODULES ----------- //

  // INIT DOWNLOAD
  downloadResource: function (res, fileName, fields, data) {
    console.log("generating csv " + fileName);
    const json2csv = new Parser({ fields });
    const csv = json2csv.parse(data);
    res.header("Content-Type", "text/csv");
    res.attachment(fileName);
    console.log("sending attachment");
    return res.send(csv);
  },
  //GET MONITORS
  getListOfMonitorIds: function () {
    console.log("getting list of monitors");
    return new Promise((resolve, reject) => {
      dtAPI.v1.synthetic.getMonitorsCollection().then((data) => {
        const map = data.monitors.map((entity) => entity.entityId);
        resolve(map);
      });
    });
  },
  //CREATE DETAIL PROMISE ARRAY
  buildIterable: function (list) {
    console.log("building promise array");
    let detailCalls = [];
    list.forEach((entityId) => {
      detailCalls.push(getDetailsForEachMonitor(entityId));
    });
    return detailCalls;
  },
  //REFORMAT TAG FIELDS
  monitorTagFormat: function (obj) {
    console.log("pivoting tags object");
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

  // -----------  START MZ MGMT MODULES ----------- //

  //GET LIST OF MANAGEMENT ZONES
  getListOfMZIds: function () {
    console.log("getting list of management zones");
    return new Promise((resolve, reject) => {
      dtAPI.config.managementZones.listManagementZones().then((data) => {
        const map = data.values.map((entity) => entity.id);
        resolve(map);
      });
    });
  },
  //BUILD MZ Data Iterable
  buildMZIterable: function (list) {
    console.log("getting list of filtered mz data");
    let detailCalls = [];
    list.forEach((entityId) => {
      // https://www.dynatrace.com/support/help/shortlink/api-config-management-zones-get-all
      detailCalls.push(getDetailsForEachMZ(entityId));
    });
    return detailCalls;
  },
  //FILTER MZs
  filterMZ: function (payload) {
    console.log("payload\n" + JSON.stringify(payload));
    // determine types for sub mz creation
    const types = ["BROWSER_MONITOR", "HTTP_MONITOR"];
    payload.forEach((mz) => {
      // remove non-synethtic types
      newRules = mz.rules.filter(
        (r) => r.type == types[0] || r.type == types[1]
      );
      mz.rules = newRules;
    });
    // remove mzs without remaining rules
    const cleanPayload = payload.filter((mz) => mz.rules.length > 1);
    console.log("clean payload\n" + JSON.stringify(cleanPayload));
    return cleanPayload;
  },
  //CREATE MZs
  createMZ: function (filteredMZ) {
    return new Promise((resolve, reject) => {
      console.log("this is the filtered payload\n" + filteredMZ);
      //build new mz
      let mzFormatted = {
        metadata: null,
        id: null,
        name: "Synthetic_" + filteredMZ.name,
        description:
          "Synthetic administration group for MZ: " + filteredMZ.name,
        rules: filteredMZ.rules,
        dimensionalRules: filteredMZ.ruldimensionalRuleses,
        entitySelectorBasedRules: filteredMZ.entitySelectorBasedRules,
      };
      // https://www.dynatrace.com/support/help/shortlink/api-config-management-zones-post-mz
      dtAPI.config.managementZones.createManagementZone(mzFormatted);
    });
  },

  // -----------  END MZ MGMT MODULES ----------- //

  // -----------  START TEST EXPORT MODULES ----------- //

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
  //CREATE EXECUTION PROMISE ARRAY
  buildExecutionIterable: function (list, resultType) {
    console.log("building execution promise array");
    let detailCalls = [];
    list.forEach((entityId) => {
      detailCalls.push(getExecutionsForEachMonitor(entityId, resultType));
    });
    return detailCalls;
  },
};
