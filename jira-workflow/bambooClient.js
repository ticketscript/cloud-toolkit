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
         * @param {string} planName the name of the build plan
         * @param {string} stage the stage of the build process
         * @param {string} branch the name of the jira story branch
         */
        triggerProject: function (planName, stage, branch) {

            var planName,
                branch,
                stage = stage || '';
            
            console.log('Trigger received for Bamboo project ' + planName + ' for branch ' + branch + ' and for stage' + stage);

            // Retrieve plan and parse response
            self.retrievePlanBranches(planName, function(parsedResponse) {

            	var parsedResponse, 
            		buildPlanBranch;

            	// Parse plan branches
            	buildPlanBranch = self.findBranch(parsedResponse, branch);

            	// Create build plan if non exists
            	if (!buildPlanBranch) {

            		console.log('Creating ' + planName + ' build plan for branch ' + branch);

	                // this branch does not exist, so let's register the branch first
                    self.registerPlanBranch(planName, branch, function(buildPlanBranch) {

                    	// Queue the build
                		self.queuePlanBranch(buildPlanBranch.key, stage, buildPlanBranch.shortName);
                    });
	            } else {
	            	console.log('Found existing ' + planName + ' build plan for branch ' + branch);

	            	// Queue the build
	            	self.queuePlanBranch(buildPlanBranch.key, stage, buildPlanBranch.shortName);
	            }
			});
        },

        /**
         * api call to retrieve the branches that currently exist
         *
         * @param {string} build plan name
         * @param {function} callback function for parsed response
         */
        retrievePlanBranches: function(buildPlanName, callback) {
        	var buildPlanName, callback;
        	var url = '/rest/api/latest' 
        			+ '/plan/' + buildPlanName + '.json?expand=branches&max-results=1000';

        	self.call('GET', url, null, callback);
        },

        /**
         * Parse the plan response and update internal status
         * 
         * @param {string} parsed bamboo plan response
         * @param {string} branch name that we're looking for
         */
        findBranch: function(parsedResponse, branchName) {

        	var parsedResponse, branchName;

            for (var id in parsedResponse['branches']['branch']) {
            	var buildPlanBranch = parsedResponse['branches']['branch'][id];

                if (branchName == buildPlanBranch['shortName']) {
		           	// the build plan branch exists
                    return buildPlanBranch;
                }
            }
        },

        /**
         * api call to register a branch in an existing build plan
         * @param {string} build plan name
         * @param {string} branch name
         * @param {function} callback
         */
        registerPlanBranch: function(planName, branch, callback) {
            var planName, branch, callback;

            var url = '/rest/api/latest'
                    + '/plan/' + planName 
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

        	var buildPlanKey, buildPlanStage, branchName;

            var planBuildUrl = '/rest/api/latest/queue/' + buildPlanKey + '.json';
            var postData = branchName ? 'bamboo.variable.branchShortName=' + branchName : '';

            // Execute only one stage if a stage was specified
            if (buildPlanStage) {
            	planBuildUrl += '?stage=' + buildPlanStage + '&executeAllStages=false';
            }

        	console.log('Queueing plan ' + buildPlanKey 
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

            	var res,
            		response = '';

            	// Collect data chunks into response
                res.on('data', function (chunk) {

                	var chunk;

                    if (res.statusCode == 200) {
	            		response += chunk;
                    } else {
                        console.error('Request failed', res);
                    }
                });

	            // Add response handler
	            if (callback) {

		          	// Response handler
		          	res.on('end', function() {
                        var parsedResponse = JSON.parse(response);
                        // Pass parsed JSON response to callback function
		          		callback(parsedResponse);
		          	});
				}
            });

            // Write request BODY
            if (body.length > 0) {
            	req.write(body);
            }

            // Add error handler
            req.on('error', function (err) {
            	var err;

                console.error(err)
            });

            req.end();
        }
    }

    return self;
};

module.exports = BambooClient
