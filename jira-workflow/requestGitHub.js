var errorMessage = require('./errorMessages');
var client = require('./githubClient');

/*
 * ConstructorRequestHandler
 */
function RequestGitHub() {

    var requestGitHub = {

        client: GitHubClient(),

        handleAction: function (action, requestParams) {

            switch (action) {
                case 'create_pull_request':
                    this.triggerProject(requestParams);
                    break;

                default:
                    throw errorMessage.invalidRequest('Unknown github action: ' + action);
            }
        },

        createPullRequest: function (requestParams) {
            this.client.createPullRequest(requestParams.repo, requestParams.head, requestParams.base, requestParams.title, requestParams.description);
        }
    }

    return requestGitHub;
};

module.exports = RequestGitHub