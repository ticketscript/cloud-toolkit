/*
 * JIRA - Bamboo integration server for Node.JS
 *
 * End points:
 *   /jira/   -- send POST requests from JIRA's hooks here
 */
var express = require("express");
var RequestHandler = require('./requestHandler');

// Init request handlers
var handler = new RequestHandler();

var app = express();
app.use(app.router);


// Bamboo route
app.post('/jira/:issueKey/:type(bamboo)/:action(trigger)/:project/:stage', handler.handleRequest);
app.post('/jira/:issueKey/:type(bamboo)/:action(testing)/:project/:stage', handler.handleRequest);


// GitHub routes
app.post('/jira/:type(github)/:action(create_pull_request)/:repo/:head', handler.handleRequest);
app.post('/jira/:type(github)/:action(complete_subtask)/:repo/:head', handler.handleRequest);


// Start server
app.listen(443);
