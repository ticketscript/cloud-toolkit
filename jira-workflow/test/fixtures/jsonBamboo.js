var Config = require('../../config');
var fs = require('fs');

var resPlanBranchesIncludingTestBranch = fs.readFileSync('./test/fixtures/json/bambooPlanBranchesIncludingTestBranch.json','utf8');
var resPlanBranchesExcludingTestBranch = fs.readFileSync('./test/fixtures/json/bambooPlanBranchesExcludingTestBranch.json','utf8');

var resBranchSetVCSBranch = fs.readFileSync('./test/fixtures/json/bambooBranchSetVCSBranch.json', 'utf8');

var resQueueBuild = {
	message:"Build requested but not started, you have reached the maximum number of concurrent builds allowed.",
	"status-code":400
};

exports.resPlanBranchesExcludingTestBranch = JSON.parse(resPlanBranchesExcludingTestBranch);
exports.resPlanBranchesIncludingTestBranch = JSON.parse(resPlanBranchesIncludingTestBranch);
exports.resBranchSetVCSBranch = resBranchSetVCSBranch;
exports.resQueueBuild = resQueueBuild;