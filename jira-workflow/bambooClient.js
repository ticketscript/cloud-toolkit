var https        = require('https');
var Config       = require('./config.js');

/*
 * Constructor
 */
function BambooClient() {

    var self = {

        /**
         * hostname && auth credentials, from an git-ignored config object
         */
        HOSTNAME: 			Config.atlassian.hostname,
        AUTHCREDENTIALS: 	Config.atlassian.username + ':' + Config.atlassian.pass,

        /**
         * trigger the build service
         *
         * @param {string} plan: the name of the build plan
         * @param {string} stage: the stage of the build process
         * @param {string} branch: the name of the jira story branch
         */
        triggerProject: function (plan, stage, branch) {

            var stage = stage || '';

            logger.info('Trigger received for Bamboo project ' + plan + ' for branch ' + branch + ' and for stage ' + stage);

            // Retrieve plan and parse response
            self.retrievePlanBranches(plan, function(parsedResponse) {

            	var parsedResponse,
            		buildPlanBranch;

            	// Parse plan branches
            	buildPlanBranch = self.findBranch(parsedResponse, branch);
                if (!buildPlanBranch) {
                    //TODO: throw error?
                    logger.error('Plan branch ' + branch + ' not found, could not trigger build.');
                    return;
                }
                self.queuePlanBranch(buildPlanBranch.key, stage, buildPlanBranch.shortName);
			});
        },
        /**
         * Register given branch as a plan branch, unless it is already registered.
         *
         * @param {string} plan the name of the build plan
         * @param {string} branch the name of the jira story branch
         */
        registerBranchAtProject: function (plan, branch) {
            // Retrieve plan and check if branch exists
            self.retrievePlanBranches(plan, function (parsedResponse) {

                var buildPlanBranch = self.findBranch(parsedResponse, branch);

                if (!buildPlanBranch) {

                    logger.info('Registering branch ' + branch + ' at Bamboo project ' + plan);
                    self.registerPlanBranch(plan, branch, function(buildPlanBranch) {

                    });
                } else {
                    logger.info('Found existing branch (' + branch + ') for ' + plan);
                }
            });
        },
        /**
         * api call to retrieve the branches that currently exist
         *
         * @param {string} plan: build plan name
         * @param {function} callback: callback function for parsed response
         */
        retrievePlanBranches: function(plan, callback) {
        	var url = '/rest/api/latest'
        			+ '/plan/' + plan + '.json?expand=branches&max-results=1000';

        	self.call('GET', url, null, callback);
        },

        /**
         * Parse the plan response and update internal status
         *
         * @param {string} parsedResponse: parsed bamboo plan response
         * @param {string} branch: branch name that we're looking for
         */
        findBranch: function(parsedResponse, branch) {
            for (var id in parsedResponse['branches']['branch']) {
            	var buildPlanBranch = parsedResponse['branches']['branch'][id];

                if (branch == buildPlanBranch['shortName']) {
		           	// the build plan branch exists
                    return buildPlanBranch;
                }
            }
        },

        /**
         * api call to register a branch in an existing build plan
         * @param {string} plan: build plan name
         * @param {string} branch: branch name
         * @param {function} callback
         */
        registerPlanBranch: function(plan, branch, callback) {
            var url = '/rest/api/latest'
                    + '/plan/' + plan
                    + '/branch/' + branch + '.json'
                    + '?vcsBranch='+ branch;

            // register branch
            self.call('PUT', url, null, callback);
        },

        /**
         * api call to queue (run) a bamboo plan branch for a jira story
         * @param {string} build plan key
         * @param {string} build plan stage to trigger
         * @param {string} branch name
         */
        queuePlanBranch: function (buildPlanKey, buildPlanStage, branchName) {

            var planBuildUrl = '/rest/api/latest/queue/' + buildPlanKey + '.json';
            var postData = branchName ? 'bamboo.variable.branchShortName=' + branchName : '';

            // Execute only one stage if a stage was specified
            if (buildPlanStage) {
            	planBuildUrl += '?stage=' + buildPlanStage + '&executeAllStages=false';
            }

        	logger.info('Queueing plan ' + buildPlanKey
        								 + (buildPlanStage ? ' stage ' + buildPlanStage : '')
        								 + ' build for branch ' + branchName);

        	// Queue build
            self.call('POST', planBuildUrl, postData);
        },

        /**
         * api call to Bamboo (run)
         *
         * @param {string} method the https method
         * @param {string} url the path for the api call
         * @param {string} request body for the api call
         * @param {function} callback function when request completes
         */
        call: function (method, url, body, callback) {
            var method,
                url,
                body = body || '',
                callback;

            var options = {
	                hostname:   self.HOSTNAME,
	                path: 		Config.atlassian.pathPrefix + url,
	                method: 	method,
	                agent: 		false,
	                auth: 		self.AUTHCREDENTIALS,
	                headers: 	{
				                	'X-Atlassian-Token': 'nocheck',
				                    'Content-Length': body.length
				                }
	            };

	        // Start HTTPS request
            var req = https.request(options, function (res) {
                logger.debug('Outgoing Request - Bamboo');
                logger.debug('URL: ' + options.path);
                logger.debug('Method: ' + options.method);
            	var res,
            		response = '';

            	// Collect data chunks into response
                res.on('data', function (chunk) {
                    response += chunk;
                });

                // Response handler
                res.on('end', function() {
                    logger.debug('Incoming Response - Bamboo');
                    logger.debug('Status code: ' + res.statusCode);
                    logger.debug('Body: ' + response);

                    var parsedResponse = JSON.parse(response);
                    if (res.statusCode == 200) {
                        if (callback) {
                            // Pass parsed JSON response to callback function
                            callback(parsedResponse);
                        }
                    } else {
                        logger.warn('Status code: ' + res.statusCode + ', message: ' + parsedResponse['message']);
                    }
                });
            });

            // Write request BODY
            if (body.length > 0) {
            	req.write(body);
            }

            // Add error handler
            req.on('error', function (err) {
            	var err;

                logger.error('' + err);
            });

            req.end();
        }
    }

    return self;
};

module.exports = BambooClient
