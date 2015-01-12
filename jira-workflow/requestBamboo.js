var errorMessage = require('./errorMessages');
var BambooClient = require('./bambooClient');

/*
 * ConstructorRequestHandler
 */
function RequestBamboo(issueKey) {

    var requestBamboo = {

        issueKey: issueKey,
        client: BambooClient(),

        handleAction: function(requestParams){

            var action = requestParams.action;

            //ITI-1800: validate issueKey
            var validatedIssueKeyMatch = this.issueKey.match(/^\w+-\w+$/);
            if (validatedIssueKeyMatch === null) {
                throw errorMessage.invalidRequest('Invalid issue key format: ' + this.issueKey);
            }
            var validatedIssueKey = validatedIssueKeyMatch[0];
            switch (action) {
                case 'trigger':
                    var project = requestParams['project'];
                    var stage   = requestParams['stage'] || '';

                    this.client.triggerProject(project, stage, validatedIssueKey);
                    break;
                case 'register':
                    var project = requestParams['project'];
                    this.client.registerBranchAtProject(project, validatedIssueKey);
                    break;
                case 'release':
                    // Trigger Bamboo release plan with issue key as parameter
                    // (indicates the User Story to merge to the release branch)
                    var project = requestParams['project'];
                    this.client.triggerProjectWithCustomVariable(project, validatedIssueKey);
                    break;
                default:
                    throw errorMessage.invalidRequest('Unknown bamboo action: ' + action);
            }
        },
    }

    return requestBamboo;
};

module.exports = RequestBamboo
