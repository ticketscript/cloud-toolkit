var Config = require('../config')
//initialize logging mechanism
var log = require('../log');
Config.log.console.enable = true;
Config.log.file.enable = false;
log.init();

var nock = require('nock');
var gitHubMock = nock('https://' + Config.github.hostname);

var GitHubClient = require('../githubClient');
var testOwner = 'testOwner';
var testRepo = 'testRepo';
var testBaseBranch = 'TST-00';
var testHeadBranch = 'TST-01';
var githubClient = new GitHubClient(testOwner, testRepo);

exports['testIsBranchMergedFullyMerged'] = function (test) {
	var testResult = false;
	// fully merged branch
	gitHubMock.get('/repos/' + testOwner + '/' + testRepo + '/compare/' + testBaseBranch + '...' + testHeadBranch)
			  .reply(200, {ahead_by: 0, total_commits: 0});

	githubClient.isBranchMerged(testBaseBranch, testHeadBranch, function(result){
		testResult = result;
	});

	setTimeout(function() {
		test.ok(testResult);
		test.ok(gitHubMock.isDone(), 'Remaining mocks: ' + gitHubMock.pendingMocks());
		test.done();
		nock.cleanAll();
	}, 1000);
}

exports['testIsBranchMergedNotFullyMerged'] = function (test) {
	var testResult = false;
	// not fully merged branch
	gitHubMock.get('/repos/' + testOwner + '/' + testRepo + '/compare/' + testBaseBranch + '...' + testHeadBranch)
			  .reply(200, {ahead_by: 1, total_commits: 0});

	githubClient.isBranchMerged(testBaseBranch, testHeadBranch, function(result){
		testResult = result;
	});

	setTimeout(function() {
		test.ok(!testResult);
		test.ok(gitHubMock.isDone(), 'Remaining mocks: ' + gitHubMock.pendingMocks());
		test.done();
		nock.cleanAll();
	}, 1000);
}