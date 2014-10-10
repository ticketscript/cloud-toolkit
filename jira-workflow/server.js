/*
 * JIRA - Bamboo - GitHub integration server for Node.JS
 *
 * End points:
 *   /jira/   -- send POST requests from JIRA's hooks here
 */
//initialize logging mechanism
var log = require('./log');
log.init();

logger.info('Starting integration server');

var express = require("express");
var bodyParser = require('body-parser');

var Config = require('./config')
var RequestHandler = require('./requestHandler');

// Init request handlers
var handler = new RequestHandler();
// Init Express and request body parser
var app = express();

//TODO remove extra logging
app.use(bodyParser.json(),function(req, res, next) {
	logger.debug('Request Type:', req.method);
  	logger.debug('Request URL:', req.originalUrl);
  	logger.debug('Request Params: ', req.params);
  	next();
});

// Bamboo routes
app.route('/jira/:issueKey/:type(bamboo)/:action(trigger)/:project').post(handler.handleRequest);
app.route('/jira/:issueKey/:type(bamboo)/:action(trigger)/:project/:stage').post(handler.handleRequest);

// GitHub routes
app.route('/jira/:type(github)/:action/:repo/:head').post(handler.handleRequest);
app.route('/jira/:type(github)/:action(create_branch)/:owner/:repo/:branchName').post(handler.handleRequest);
app.route('/jira/:type(github)/:action(create_branch)/:owner/:repo/:branchName/:forkFrom').post(handler.handleRequest);
app.route('/jira/:type(github)/:action(create_pull_request)/:owner/:repo/:branchName').post(handler.handleRequest)

// Start server
app.listen(Config.app.port);

logger.info('Listening on port ' + Config.app.port);
