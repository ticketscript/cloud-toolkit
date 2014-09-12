/*
 * JIRA - Bamboo integration server for Node.JS
 *
 * End points:
 *   /jira/   -- send POST requests from JIRA's hooks here
 */
var express = require("express");
var bodyParser = require('body-parser');

var Config = require('./config.js')
var RequestHandler = require('./requestHandler');

// Init request handlers
var handler = new RequestHandler();
// Init Express and request body parser
var app = express();
app.use(bodyParser.json());

// Bamboo routes
app.route('/jira/:issueKey/:type(bamboo)/:action(trigger)/:project').post(handler.handleRequest);
app.route('/jira/:issueKey/:type(bamboo)/:action(trigger)/:project/:stage').post(handler.handleRequest);

// GitHub routes
app.route('/jira/:type(github)/:action/:repo/:head').post(handler.handleRequest);
app.route('/jira/:type(github)/:action(create_branch)/:owner/:repo/:branchName').post(handler.handleRequest);
app.route('/jira/:type(github)/:action(create_branch)/:owner/:repo/:branchName/:forkFrom').post(handler.handleRequest);

// Start server
app.listen(Config.app.port);

console.log('Listening on port ' + Config.app.port);
