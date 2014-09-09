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

// Activate router
app.use(app.router);

// Bamboo routes
app.post('/jira/:issueKey/:type(bamboo)/:action(trigger)/:project', handler.handleRequest);
app.post('/jira/:issueKey/:type(bamboo)/:action(trigger)/:project/:stage', handler.handleRequest);


// GitHub routes
app.post('/jira/:type(github)/:action(create_pull_request)/:repo/:head', handler.handleRequest);
app.post('/jira/:type(github)/:action(complete_subtask)/:repo/:head', handler.handleRequest);

// Start server
app.listen(Config.app.port);

console.log('Listening on port ' + Config.app.port);
