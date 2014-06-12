var https = require('https');

var errorMessage = require('./errorMessages');

/*
 * Constructor
 */
function BambooClient() {

	var bambooClient = {

        /**
         * hostname && auth credentials
         */
        HOSTNAME: '',
        AUTHCREDENTIALS: '',

        branchName: null,
        buildPlanShortKey: null,

        /**
         * trigger the build service
         *
         * @param {string} planName the name of the build plan
         * @param {string} stage the stage of the build process
         * @param {string} branch the name of the jira story branch
         * @return {string} Human-readable representation of this Circle.
         */
		triggerProject: function(planName, stage, branch){

			var plan,
                planName,
				stage,
				branch;

            this.branchName = branch;
			console.log('Triggered Bamboo project ' + planName + ' - ' + stage
								+ ' for branch ' + branch);

			plan = this.sendRequest('GET', '/builds/rest/api/latest/plan/' + planName + '.json?expand=branches');
		},

        /**
         * create a plan branch via api call
         *
         * @rparam {string} the http request method
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

                console.log("statusCode: ", res.statusCode);
                console.log("headers: ", res.headers);

                res.on('data', function(d) {
                    if (!bambooClient.planExists(d)) {

                        bambooClient.createPlanBranch('PUT',
                            '/builds/rest/api/latest/plan/TSP-TSPU/branch/' + bambooClient.branchName + '.json');
                    } else {
                        console.log('plan already exists');
                    }
                });
            });
            req.end();
        },

        /**
         * check to see if the build plan branch already exists
         *
         * @param {string} jsonResponse
         * @return {boolean} exists whether or not the plan branch already exists
         */
        planExists: function (jsonResponse) {
            var jsonResponse,
            parsedResponse = JSON.parse(jsonResponse);
            var exists = false;
                console.log(parsedResponse);

            for (var branchName in parsedResponse['branches']['branch']) {
                if (this.branchName == parsedResponse['branches']['branch'][branchName]['shortName']){
                    exists = true;
                }
            }
            return exists;
        },

        /**
         * api call to create a bamboo plan branch for a jira story
         *
         * @param {string} method the http method
         * @oaram {string} url the path for the api call
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

                console.log("statusCode: ", res.statusCode);
                console.log("headers: ", res.headers);

                res.on('data', function(d) {

                    var parsedResponse = JSON.parse(d);
                    console.log(parsedResponse);

                    if (res.statusCode == 200){

                        console.log(JSON.parse(d));
                        bambooClient.queuePlanBranch('POST', '/builds/rest/api/latest/queue/TSP-' + parsedResponse['shortKey'] + '.json');
                        console.log();
                    } else {

                        console.log('plan branch not created');
                    }
                });
            });
            req.end();
        },

        /**
         * api call to queue (run) a bamboo plan branch for a jira story
         *
         * @param {string} method the http method
         * @oaram {string} url the path for the api call
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
                console.log("statusCode: ", res.statusCode);
                console.log("headers: ", res.headers);

                res.on('data', function(d) {
                    console.log(JSON.parse(d));
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