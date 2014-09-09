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
        AUTHCREDENTIALS: Config.atlassian.username + ':' + Config.atlassian.pass,

        buildPlanName: null,
        branchName: null,
        buildPlanShortKey: null,
        buildPlanStage: null,

        /**
         * trigger the build service
         *
         * @param {string} planName the name of the build plan
         * @param {string} stage the stage of the build process
         * @param {string} branch the name of the jira story branch
         */
        triggerProject: function (planName, stage, branch) {

            var plan,
                planName,
                stage,
                branch;

            this.branchName = branch;
            this.buildPlanName = planName;
            this.buildPlanStage = stage;
            console.log('Triggered Bamboo project ' + planName + ' - ' + stage
                + ' for branch ' + branch + 'and for stage' + stage);

            this.retrievePlanBranches('GET', Config.atlassian.pathPrefix + '/rest/api/latest/plan/' + planName + '.json?expand=branches&max-results=1000');
        },

        /**
         * api call to retrieve the branches that currently exist
         *
         * @param {string} the https request method
         * @param {string} the path for the api call
         */
        retrievePlanBranches: function (method, url) {

            var method,
                url;

            var options = {
                hostname: this.HOSTNAME,
                path: url,
                method: method,
                agent: false,
                auth: this.AUTHCREDENTIALS
            };

            var stringResponse = '';

            var req = https.request(options, function (res) {

                res.on('data', function (d) {
                    stringResponse += d.toString();
                });

                res.on('end', function (d) {

                    if (!bambooClient.planExists(stringResponse)) {

                        switch (bambooClient.buildPlanName) {

                            case 'TSP-CIS':
                                // this branch does not exist
                                bambooClient.createPlanBranch('PUT',
                                    Config.atlassian.pathPrefix + '/rest/api/latest/plan/'
                                        + bambooClient.buildPlanName + '/branch/' + bambooClient.branchName + '.json?vcsBranch='+ bambooClient.branchName);
                                break;
                            case 'TSP-TSPU':
                                // this branch does not exist
                                bambooClient.createPlanBranch('PUT',
                                    Config.atlassian.pathPrefix + '/rest/api/latest/plan/'
                                        + bambooClient.buildPlanName + '/branch/' + bambooClient.branchName + '.json');
                                break;
                        }

                    } else if (bambooClient.buildPlanName == 'TSP-CIS') {
                        // the branch exists, but this is TSP-CIS (so queue it anyway)
                        var plan = bambooClient.fetchPlan(stringResponse);

                        console.log("queueing " + bambooClient.buildPlanName + '/branch/' + bambooClient.branchName);
                        bambooClient.queuePlanBranch('POST', Config.atlassian.pathPrefix +
                            '/rest/api/latest/queue/TSP-' + plan['shortKey'] + '.json');

                    }  else if (bambooClient.buildPlanName == 'TSP-TSPU') {
                        // the branch exists, so queue it for the testing stage
                        var plan = bambooClient.fetchPlan(stringResponse);

                        console.log("queueing " + bambooClient.buildPlanName + '/branch/' + bambooClient.branchName + ' stage ' + bambooClient.buildPlanStage);
                        bambooClient.queuePlanBranch('POST', Config.atlassian.pathPrefix +
                            '/rest/api/latest/queue/TSP-' + plan['shortKey'] + '.json?stage=' + bambooClient.buildPlanStage + '&executeAllStages=false');

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
         * @return {boolean} whether or not the plan branch already exists
         */
        planExists: function (jsonResponse) {
            parsedResponse = JSON.parse(jsonResponse);

            for (var branchName in parsedResponse['branches']['branch']) {
                if (this.branchName == parsedResponse['branches']['branch'][branchName]['shortName']) {
                    return true;
                }
            }
            return false;
        },

        /**
         * Extract the current plan from the json response
         *
         * @param jsonResponse
         * @returns {*}
         */
        fetchPlan: function (jsonResponse) {
            parsedResponse = JSON.parse(jsonResponse);

            for (var branchName in parsedResponse['branches']['branch']) {
                if (this.branchName == parsedResponse['branches']['branch'][branchName]['shortName']) {
                    return parsedResponse['branches']['branch'][branchName];
                }
            }
            return null;
        },

        /**
         * api call to create a bamboo plan branch for a jira story
         *
         * @param {string} method the https method
         * @param {string} url the path for the api call
         */
        createPlanBranch: function (method, url) {

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

            var req = https.request(options, function (res) {

                res.on('data', function (d) {

                    if (res.statusCode == 200) {
                        var parsedResponse = JSON.parse(d);

                        bambooClient.queuePlanBranch('POST', Config.atlassian.pathPrefix +
                            '/rest/api/latest/queue/TSP-' + parsedResponse['shortKey'] + '.json');
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
        queuePlanBranch: function (method, url) {
            var method,
                url,
                postData = 'bamboo.variable.branchShortName=' + bambooClient.branchName,
                postDataLength = postData.length;

            var options = {
                hostname: this.HOSTNAME,
                path: url,
                method: method,
                agent: false,
                auth: this.AUTHCREDENTIALS,
                headers: {'X-Atlassian-Token': 'nocheck',
                    'Content-Length': postDataLength
                }
            }

            var req = https.request(options, function (res) {

                res.on('data', function (d) {
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
