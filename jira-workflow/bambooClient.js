var Config = require('./config')
var https = require('https');
var errorMessage = require('./errorMessages');

/*
 * Constructor
 */
function BambooClient() {

	var bambooClient = {

        /**
         * hostname && auth credentials, from an git-ignored config object
         */
        HOSTNAME: Config.atlassian.hostname,
        AUTHCREDENTIALS: Config.atlassian.username+':'+Config.atlassian.pass,

        buildPlanName: null,
        branchName: null,
        buildPlanShortKey: null,

        /**
         * trigger the build service
         *
         * @param {string} planName the name of the build plan
         * @param {string} stage the stage of the build process
         * @param {string} branch the name of the jira story branch
         */
		triggerProject: function(planName, stage, branch){

			var plan,
                planName,
				stage,
				branch;

            this.branchName = branch;
            this.buildPlanName = planName;
            console.log('Triggered Bamboo project ' + planName + ' - ' + stage
                + ' for branch ' + branch);

			plan = this.sendRequest('GET', '/builds/rest/api/latest/plan/' + planName + '.json?expand=branches');
		},

        /**
         * create a plan branch via api call
         *
         * @param {string} the https request method
         * @param {string} the path for the api call
         */
        sendRequest: function(method, url) {

            var method,
                url;

            var options = {
                hostname: this.HOSTNAME,
                path: url,
                method: method,
                agent: false,
                auth: this.AUTHCREDENTIALS
            };

            var req = https.request(options, function(res) {

                res.on('data', function(d) {
                    if (!bambooClient.planExists(d)) {

                        bambooClient.createPlanBranch('PUT',
                            '/builds/rest/api/latest/plan/' + bambooClient.buildPlanName +'/branch/' + bambooClient.branchName + '.json');
                    } else {
                        // console.log('plan already exists');
                    }
                });
            });
            req.end();
        },

        /**
         * check to see if the build plan branch already exists
         *
         * @param {string} jsonResponse
         * @return {boolean} whether or not the plan branch already exists
         */
        planExists: function (jsonResponse) {
            var jsonResponse,
            parsedResponse = JSON.parse(jsonResponse);

            for (var branchName in parsedResponse['branches']['branch']) {
                if (this.branchName == parsedResponse['branches']['branch'][branchName]['shortName']){
                    return true;
                }
            }
            return false;
        },

        /**
         * api call to create a bamboo plan branch for a jira story
         *
         * @param {string} method the https method
         * @param {string} url the path for the api call
         */
        createPlanBranch: function(method, url) {

            var method,
                url;

            var options = {
                hostname: this.HOSTNAME,
                path: url,
                method: method,
                agent: false,
                auth: this.AUTHCREDENTIALS,
                headers: { 'Content-Length': 0}
            };

            var req = https.request(options, function(res) {

                res.on('data', function(d) {

                    var parsedResponse = JSON.parse(d);

                    if (res.statusCode == 200){

                        bambooClient.queuePlanBranch('POST', '/builds/rest/api/latest/queue/TSP-' + parsedResponse['shortKey'] + '.json');
                    } else {

                        console.error('plan branch not created');
                    }
                });
            });
            req.end();
        },

        /**
         * api call to queue (run) a bamboo plan branch for a jira story
         *
         * @param {string} method the https method
         * @param {string} url the path for the api call
         */
        queuePlanBranch: function(method, url) {
           var method,
               url,
               postData = 'bamboo.variable.branchShortName=' + bambooClient.branchName;
               postDataLength = postData.length;

            var options = {
                hostname: this.HOSTNAME,
                path: url,
                method: method,
                agent: false,
                auth: this.AUTHCREDENTIALS,
                headers: {'X-Atlassian-Token':'nocheck',
                    'Content-Length':postDataLength
                }
            }

            var req = https.request(options, function(res) {

                res.on('data', function(d) {
                });
            });
            req.on('error', function (err) {
                console.error(err)
            });
            req.write(postData);
            req.end();
        }
	}

	return bambooClient;
};

module.exports = BambooClient