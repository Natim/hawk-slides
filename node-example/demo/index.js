/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

var PORT = 5000,
    HOST = "127.0.0.1",
    PROTOCOL = "http";

var crypto = require("crypto");
var express = require("express");
var logging = require("express-logging");
var cors = require("cors");
var http = require('http');

var hawk = require('express-hawkauth');

var app = express();
app.use(logging());

app.use(app.router);

/**
 * Enable CORS for all requests.
 **/
var corsEnabled = cors({
  origin: function(origin, callback) {
    var allowedOrigins = ["*"];
    var acceptedOrigin = allowedOrigins.indexOf('*') !== -1 ||
                         allowedOrigins.indexOf(origin) !== -1;
    callback(null, acceptedOrigin);
  },
  credentials: true
});
app.all("*", corsEnabled);

// Server Home page
app.get("/", function(req, res) {
  res.status(200).json({"name": "node-example", message: "Hello Pytong!"});
});

/**
 * Hawk middlewares
 */
var TOKENS = {"admin": "password"};

function getHawkSession(id, callback) {
  if (TOKENS.hasOwnProperty(id)) {
    // Return the credentials for this id
    callback(null, {
      key: TOKENS[id],
      algorithm: "sha256"
    });
  } else {
    // Return null if the id is not found
    callback(null, null);
  }
}

function setUser(req, res, credentials, done) {
  req.user = credentials.id;
  done();
}

function hawkSendError(res, status, payload) {
  res.status(status).json({code: status, error: payload.message});
}

var hawkOptions = {
  port: PROTOCOL === "https" ? 443 : undefined
};

// A middleware that asks for the Hawk Authorization
var hawkMiddleware = hawk.getMiddleware({
  hawkOptions: hawkOptions,
  getSession: getHawkSession,
  setUser: setUser,
  sendError: hawkSendError
});

// A middleware that creates the hawk session
function createHawkSession(id, key, done) {
  TOKENS[id] = key;
  done();
}

var attachOrCreateHawkSession = hawk.getMiddleware({
  hawkOptions: hawkOptions,
  getSession: getHawkSession,
  createSession: createHawkSession,
  setUser: setUser,
  sendError: hawkSendError
});


app.post("/token", function(req, res) {
  var credentials = {
    id: crypto.randomBytes(16).toString("hex"),
    key: crypto.randomBytes(16).toString("hex"),
    algorithm: "sha256"
  };

  TOKENS[credentials.id] = credentials.key;

  res.status(201).json({credentials: credentials});
});

app.post("/registration", attachOrCreateHawkSession, function(req, res) {
  res.status(200).json({hawkId: req.user});
});

app.get("/token", hawkMiddleware, function(req, res) {
  res.status(200).json({hawkId: req.user});
});

var server = http.createServer(app);
server.listen(PORT, HOST, function() {
  console.log("Server now listening on http://" +
              HOST + ":" + PORT);
});

function shutdown(cb) {
  server.close(function() {
    process.exit(0);
    if (cb !== undefined) {
      cb();
    }
  });
}

process.on('SIGTERM', shutdown);

module.exports = {
  app: app,
  server: server,
};
