/*
 * JIRA - Bamboo integration server for Node.JS
 *
 * End points:
 *   /jira/   -- send POST requests from JIRA's hooks here
 */
var express = require("express");

var Config = require('./config.js')
var RequestHandler = require('./requestHandler');

// Init request handlers
var handler = new RequestHandler();

var app = express();
//var router = express.router();

// Bamboo routes
app.route('/jira/:issueKey/:type(bamboo)/:action(trigger)/:project').post(handler.handleRequest);
app.route('/jira/:issueKey/:type(bamboo)/:action(trigger)/:project/:stage').post(handler.handleRequest);


// GitHub routes
app.route('/jira/:type(github)/:action(create_pull_request)/:repo/:head').post(handler.handleRequest);
app.route('/jira/:type(github)/:action(complete_subtask)/:repo/:head').post(handler.handleRequest);

// Start server
app.listen(Config.app.port);

console.log('Listening on port ' + Config.app.port);
