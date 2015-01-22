var Config = require('../config')
//initialize logging mechanism
var log = require('../log');
Config.log.console.enable = false;
Config.log.file.enable = false;
log.init();

var nock = require('nock');
var bambooMock = nock('https://' + Config.atlassian.hostname);
var jsonFixtures = require('./fixtures/jsonBamboo');
var requestBamboo = require('../requestBamboo');

var testBranch = 'TST-00';
var testProject = 'testProject';
var testStage = 'Define';
var testBuild = 'TSP-TST00';

var bambooHandler = requestBamboo(testBranch);

// Test if invalid issue keys from JIRA throw an Error
exports['testTriggerInvalidBranch'] = function (test) {
    test.expect(1);

    var bambooHandler = requestBamboo("${issue.key}");
    test.throws(
        function () {
            bambooHandler.handleAction( {
                action: 'trigger',
                project: testProject
            });
        },
        Error,
        'Invalid issue key format: ${issue.key}'
    );

    test.done();
}
// Test if Handler responds to the action Trigger
exports['testTriggerNonExistingBranch'] = function (test) {
    test.expect(2);

    // Mock Bamboo interaction
    bambooMock.get(Config.atlassian.pathPrefix + '/rest/api/latest/plan/' + testProject +'.json?expand=branches&max-results=1000')
              .reply(200, jsonFixtures.resPlanBranchesExcludingTestBranch);

    test.equal(bambooHandler.issueKey, testBranch);
    bambooHandler.handleAction({
        action: 'trigger',
        project: testProject
    });

    // check that all expected communication has taken place
    setTimeout(function() {
        test.ok(bambooMock.isDone(), 'Remaining mocks: ' + bambooMock.pendingMocks());
        test.done();
        nock.cleanAll();
    }, 1000);
}

// Test if Handler responds to the action Trigger
exports['testTriggerExistingBranch'] = function (test) {
    test.expect(1);

    // Mock Bamboo interaction
    bambooMock.get(Config.atlassian.pathPrefix + '/rest/api/latest/plan/' + testProject +'.json?expand=branches&max-results=1000')
          .reply(200, jsonFixtures.resPlanBranchesIncludingTestBranch)
          .post(Config.atlassian.pathPrefix + '/rest/api/latest/queue/' + testProject + '.json')
          .reply(200,jsonFixtures.resQueueBuild);

    bambooHandler.handleAction({
        action: 'trigger',
        project: testProject
    });

    // check that all expected communication has taken place
    setTimeout(function() {
        test.ok(bambooMock.isDone(), 'Remaining mocks: ' + bambooMock.pendingMocks());
        test.done();
        nock.cleanAll();
    }, 1000);
}

// Test if Handler responds to the action Trigger when a stage is provided
exports['testTriggerStageNonExistingBranch'] = function (test) {
    test.expect(1);
    // Mock Bamboo interaction
    bambooMock.get(Config.atlassian.pathPrefix + '/rest/api/latest/plan/' + testProject +'.json?expand=branches&max-results=1000')
          .reply(200, jsonFixtures.resPlanBranchesExcludingTestBranch);

    bambooHandler.handleAction({
        action: 'trigger',
        project: testProject,
        stage: testStage
    });

    // check that all expected communication has taken place
    setTimeout(function() {
        test.ok(bambooMock.isDone(), 'Remaining mocks: ' + bambooMock.pendingMocks());
        test.done();
        nock.cleanAll();
    }, 1000);
}

// Test if Handler responds to the action Trigger when a stage is provided
exports['testTriggerStageExistingBranch'] = function (test) {
    test.expect(1);
    // Mock Bamboo interaction
    bambooMock.get(Config.atlassian.pathPrefix + '/rest/api/latest/plan/' + testProject +'.json?expand=branches&max-results=1000')
          .reply(200, jsonFixtures.resPlanBranchesIncludingTestBranch)
          .post(Config.atlassian.pathPrefix + '/rest/api/latest/queue/' + testProject + '.json?stage=' + testStage + '&executeAllStages=false')
          .reply(200,jsonFixtures.resQueueBuild);

    bambooHandler.handleAction({
        action: 'trigger',
        project: testProject,
        stage: testStage
    });

    // check that all expected communication has taken place
    setTimeout(function() {
        test.ok(bambooMock.isDone(), 'Remaining mocks: ' + bambooMock.pendingMocks());
        test.done();
        nock.cleanAll();
    }, 1000);
}

exports['testReleaseTestProject'] = function (test) {
    test.expect(1);

    // Mock Bamboo interaction (cannot match post data as of now)
    bambooMock.post(Config.atlassian.pathPrefix + '/rest/api/latest/queue/' + testProject +'.json', 'bamboo.variable.userstory=TST-00')
      .reply(200);

    bambooHandler.handleAction({
        action: 'release',
        project: testProject
    });

    // check that all expected communication has taken place
    setTimeout(function() {
        test.ok(bambooMock.isDone(), 'Remaining mocks: ' + bambooMock.pendingMocks());
        test.done();
        nock.cleanAll();
    }, 1000);
}

exports['testRegisterNonExistingBranch'] = function (test) {
    test.expect(1);

    // Mock Bamboo interaction
    bambooMock.get(Config.atlassian.pathPrefix + '/rest/api/latest/plan/' + testProject +'.json?expand=branches&max-results=1000')
      .reply(200, jsonFixtures.resPlanBranchesExcludingTestBranch)
      .put(Config.atlassian.pathPrefix + '/rest/api/latest/plan/' + testProject +'/branch/' + testBranch + '.json?vcsBranch=' + testBranch)
      .reply(200, jsonFixtures.resBranchSetVCSBranch);

    bambooHandler.handleAction({
        action: 'register',
        project: testProject,
    });

    // check that all expected communication has taken place
    setTimeout(function() {
        test.ok(bambooMock.isDone(), 'Remaining mocks: ' + bambooMock.pendingMocks());
        test.done();
        nock.cleanAll();
    }, 1000);
}

exports['testRegisterExistingBranch'] = function(test) {
    test.expect(1);

    // Mock Bamboo interaction
    bambooMock.get(Config.atlassian.pathPrefix + '/rest/api/latest/plan/' + testProject +'.json?expand=branches&max-results=1000')
          .reply(200, jsonFixtures.resPlanBranchesIncludingTestBranch);

    bambooHandler.handleAction({
        action: 'register',
        project: testProject,
    });

    // check that all expected communication has taken place
    setTimeout(function() {
        test.ok(bambooMock.isDone(), 'Remaining mocks: ' + bambooMock.pendingMocks());
        test.done();
        nock.cleanAll();
    }, 1000);
}


