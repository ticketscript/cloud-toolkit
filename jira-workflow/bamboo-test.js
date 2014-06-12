/**
 * file for development purposes only
 *
 * usage: to run, checkout cloud-toolkit, cd to jira-workflow, type 'nodejs bamboo-test.js'
 */

var BambooClient = require('./bambooClient');

var client = BambooClient();
client.triggerProject('TSP-TSPU', 'create', 'TSP-johnarchTestPlanBranch113');