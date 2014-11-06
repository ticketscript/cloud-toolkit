var Config = require('../../config')
var resBranchNotFound = {"message":"Not Found","documentation_url":"https://developer.github.com/v3"};
var testParent = 'TST-00';
var testBranch = 'TST-01';
var testOwner = 'testOwner';
var testRepo = 'testRepo';
var testSHA1 = '123456'

var resParentBranch = {
	ref:'refs/heads/' + testParent,
	url:'https://' + Config.github.hostname + '/repos/' + testOwner + '/' + testRepo + '/git/refs/heads/'+ testParent,
	object:{
		sha: testSHA1,
		type: "commit",
		url: 'https://' + Config.github.hostname + '/repos/' + testOwner + '/' + testRepo + '/git/commits/' + testSHA1
	}
}

var resBranchCreated = {
	ref: 'refs/heads/' + testBranch,
	url: 'https://' + Config.github.hostname + '/repos/' + testOwner + '/' + testRepo + '/git/refs/heads/'+ testBranch,
	object:{
		sha: testSHA1,
		type: "commit",
		url: 'https://' + Config.github.hostname + '/repos/' + testOwner + '/' + testRepo + '/git/commits/' + testSHA1
	}
}

exports.resBranchNotFound = resBranchNotFound;
exports.resParentBranch = resParentBranch;
exports.resBranchCreated = resBranchCreated;