var Config = require('../config')
//initialize logging mechanism
var log = require('../log');
Config.log.console.enable = false;
Config.log.file.enable = false;
log.init();

var nock = require('nock');
var gitHubMock = nock('https://' + Config.github.hostname);
var jsonFixtures = require('./fixtures/jsonGithub');
var requestGitHub = require('../requestGitHub');
var gitHubHandler = requestGitHub();
var testParent = 'TST-00';
var testBranch = 'TST-01';
var testOwner = 'testOwner';
var testRepo = 'testRepo';

// Test if Handler responds to the action create_branch
exports['testCreateNotExistingBranch'] = function (test) {
	test.expect(1);

	// Mock gitHub interaction
	gitHubMock.get('/repos/' + testOwner + '/' + testRepo + '/git/refs/heads/' + testBranch)
	      .reply(404, jsonFixtures.resBranchNotFound)
	      .get('/repos/' + testOwner + '/' + testRepo + '/git/refs/heads/master' )
		  .reply(200, jsonFixtures.resParentBranch)
		  .post('/repos/' + testOwner + '/' + testRepo + '/git/refs')
		  .reply(201,jsonFixtures.resBranchCreated);

	gitHubHandler.setIssue(testBranch);
	gitHubHandler.handleAction('create_branch',{
		owner: testOwner,
		repo: testRepo,
		branchName: testBranch,
		issue: {
			key: testBranch,
			fields: {
				parent: {
					key: testParent
				}
			}
		}
	});
	// check that all expected communication has taken place
	setTimeout(function() {
		test.ok(gitHubMock.isDone(), 'Remaining mocks: ' + gitHubMock.pendingMocks());
		test.done();
		nock.cleanAll();
	}, 1000);
}


