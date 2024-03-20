// import dynatrace api client
// https://github.com/dynatrace-esa/dynatrace-api-client
const dynatraceApiClient = require("@dt-esa/dynatrace-api-client");
const { DynatraceTenantAPI } = require("@dt-esa/dynatrace-api-client");
const { application } = require("express");
// build api client
const apiConfig = require("./apiConfig.json");
const dtAPI = new DynatraceTenantAPI({
  url: apiConfig.tenant,
  token: apiConfig.token,
});

module.exports = {
  // ---------- KEY USER ACTION CLEANUP ---------- //

  getApplicationMethods: function () {
    console.log("getting list of apps");
    return new Promise((resolve, reject) => {
      dtAPI.v2.entities
        .getEntities({
          entitySelector: "type(APPLICATION_METHOD)",
          pageSize: 800,
          fields: "fromRelationships, lastSeenTms",
          from: "now-365d",
        })
        .then((data) => {
          console.log(data);
          resolve(data);
        });
    });
  },

  //DELETE LIST OF KUAs
  deleteApplicationMethods: function (list) {
    console.log("deleting list of kuas");
    let kuasToDelete = [];
    let deleteCalls = [];
    let now = new Date();
    let cutOffDate = now - 1000 * 60 * 60 * 24 * 180;
    console.log(new Date(cutOffDate));
    list.forEach((kua) => {
      console.log(new Date(kua.lastSeenTms));
      if (
        kua.lastSeenTms <= cutOffDate &&
        kua.fromRelationships.isApplicationMethodOf
      ) {
        console.log(kua);
        let idleTime = now - kua.lastSeenTms;
        kuasToDelete.push({
          userActionId: kua.entityId,
          name: kua.displayName,
          parentApp: kua.fromRelationships.isApplicationMethodOf[0].id,
          idleTime: idleTime / (1000 * 60 * 60) + " hours",
        });
      }
    });
    console.log("KEY USER ACTIONS TO CLEAN UP: \n\n", kuasToDelete);
    // kuasToDelete.forEach((kua) => {
    //   new Promise((resolve, reject) => {
    //     dtAPI.config.applications
    //       .deleteKeyUserAction(kua.parentApp, kua.userActionId)
    //       .then((data) => {
    //         resolve(data);
    //       });
    //   });
    // });
  },
};
