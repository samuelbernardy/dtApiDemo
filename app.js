// express
const express = require("express");
const app = express();
const port = 3000;
// import utils
const {
  testToken,
  getApplicationMethods,
  deleteApplicationMethods,
} = require("./utils.js");

// ---------- KEY USER ACTION CLEANUP ---------- //

//GET LIST OF KUAS
app.get("/getApplicationMethods", (req, res) => {
  getApplicationMethods().then((data) => {
    console.log(data);
    res.send(data);
  });
});

//DELETE KUAS
app.get("/deleteApplicationMethods", (req, res) => {
  getApplicationMethods().then((data) => {
    console.log(data);
    deleteApplicationMethods(data.entities);
    res.send(data);
  });
});

// ---------- SERVER CHECK METHODS ---------- //

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
