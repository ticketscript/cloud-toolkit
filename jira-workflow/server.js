/*
 * JIRA - Bamboo integration server for Node.JS
 * 
 * End points:
 *   /jira/   -- send POST requests from JIRA's hooks here
 */
var express = require('express');
var RequestHandler = require('./requestHandler');

// Init request handlers
var handlerBamboo = new RequestHandler();

var app = express.createServer();
app.use(app.router);

// Routes
app.post('/jira/:issueKey/:type(bamboo)/:action(trigger)/:project/:stage', handlerBamboo.handleRequest);

// Start server
app.listen(4444);
