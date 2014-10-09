var Config = require('../../config')
var resPlanExpandBranches = {
	branches:{
		size:1,
		expand:"branch",
		"start-index":0,
		"max-result":11,
		branch:[
		{
			description:"Task-related automation supporting Ticketscript JIRA workflow v3.2",
			shortName:"ITI-1803",
			shortKey:"TT0",
			enabled:true,
			link:{
				href: Config.atlassian.hostname + Config.atlassian.pathPrefix + "rest/api/latest/plan/TSP-TT3",
				rel:"self"
			},
			key:"TSP-TT00",
			name:"Ticketscript - Technical Tasks - ITI-1803"
		}]
	}
};

var resBranchSetVCSBranch = {
  	description:"Test project",
  	shortName:"TST-00",
  	shortKey:"TST00",
  	enabled:true,
  	link:{
  		href: Config.atlassian.hostname + Config.atlassian.pathPrefix + "rest/api/latest/plan/TSP-TST00",
  		rel:"self"
  	},
  	key:"TSP-TST00",
  	name:"Test project - Test plan - Test branch"
};

var resQueueBuild = {
	message:"Build requested but not started, you have reached the maximum number of concurrent builds allowed.",
	"status-code":400
};
exports.resPlanExpandBranches = resPlanExpandBranches;
exports.resBranchSetVCSBranch = resBranchSetVCSBranch;
exports.resQueueBuild = resQueueBuild;