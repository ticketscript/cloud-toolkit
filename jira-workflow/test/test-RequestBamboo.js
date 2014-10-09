var Config = require('../config')
var nock = require('nock');
var bambooMock = nock('https://' + Config.atlassian.hostname);
var jsonFixtures = require('./fixtures/jsonBamboo');
var requestBamboo = require('../requestBamboo');
var bambooHandler = requestBamboo('TST-00');

// Test if Handler responds to the action Trigger
exports['testTrigger'] = function (test) {
	test.expect(2);

	// Mock Bamboo interaction
	bambooMock.get(Config.atlassian.pathPrefix + '/rest/api/latest/plan/testProject.json?expand=branches&max-results=1000')
	      .reply(200, jsonFixtures.resPlanExpandBranches)
	      .put(Config.atlassian.pathPrefix + '/rest/api/latest/plan/testProject/branch/TST-00.json?vcsBranch=TST-00')
		  .reply(200, jsonFixtures.resBranchSetVCSBranch)
		  .post(Config.atlassian.pathPrefix + '/rest/api/latest/queue/TSP-TST00.json')
		  .reply(200,jsonFixtures.resQueueBuild);


	test.equal(bambooHandler.issueKey, 'TST-00');
	bambooHandler.handleAction('trigger',{'project':'testProject'});

	// check that all expected communication has taken place
	setTimeout(function() {
		test.ok(bambooMock.isDone(), 'Remaining mocks: ' + bambooMock.pendingMocks());
		test.done();
		nock.cleanAll();
	}, 3000);
}

// Test if Handler responds to the action Trigger when a stage is provided
exports['testTriggerStage'] = function (test) {
	test.expect(1);
	// Mock Bamboo interaction
	bambooMock.get(Config.atlassian.pathPrefix + '/rest/api/latest/plan/testProject.json?expand=branches&max-results=1000')
	      .reply(200, jsonFixtures.resPlanExpandBranches)
	      .put(Config.atlassian.pathPrefix + '/rest/api/latest/plan/testProject/branch/TST-00.json?vcsBranch=TST-00')
		  .reply(200, jsonFixtures.resBranchSetVCSBranch)
		  .post(Config.atlassian.pathPrefix + '/rest/api/latest/queue/TSP-TST00.json?stage=Define&executeAllStages=false')
		  .reply(200,jsonFixtures.resQueueBuild);

	bambooHandler.handleAction('trigger',{'project':'testProject', 'stage':'Define'});
	// check that all expected communication has taken place
	setTimeout(function() {
		test.ok(bambooMock.isDone(), 'Remaining mocks: ' + bambooMock.pendingMocks());
		test.done();
		nock.cleanAll();
	}, 3000);
}


