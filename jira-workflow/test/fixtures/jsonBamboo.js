var Config = require('../../config');
var testBranch = 'TST-00';
var testProject = 'testProject';
var testStage = 'Define';
var testBuild = 'TSP-TST00';
var testShortKey = 'TST00';
var resPlanBranchesIncludingTestBranch = {
	branches:{
		size:1,
		expand:"branch",
		"start-index": 0,
		"max-result": 11,
		branch:[
		{
			description: "Test description",
			shortName: testBranch,
			shortKey: testShortKey,
			enabled: true,
			link:{
				href: Config.atlassian.hostname + Config.atlassian.pathPrefix + "rest/api/latest/plan/" + testShortKey,
				rel: "self"
			},
			key: testProject,
			name:"Test project - Test plan - Test branch"
		}]
	}
};

var resPlanBranchesExcludingTestBranch = {
	branches:{
		size:0,
		expand:"branch",
		"start-index": 0,
		"max-result": 11,
		branch:[]
	}
};

var resBranchSetVCSBranch = {
  	description:"Test description",
  	shortName: testBranch,
  	shortKey: testShortKey,
  	enabled:true,
  	link:{
  		href: Config.atlassian.hostname + Config.atlassian.pathPrefix + "rest/api/latest/plan/" + testBuild,
  		rel:"self"
  	},
  	key: testBuild,
  	name:"Test project - Test plan - Test branch"
};

var resQueueBuild = {
	message:"Build requested but not started, you have reached the maximum number of concurrent builds allowed.",
	"status-code":400
};

exports.resPlanBranchesExcludingTestBranch = resPlanBranchesExcludingTestBranch;
exports.resPlanBranchesIncludingTestBranch = resPlanBranchesIncludingTestBranch;
exports.resBranchSetVCSBranch = resBranchSetVCSBranch;
exports.resQueueBuild = resQueueBuild;